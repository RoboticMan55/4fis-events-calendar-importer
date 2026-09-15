import { Option, none, some } from "../types/index.types.js";

export function getAllSubstringIndices(
  haystack: string,
  needle: string
): number[] {
  const indices: number[] = [];
  let index = 0;
  
  while ((index = haystack.indexOf(needle, index)) !== -1) {
    indices.push(index);
    index += needle.length;
  }    
  
  return indices;
}    

export const extractByPattern = 
  (pattern: RegExp) => 
  (html: string): Option<string> => {
    const match = html.match(pattern);
    return match && match[1] 
      ? some(match[1].replace(/\s+/g, ' ').trim()) 
      : none()
  };

export const extractDetailLink =
  extractByPattern(/<a[^>]*\bhref=["']([^"']*)["']/i);

export const extractName =
  extractByPattern(/<h1[^>]*>\s*([^<]*)<\/h1/);

export const extractStartDateTime =
  extractByPattern(/Datum\s+a\s+čas:\s*<\/span>\s*<span[^>]*>([^<]+)<\/span>/i);

export const extractDate =
  extractByPattern(/\s*(\d{1,2}\s*[.-]\s*\d{1,2}\s*[.-](?:\s*\d{4})?)/);

export const extractTime = 
  extractByPattern(/\s*(\d{1,2}:\d{2})/)

export const extractRegisterFrom =
  extractByPattern(/Registrace:\s*<\/span>\s*<span[^>]*>([^<]+)<\/span>/i);

export const extractPlace =
  extractByPattern(/Místo\s+události:\s*<\/span>\s*<span[^>]*>([^<]+)<\/span>/i);

export const extractDescription =
  extractByPattern(/O\s+akci\s*<\/h2>\s*<div[^>]*>([\s\S]*?)<\/div>/i);
