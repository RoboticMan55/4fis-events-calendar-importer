import ical, { ICalCalendar, ICalCalendarMethod } from "ical-generator";
import { writeFile } from "node:fs/promises";
import { fetchData } from "./src/network.js";
import { 
  extractDescription,
  extractDetailLink,
  extractName,
  extractPlace,
  extractRegisterFrom,
  extractStartDateTime,
  getAllSubstringIndices, 
  zip 
} from "./src/utils/index.utils.js";
import { 
  ArticleDetail, 
  asArticleDetail, 
  asRawArticle, 
  err, 
  isErr, 
  isNone, 
  isOk, 
  ok, 
  RawArticle, 
  RawArticleDetail,
  Result, 
} from "./src/types/index.types.js";
import { createCalendar } from "./src/calendar.js";

async function main() {
  const DATA_SOURCE_URL = "https://4fis.cz/wp-admin/admin-ajax.php?action=example_ajax_request";
  const ARTICLE_OPENING_TAG = "<article";
  const ARTICLE_CLOSING_TAG = "</article>";
  
  const rawDataRes = await fetchData<{ data: string }>(
    DATA_SOURCE_URL,
    (raw: any) => {
      if (raw.data) return ok({ data: raw.data })
        return err("Failed to extract data");
    },
    "POST"
  );
  
  if (isErr(rawDataRes)) {
    console.error("Error while fetching events", rawDataRes.error);
    return;
  }
  
  const rawData = rawDataRes.value;
  const rawArticlesWithLink = extractArticles(rawData.data, ARTICLE_OPENING_TAG, ARTICLE_CLOSING_TAG);
  
  const articlePromises = rawArticlesWithLink.map(
    async (article) => getArticleDetail(article)
  );
  const results = await Promise.allSettled(articlePromises);
  
  const events = results.flatMap((res) => 
    res.status === "fulfilled" && isOk(res.value) 
  ? [res.value.value] 
  : []
);

const calendar = createCalendar(events);
const saveRes = await saveCalendarToFile(calendar, "4fis.ics");

if (isErr(saveRes)) {
  console.error("Error while saving calendar file", saveRes.error);
  return;
}

const failures = results.flatMap((res) => {
  if (res.status === "rejected") 
    return [`Unexpected error: ${res.reason}`];
  
  if (res.status === "fulfilled" && isErr(res.value))
    return [res.value.error];
  
  return [];
});

console.info(`Calendar file created with ${events.length} events. ${failures.length} failures occurred.`);
if (failures.length > 0) {
  console.error("Failures:", failures);
}
}

function extractArticles(
  rawData: string,
  articleOpeningTag: string,
  articleClosingTag: string
): RawArticle[] {
  const articleBounds = zip(
    getAllSubstringIndices(rawData, articleOpeningTag),
    getAllSubstringIndices(rawData, articleClosingTag)
  );
  
  return articleBounds.map((bound, _) => {
    const content = rawData.substring(
      bound.first, 
      bound.second + articleClosingTag.length
    );
    
    return asRawArticle(
      { extractDetailLink }
    )(content);
  });
}

async function getArticleDetail(
  article: RawArticle
): Promise<Result<ArticleDetail, string>> {
  if (isNone(article.detailLink)) {
    return err(`Link is missing for ${JSON.stringify(article)}`);
  }
  
  const detailUrl = article.detailLink.value;
  
  const rawDetailRes = await fetchData<RawArticleDetail>(
    detailUrl,
    (raw: any) => {
      if (typeof raw !== "string") 
        return err("Returned data is not parsable as string");
      
      return ok({
        rawContent: raw,
        detailLink: article.detailLink
      })
    },
    "POST",
    "TEXT"
  );
  
  if (isErr(rawDetailRes)) {
    return err(`Failed to fetch data for ${detailUrl}`);
  }
  
  const articleDetail = asArticleDetail({
    extractName,
    extractStartDateTime,
    extractRegisterFrom,
    extractPlace,
    extractDescription
  })(rawDetailRes.value);
  
  return ok(articleDetail);
}

async function saveCalendarToFile(
  calendar: ICalCalendar, 
  fileName: string
): Promise<Result<void, string>> {
  try {
    await writeFile(fileName, calendar.toString());
    return ok();
  } catch (error) {
    return err("Failed to write calendar file");
  }
}

main();