import { RawArticleWithLink } from "./types.js";

export function zip<T, U>(
    first: T[], 
    second: U[]
): { first: T, second: U }[] {
    const pairsCount = Math.min(first.length, second.length);

    return first.slice(0, pairsCount).map((item, i) => ({
        first: item,
        second: second[i]
    })) 
}

export function getAllSubstringIndices(haystack: string, needle: string): number[] {
    const indices: number[] = [];
    let index = 0;

    while ((index = haystack.indexOf(needle, index)) !== -1) {
        indices.push(index);
        index += needle.length;
    }    

    return indices;
}    

export const extractByPattern = (html: string, pattern: RegExp) => {
    const match = html.match(pattern);
    return match && match[1] ? match[1].trim() : null
}

export const extractDetailLink = (html: string) =>
    extractByPattern(html, /<a[^>]*\bhref=["']([^"']*)["']/i)

export const extractName = (rawArticle: RawArticleWithLink) => 
    extractByPattern(rawArticle.rawContent, /<h2[^>]*>\s*([^<]*)<\/h2/);

export const extractStartDateTime = (rawArticle: RawArticleWithLink) => 
    extractByPattern(rawArticle.rawContent, /a/);

export const extractRegisterFrom = (rawArticle: RawArticleWithLink) => 
    extractByPattern(rawArticle.rawContent, /a/);

export const extractPlace = (rawArticle: RawArticleWithLink) => 
    extractByPattern(rawArticle.rawContent, /a/);