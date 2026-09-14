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
  RawArticleDetail, 
  unwrapOr 
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
  const articleBounds = zip(
    getAllSubstringIndices(rawData.data, ARTICLE_OPENING_TAG),
    getAllSubstringIndices(rawData.data, ARTICLE_CLOSING_TAG)
  );

  const rawArticlesWithLink = articleBounds.map((bound, _) => {
    const content = rawData.data.substring(
      bound.first, 
      bound.second + ARTICLE_CLOSING_TAG.length
    );
    
    return asRawArticle(
      { extractDetailLink }
    )(content);
  });

  const articlePromises = rawArticlesWithLink.map(async (article) => {
    if (isNone(article.detailLink)) {
      return err(`Link is missing for ${article}`);
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
  });

  const results = await Promise.allSettled(articlePromises);
  
  const failures = results.flatMap((res) => {
    if (res.status === "rejected") 
      return [`Unexpected error: ${res.reason}`];

    if (res.status === "fulfilled" && isErr(res.value))
      return [res.value.error];

    return [];
  });

  const events = results.flatMap((res) => 
    res.status === "fulfilled" && isOk(res.value) 
      ? [res.value.value] 
      : []
  );

  const calendar = createCalendar(events);
  try {
    await writeFile("4fis.ics", calendar.toString());
  } catch (error) {
    console.error("Error while writing calendar file:", error);
  }

  console.info(`Calendar file created with ${events.length} events. ${failures.length} failures occurred.`);
  if (failures.length > 0) {
    console.error("Failures:", failures);
  }
}

main();