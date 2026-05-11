import { describe, expect, it } from "vitest";
import { makeTask } from "../test/factories";
import { pauseTask, startTask, stopTask } from "./timer";

describe("timer transitions", () => {
  it("starts a planned task", () => {
    const task = startTask(makeTask(), "2026-05-11T08:00:00.000Z");
    expect(task.status).toBe("running");
    expect(task.updatedAt).toBe("2026-05-11T08:00:00.000Z");
  });

  it("pauses a running task and adds elapsed seconds", () => {
    const task = pauseTask(
      makeTask({ status: "running", actualDurationSeconds: 60 }),
      "2026-05-11T08:00:00.000Z",
      "2026-05-11T08:05:00.000Z",
    );
    expect(task.status).toBe("paused");
    expect(task.actualDurationSeconds).toBe(360);
  });

  it("stops a running task as completed", () => {
    const task = stopTask(
      makeTask({ status: "running" }),
      "2026-05-11T08:00:00.000Z",
      "2026-05-11T08:20:00.000Z",
    );
    expect(task.status).toBe("completed");
    expect(task.actualDurationSeconds).toBe(1200);
  });
});
