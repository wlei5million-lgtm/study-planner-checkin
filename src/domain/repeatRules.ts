import { eachDayOfInterval, format, getDay, parseISO } from "date-fns";
import type { RepeatRule } from "./types";

function toIso(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

function weekdayNumber(date: Date): number {
  const day = getDay(date);
  return day === 0 ? 7 : day;
}

export function expandRepeatDates(rule: RepeatRule, plannedDate: string): string[] {
  if (rule.type === "none") return [plannedDate];

  const days = eachDayOfInterval({
    start: parseISO(rule.startDate),
    end: parseISO(rule.endDate),
  });

  if (rule.type === "daily") return days.map(toIso);

  if (rule.type === "workdays") {
    return days.filter((day) => weekdayNumber(day) <= 5).map(toIso);
  }

  return days.filter((day) => rule.weekdays.includes(weekdayNumber(day))).map(toIso);
}
