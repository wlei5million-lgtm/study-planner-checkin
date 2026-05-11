import type { StudyTask, Subject } from "../domain/types";
import { appDb } from "./db";

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
