import { describe, expect, it } from "vitest";
import { makeSubject, makeTask } from "../test/factories";
import { buildDashboardSummary, buildTimeBySubject } from "./taskStats";

describe("task statistics", () => {
  const subjects = [
    makeSubject({ id: "chinese", name: "语文", kind: "study" }),
    makeSubject({ id: "sports", name: "运动", kind: "sports" }),
  ];

  it("builds dashboard summary for a date", () => {
    const tasks = [
      makeTask({ id: "1", subjectId: "chinese", plannedDate: "2026-05-11", actualDurationSeconds: 1200, status: "completed" }),
      makeTask({ id: "2", subjectId: "sports", plannedDate: "2026-05-11", actualDurationSeconds: 600, status: "planned" }),
      makeTask({ id: "3", subjectId: "chinese", plannedDate: "2026-05-12", actualDurationSeconds: 300, status: "completed" }),
    ];

    expect(buildDashboardSummary(tasks, subjects, "2026-05-11")).toEqual({
      studySeconds: 1200,
      sportsSeconds: 600,
      completedTasks: 1,
      totalTasks: 2,
      completionRate: 50,
    });
  });

  it("groups actual time by subject", () => {
    const tasks = [
      makeTask({ subjectId: "chinese", actualDurationSeconds: 1200 }),
      makeTask({ subjectId: "sports", actualDurationSeconds: 600 }),
    ];

    expect(buildTimeBySubject(tasks, subjects)).toEqual([
      { subjectId: "chinese", subjectName: "语文", seconds: 1200 },
      { subjectId: "sports", subjectName: "运动", seconds: 600 },
    ]);
  });
});
