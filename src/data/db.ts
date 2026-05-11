import Dexie, { type Table } from "dexie";
import type { StudyTask, Subject, TimerSession } from "../domain/types";

export class StudyPlannerDb extends Dexie {
  subjects!: Table<Subject, string>;
  tasks!: Table<StudyTask, string>;
  timerSessions!: Table<TimerSession, string>;

  constructor() {
    super("study-planner-db");
    this.version(1).stores({
      subjects: "id, sortOrder, kind",
      tasks: "id, plannedDate, subjectId, status",
      timerSessions: "id, taskId, status",
    });
  }
}

export const appDb = new StudyPlannerDb();
