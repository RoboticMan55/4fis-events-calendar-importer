import { Option, isNone, none, some, unwrapOr } from "../types/index.types.js";
import { extractDate, extractTime } from "./extract.utils.js";

export type ParseDateConfig = {
  inferTime: "startOfDay" | "endOfDay"
}

export const parseDate = ({ 
  inferTime = "endOfDay"
}: ParseDateConfig) => (dateTimeStr: Option<string>): Option<Date> => {
  if (isNone(dateTimeStr))
    return none();

  const dateStrOpt = extractDate(dateTimeStr.value);
  const timeStrOpt = extractTime(dateTimeStr.value);

  if (isNone(dateStrOpt))
    return none();
  
  let [day, month, year] = dateStrOpt.value.split(/[.\-]/).map(Number);

  // If year is not provided, assume the current year
  if (!year)
    year = new Date().getFullYear();

  if (isNone(timeStrOpt)) {
    switch (inferTime) {
      case "endOfDay":
        return some(endOfDay(new Date(year, month - 1, day)))
      case "startOfDay":
        return some(startOfDay(new Date(year, month - 1, day, 0, 0, 0, 0)))
      default:
        throw Error("Check is not exhaustive")
    } 
  }

  const [hours, minutes] = timeStrOpt.value.split(':').map(Number);
  return some(new Date(year, month - 1, day, hours, minutes));
};

export const parseDateDayStart = parseDate({ inferTime: "startOfDay" })
export const parseDateDayEnd = parseDate({ inferTime: "endOfDay" })

export const endOfDay = (date: Date): Date => {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
};

export const startOfDay = (date: Date): Date => {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}