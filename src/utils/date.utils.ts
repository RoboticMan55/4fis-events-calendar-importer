import { Option, isNone, none, some } from "../types/index.types.js";
import { extractDate, extractTime } from "./extract.utils.js";

export const parseDate = (dateTimeStr: Option<string>): Option<Date> => {
  if (isNone(dateTimeStr))
    return none();

  const dateStrOpt = extractDate(dateTimeStr.value);
  const timeStrOpt = extractTime(dateTimeStr.value);

  if (isNone(dateStrOpt))
    return none();
  
  let [day, month, year] = dateStrOpt.value.split(/[.\-]/).map(Number);

  // If year is not provided, assume the current year
  if (Number.isNaN(year))
    year = new Date().getFullYear();

  if (isNone(timeStrOpt))
    return some(new Date(year, month - 1, day))

  const [hours, minutes] = timeStrOpt.value.split(':').map(Number);
  return some(new Date(year, month - 1, day, hours, minutes));
};

export const endOfDay = (date: Date): Date => {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
};
