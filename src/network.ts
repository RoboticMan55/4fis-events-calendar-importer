import { err, Result } from './types/index.types.js';

export async function fetchData<T>(
  url: string,
  parseData: (raw: any) => Result<T, string>,
  method: "GET" | "POST" = "GET",
  mode: "JSON" | "TEXT" = "JSON"
): Promise<Result<T, string>> {
  let response: Response;
  try {
    response = await fetch(url, {
      method,
      headers: {
        "User-Agent": "Mozilla/5.0 (platform; rv:gecko-version) Gecko/gecko-trail Firefox/firefox-version"
      }
    });
  } catch (_) {
    return err("Fetch error")
  }
  
  if (!response.ok) {
    return err(`HTTP error! status: ${response.status}`);
  }
  
  let raw: unknown;
  try {
    raw = mode == "JSON" 
      ? await response.json() 
      : await response.text()
  } catch (_) {
    return err("Parse error")
  }
  
  return parseData(raw);
}
