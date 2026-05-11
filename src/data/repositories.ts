import type { StudyTask, Subject } from "../domain/types";
import { appDb } from "./db";

export type AppBackup = {
  version: 1;
  exportedAt: string;
  subjects: Subject[];
  tasks: StudyTask[];
};

export async function listSubjects(): Promise<Subject[]> {
  return appDb.subjects.orderBy("sortOrder").toArray();
}

export async function replaceSubjects(subjects: Subject[]): Promise<void> {
  await appDb.transaction("rw", appDb.subjects, async () => {
    await appDb.subjects.clear();
    await appDb.subjects.bulkPut(subjects);
  });
}

export async function createTask(task: StudyTask): Promise<void> {
  await appDb.tasks.put(task);
}

export async function updateTask(task: StudyTask): Promise<void> {
  await appDb.tasks.put(task);
}

export async function listTasksByDate(date: string): Promise<StudyTask[]> {
  return appDb.tasks.where("plannedDate").equals(date).sortBy("createdAt");
}

export async function listAllTasks(): Promise<StudyTask[]> {
  return appDb.tasks.toArray();
}

export async function exportAllData(): Promise<string> {
  const backup: AppBackup = {
    version: 1,
    exportedAt: new Date().toISOString(),
    subjects: await listSubjects(),
    tasks: await listAllTasks(),
  };

  return JSON.stringify(backup, null, 2);
}

export async function importAllData(rawBackup: string): Promise<void> {
  const parsed = JSON.parse(rawBackup) as Partial<AppBackup>;
  if (parsed.version !== 1 || !Array.isArray(parsed.subjects) || !Array.isArray(parsed.tasks)) {
    throw new Error("备份文件格式不正确");
  }

  await appDb.transaction("rw", appDb.subjects, appDb.tasks, async () => {
    await appDb.subjects.clear();
    await appDb.tasks.clear();
    await appDb.subjects.bulkPut(parsed.subjects as Subject[]);
    await appDb.tasks.bulkPut(parsed.tasks as StudyTask[]);
  });
}
