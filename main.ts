import {  isErr, isOk } from "./src/types/index.types.js";
import { createCalendar } from "./src/calendar.js";
import { extractArticles, getArticleDetail, getRawData, saveCalendarToFile } from "./src/scraper.js";
import { ICalCalendarMethod } from "ical-generator";

async function main() {
  const DATA_SOURCE_URL = "https://4fis.cz/wp-admin/admin-ajax.php?action=example_ajax_request";
  const ARTICLE_OPENING_TAG = "<article";
  const ARTICLE_CLOSING_TAG = "</article>";
  
  
  const rawData = await getRawData(DATA_SOURCE_URL);
  if (isErr(rawData)) {
    console.error("Error while fetching raw data", rawData.error);
    return;
  }
  
  const extractArticlesConfigured = extractArticles(ARTICLE_OPENING_TAG, ARTICLE_CLOSING_TAG);
  const rawArticlesWithLink = extractArticlesConfigured(rawData.value);

  const articlePromises = rawArticlesWithLink.map(getArticleDetail);
  const results = await Promise.allSettled(articlePromises);
  
  const events = results.flatMap((res) => 
    res.status === "fulfilled" && isOk(res.value) 
      ? [res.value.value] 
      : []
  );

  const failures = results.flatMap((res) => {
    if (res.status === "rejected") 
      return [`Unexpected error: ${res.reason}`];
    
    if (res.status === "fulfilled" && isErr(res.value))
      return [res.value.error];
    
    return [];
  });

  const createCalendarConfigured = createCalendar({ name: "4FIS Events", method: ICalCalendarMethod.ADD });
  
  const calendarRes = createCalendarConfigured(events);
  const saveRes = await saveCalendarToFile(calendarRes.calendar, "4fis.ics");

  if (isErr(saveRes)) {
    console.error("Error while saving calendar file", saveRes.error);
    return;
  }

  console.info(`Saved ${calendarRes.saved} events and ${calendarRes.registerFromSaved} registration events.`);
  if (failures.length > 0) {
    console.info(`${failures.length} failures occurred.`)
    console.error("Failures:", failures);
  }
}

main();