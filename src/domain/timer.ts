import type { StudyTask } from "./types";

function elapsedSeconds(startedAt: string, endedAt: string): number {
  return Math.max(0, Math.round((Date.parse(endedAt) - Date.parse(startedAt)) / 1000));
}

export function startTask(task: StudyTask, now: string): StudyTask {
  return {
    ...task,
    status: "running",
    updatedAt: now,
  };
}

export function pauseTask(task: StudyTask, startedAt: string, now: string): StudyTask {
  return {
    ...task,
    status: "paused",
    actualDurationSeconds: task.actualDurationSeconds + elapsedSeconds(startedAt, now),
    updatedAt: now,
  };
}

export function stopTask(task: StudyTask, startedAt: string, now: string): StudyTask {
  return {
    ...task,
    status: "completed",
    actualDurationSeconds: task.actualDurationSeconds + elapsedSeconds(startedAt, now),
    updatedAt: now,
  };
}
