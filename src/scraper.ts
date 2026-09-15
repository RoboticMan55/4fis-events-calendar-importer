import { ICalCalendar } from "ical-generator";
import { fetchData } from "./network.js";
import { 
  ArticleDetail,
  Result,
  RawArticle,
  asRawArticle,
  isNone,
  err,
  RawArticleDetail,
  ok,
  isErr,
  asArticleDetail 
} from "./types/index.types.js";
import { 
  extractDescription,
  extractDetailLink,
  extractName,
  extractPlace,
  extractRegisterFrom,
  extractStartDateTime,
  getAllSubstringIndices,
  zip 
} from "./utils/index.utils.js";
import { writeFile } from "fs/promises";

export async function getRawData(
  url: string
): Promise<Result<string, string>> {
  const rawDataRes = await fetchData<{ data: string }>(
    url,
    (raw: any) => {
      if (raw.data) return ok({ data: raw.data })
        return err("Failed to extract data");
    },
    "POST"
  );
  
  if (isErr(rawDataRes)) {
    console.error("Error while fetching events", rawDataRes.error);
    return err("Failed to fetch raw data");
  }
  
  const rawData = rawDataRes.value;
  return ok(rawData.data);
}

export async function getArticleDetail(
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

export const extractArticles = (
  articleOpeningTag: string,
  articleClosingTag: string
) => (rawData: string): RawArticle[] => {
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

export async function saveCalendarToFile(
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