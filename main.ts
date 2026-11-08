import {  isErr, isOk } from "./src/types/index.types.js";
import { createCalendar4Fis } from "./src/calendar.js";
import { extractHtmlArticleTagContents, getArticleDetail, getRawData, saveCalendarToFile } from "./src/scraper.js";

async function main() {
  const DATA_SOURCE_URL = "https://4fis.cz/wp-admin/admin-ajax.php?action=example_ajax_request";
  
  const rawData = await getRawData(DATA_SOURCE_URL);
  if (isErr(rawData)) {
    console.error("Error while fetching raw data", rawData.error);
    return;
  }
  
  const articlePromises = await Promise.allSettled(
    extractHtmlArticleTagContents(rawData.value)
      .map(getArticleDetail)
    );
  
  const events = articlePromises.flatMap((res) => 
    res.status === "fulfilled" && isOk(res.value) 
      ? [res.value.value] 
      : []
  );

  const failures = articlePromises.flatMap((res) => {
    if (res.status === "rejected") 
      return [`Unexpected error: ${res.reason}`];
    
    if (res.status === "fulfilled" && isErr(res.value))
      return [res.value.error];
    
    return [];
  });
  
  const calendarRes = createCalendar4Fis(events);
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