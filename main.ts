import { fetchData } from "./src/network.js";
import { asArticleDetail, RawArticleDetail } from "./src/types/articleDetail.type.js";
import { asRawArticle } from "./src/types/rawArticle.type.js";
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

const DATA_SOURCE_URL = "https://4fis.cz/wp-admin/admin-ajax.php?action=example_ajax_request";
const ARTICLE_OPENING_TAG = "<article";
const ARTICLE_CLOSING_TAG = "</article>";

const rawData = await fetchData<{ data: string }>(
  DATA_SOURCE_URL,
  (raw: any) => {
    if (raw.data) return { data: raw.data }
    return null;
  },
  "POST"
);

if (!rawData) {
  throw new Error("Received data in unexpected format;")
}

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

const articleWithLink = rawArticlesWithLink[0];

if (!articleWithLink.detailLink) {
  throw new Error("Missing link");
}

const rawArticleDetail = await fetchData<RawArticleDetail>(
  articleWithLink.detailLink,
  (raw: any) => {
    if (typeof raw !== "string") return null;
    return {
      rawContent: raw,
      detailLink: articleWithLink.detailLink
    }
  },
  "POST",
  "TEXT"
);

if (!rawArticleDetail) {
  throw new Error("Received data in unexpected format;")
}

const articleDetail = asArticleDetail({
  extractName,
  extractStartDateTime,
  extractRegisterFrom,
  extractPlace,
  extractDescription
})(rawArticleDetail);

console.log(articleDetail);
