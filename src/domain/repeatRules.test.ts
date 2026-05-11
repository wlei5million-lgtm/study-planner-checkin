import { describe, expect, it } from "vitest";
import { expandRepeatDates } from "./repeatRules";

describe("expandRepeatDates", () => {
  it("returns the planned date for non-repeating tasks", () => {
    expect(expandRepeatDates({ type: "none" }, "2026-05-11")).toEqual(["2026-05-11"]);
  });

  it("expands daily dates inclusively", () => {
    expect(expandRepeatDates({ type: "daily", startDate: "2026-05-11", endDate: "2026-05-13" }, "2026-05-11")).toEqual([
      "2026-05-11",
      "2026-05-12",
      "2026-05-13",
    ]);
  });

  it("expands workdays only", () => {
    expect(expandRepeatDates({ type: "workdays", startDate: "2026-05-11", endDate: "2026-05-17" }, "2026-05-11")).toEqual([
      "2026-05-11",
      "2026-05-12",
      "2026-05-13",
      "2026-05-14",
      "2026-05-15",
    ]);
  });

  it("expands selected weekdays where Monday is 1", () => {
    expect(expandRepeatDates({ type: "weekly", weekdays: [1, 3], startDate: "2026-05-11", endDate: "2026-05-17" }, "2026-05-11")).toEqual([
      "2026-05-11",
      "2026-05-13",
    ]);
  });
});
