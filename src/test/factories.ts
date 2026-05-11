import type { StudyTask, Subject } from "../domain/types";

export function makeSubject(overrides: Partial<Subject> = {}): Subject {
  return {
    id: "subject-chinese",
    name: "语文",
    kind: "study",
    color: "#ef5b5b",
    icon: "book-open",
    sortOrder: 1,
    ...overrides,
  };
}

export function makeTask(overrides: Partial<StudyTask> = {}): StudyTask {
  return {
    id: "task-1",
    title: "晨读",
    subjectId: "subject-chinese",
    content: "复习古诗词并朗读课文",
    plannedDate: "2026-05-11",
    plannedDurationMinutes: 20,
    actualDurationSeconds: 0,
    status: "planned",
    repeatRule: { type: "none" },
    createdAt: "2026-05-11T08:00:00.000Z",
    updatedAt: "2026-05-11T08:00:00.000Z",
    ...overrides,
  };
}
