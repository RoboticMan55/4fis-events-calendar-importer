import ical, { ICalCalendar, ICalCalendarMethod } from "ical-generator";
import { ArticleDetail, isSome, unwrapOr } from "./types/index.types.js";
import { endOfDay } from "./utils/index.utils.js";

export type CalendarConfig = {
  name: string;
  method: ICalCalendarMethod;
}

export type CalendarSaveResult = {
  calendar: ICalCalendar;
  saved: number;
  registerFromSaved: number;
}

export const createCalendar = (
  config: CalendarConfig
) => (events: ArticleDetail[]): CalendarSaveResult => {
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

    if (isSome(event.registerFrom)) {
      calendar.createEvent({
        summary: `Registrace pro ${event.name}`,
        start: event.registerFrom.value,
        end: endOfDay(event.registerFrom.value),
        url: event.detailLink,
        id: `${event.id}-registration`,
        description: unwrapOr(event.description, ""),
      });
    }
  });

  return {
    calendar,
    saved: events.length,
    registerFromSaved: events.filter((e) => isSome(e.registerFrom)).length
  };
}
