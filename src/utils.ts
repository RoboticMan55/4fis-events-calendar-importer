
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

export const extractByPattern = 
  (pattern: RegExp) => 
  (html: string): string | null => {
    const match = html.match(pattern);
    return match && match[1] 
      ? match[1].replace(/\s+/g, ' ').trim() 
      : null
  };

export const extractDetailLink =
  extractByPattern(/<a[^>]*\bhref=["']([^"']*)["']/i);

export const extractName =
  extractByPattern(/<h1[^>]*>\s*([^<]*)<\/h1/);

export const extractStartDateTime =
  extractByPattern(/Datum\s+a\s+čas:\s*<\/span>\s*<span[^>]*>([^<]+)<\/span>/i);

export const extractRegisterFrom =
  extractByPattern(/Registrace:\s*<\/span>\s*<span[^>]*>([^<]+)<\/span>/i);

export const extractPlace =
  extractByPattern(/Místo\s+události:\s*<\/span>\s*<span[^>]*>([^<]+)<\/span>/i);

export const extractDescription =
  extractByPattern(/O\s+akci\s*<\/h2>\s*<div[^>]*>([\s\S]*?)<\/div>/i);