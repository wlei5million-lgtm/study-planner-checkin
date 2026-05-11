import { addDays, format, parseISO } from "date-fns";

export function todayIso(now = new Date()): string {
  return format(now, "yyyy-MM-dd");
}

export function addDaysIso(date: string, days: number): string {
  return format(addDays(parseISO(date), days), "yyyy-MM-dd");
}

export function formatDisplayDate(date: string): string {
  return format(parseISO(date), "yyyy年M月d日");
}
