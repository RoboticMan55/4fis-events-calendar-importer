import { Option, none, some } from "../types/index.types.js";

export const parseDate = (dateStr: Option<string>): Option<Date> => {
  if (dateStr.some) {
    const date = new Date(dateStr.value);
    return isNaN(date.getTime()) ? none() : some(date);
  }
  return none();
};

export const endOfDay = (date: Date): Date => {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
};