import { fetchData } from "./src/network.js";
import { asRawArticleWithLink } from "./src/types.js";
import { extractDetailLink, getAllSubstringIndices, zip } from "./src/utils.js";

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
    
    return asRawArticleWithLink(
        content,
        extractDetailLink
    );
});

console.log(rawArticlesWithLink)


const articleWithLink = rawArticlesWithLink[0];

if (!articleWithLink.detailLink) {
    throw new Error("Missing link");
}

const rawArticle = await fetchData<string>(
    articleWithLink.detailLink,
    (raw: any) => {
        if (typeof raw === "string") return raw;
        return null
    },
    "POST",
    "TEXT"
);

console.log(rawArticle);