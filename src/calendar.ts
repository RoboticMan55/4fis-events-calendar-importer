import ical, { ICalCalendar, ICalCalendarMethod } from "ical-generator";
import { ArticleDetail, unwrapOr } from "./types/index.types.js";
import { WithLogs } from "./types/withLogs.types.js";

export type CalendarConfig = {
  name: string;
  method: ICalCalendarMethod;
}

export const createCalendar = (
  config: CalendarConfig
) => (events: ArticleDetail[]): WithLogs<ICalCalendar> => {
  const calendar = ical({ 
    name: config.name,
    method: config.method
  });

  const logs: string[] = [];
  events.forEach((event) => {
    if (!event.startDateTime.some) {
      logs.push(`Event "${event.name}" is missing a start date/time. Skipping.`);
      return;
    }

    const start = event.startDateTime.value;
    const end = event.endDateTime.some ? event.endDateTime.value : start;

    calendar.createEvent({
      start,
      end,
      summary: event.name,
      description: unwrapOr(event.description, ""),
      location: unwrapOr(event.place, ""),
      url: event.detailLink,
      id: event.id,
    });
  });

  return { value: calendar, logs };
}
