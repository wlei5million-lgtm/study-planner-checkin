import { describe, expect, it } from "vitest";
import { addDaysIso, formatDisplayDate, todayIso } from "./date";

describe("date helpers", () => {
  it("adds days to an ISO date", () => {
    expect(addDaysIso("2026-05-11", 1)).toBe("2026-05-12");
    expect(addDaysIso("2026-05-11", -1)).toBe("2026-05-10");
  });

  it("formats display date in Chinese", () => {
    expect(formatDisplayDate("2026-05-11")).toBe("2026年5月11日");
  });

  it("returns a stable ISO date shape for today", () => {
    expect(todayIso()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
