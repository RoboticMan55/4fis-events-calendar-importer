import { fetchData } from "./src/network.js";
import { asArticleDetail, RawArticleDetail } from "./src/types/articleDetail.type.js";
import { isNone, isSome, none, some } from "./src/types/option.type.js";
import { asRawArticle } from "./src/types/rawArticle.type.js";
import { isErr, isOk } from "./src/types/result.type.js";
import { 
  extractDetailLink, 
  extractName,
  extractPlace,
  extractRegisterFrom,
  extractStartDateTime,
  extractDescription,
  getAllSubstringIndices, 
  zip 
} from "./src/utils.js";

async function main() {
  const DATA_SOURCE_URL = "https://4fis.cz/wp-admin/admin-ajax.php?action=example_ajax_request";
  const ARTICLE_OPENING_TAG = "<article";
  const ARTICLE_CLOSING_TAG = "</article>";

  const rawDataRes = await fetchData<{ data: string }>(
    DATA_SOURCE_URL,
    (raw: any) => {
      if (raw.data) return some({ data: raw.data })
      return none();
    },
    "POST"
  );

  if (isErr(rawDataRes)) {
    console.error("Error while fetching events", rawDataRes.error);
    return;
  }

  const rawDataOpt = rawDataRes.value;
  if (isNone(rawDataOpt)) {
    console.error("Failed to parse data");
    return;
  }

  const rawData = rawDataOpt.value;
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
      console.error(`Link is missing for ${article}`)
      return;
    }

    const detailUrl = article.detailLink.value;

    const rawDetailRes = await fetchData<RawArticleDetail>(
      detailUrl,
      (raw: any) => {
        if (typeof raw !== "string") return none();
        return some({
          rawContent: raw,
          detailLink: article.detailLink
        })
      },
      "POST",
      "TEXT"
    );

    if (isErr(rawDetailRes)) {
      console.warn(`Failed to fetch data for ${detailUrl}`, rawDetailRes.error);
      return;
    }

    const rawDetailOpt = rawDetailRes.value;
    if (isNone(rawDetailOpt)) {
      console.warn(`Received data in unexpected format for ${detailUrl}`);
      return;
    }

    const articleDetail = asArticleDetail({
      extractName,
      extractStartDateTime,
      extractRegisterFrom,
      extractPlace,
      extractDescription
    })(rawDetailOpt.value);
    
    return articleDetail
  });

  const results = await Promise.allSettled(articlePromises);
  results.forEach((res, idx) => {
    if (res.status === "rejected") {
      console.error(`Article at index ${idx} failed: `, res.reason)
    } else if (res.value) {
      console.log(`Succeeded for ${res.value.name}`)
    }
  })
}

main();