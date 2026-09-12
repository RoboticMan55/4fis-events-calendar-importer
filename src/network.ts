export async function fetchData<T>(
    url: string,
    parseData: (raw: any) => T | null,
    method: "GET" | "POST" = "GET",
    mode: "JSON" | "TEXT" = "JSON"
) {
    const response = await fetch(url, {
        method,
        headers: {
            "User-Agent": "Mozilla/5.0 (platform; rv:gecko-version) Gecko/gecko-trail Firefox/firefox-version"
        }
    });
    
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const raw = mode == "JSON" 
        ? await response.json() : await response.text()
    
    return parseData(raw);
}
