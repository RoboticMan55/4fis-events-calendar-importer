import ical, { ICalCalendar, ICalCalendarMethod } from "ical-generator";
import { ArticleDetail, unwrapOr } from "./types/index.types.js";

export type CalendarConfig = {
  name: string;
  method: ICalCalendarMethod;
}

export const createCalendar = (
  config: CalendarConfig
) => (events: ArticleDetail[]): ICalCalendar => {
  const calendar = ical({ 
    name: config.name,
    method: config.method
  });

  events.forEach((event) => {
    calendar.createEvent({
      summary: event.name,
      start: event.startDateTime,
      end: event.endDateTime,
      url: event.detailLink,
      id: event.id,
      description: unwrapOr(event.description, ""),
      location: unwrapOr(event.place, ""),
    });
  });

  return calendar;
}
