import { Option } from './types/option.type.js'
import { err, ok, Result } from './types/result.type.js';

export async function fetchData<T>(
  url: string,
  parseData: (raw: any) => Option<T>,
  method: "GET" | "POST" = "GET",
  mode: "JSON" | "TEXT" = "JSON"
): Promise<Result<Option<T>, string>> {
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
  
  return ok(parseData(raw));
}
