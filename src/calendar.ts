import ical, { ICalCalendar, ICalCalendarMethod } from "ical-generator";
import { ArticleDetail, unwrapOr } from "./types/index.types.js";

export function createCalendar(events: ArticleDetail[]): ICalCalendar {
  const calendar = ical({ 
    name: "4FIS Events",
    method: ICalCalendarMethod.ADD
  });

  events.forEach((event) => {
    const startDate: Date = unwrapOr(event.startDateTime, new Date("1970-01-01T00:00:00Z"));
    const endDate: Date = unwrapOr(event.endDateTime, new Date("1970-01-01T00:00:00Z"));

    let start: Date | string = startDate;
    let end: Date | string = endDate;

    if (start.getTime() === new Date("1970-01-01T00:00:00Z").getTime())
      start = "Not announced yet";

    if (end.getTime() === new Date("1970-01-01T00:00:00Z").getTime())
      end = "Not announced yet";

    calendar.createEvent({
      start,
      end,
      summary: event.name,
      description: unwrapOr(event.description, ""),
      location: unwrapOr(event.place, ""),
      url: event.detailLink
    });
  });

  return calendar;
}
