import type { Subject } from "../domain/types";
import { listSubjects, replaceSubjects } from "./repositories";

export const defaultSubjects: Subject[] = [
  { id: "subject-chinese", name: "语文", kind: "study", color: "#ef5b5b", icon: "book-open", sortOrder: 1 },
  { id: "subject-math", name: "数学", kind: "study", color: "#5c7cfa", icon: "calculator", sortOrder: 2 },
  { id: "subject-english", name: "英语", kind: "study", color: "#f59f00", icon: "languages", sortOrder: 3 },
  { id: "subject-sports", name: "运动", kind: "sports", color: "#37b24d", icon: "activity", sortOrder: 4 },
  { id: "subject-entertainment", name: "娱乐", kind: "entertainment", color: "#ae3ec9", icon: "smile", sortOrder: 5 },
];

export async function ensureSeedData(): Promise<void> {
  const subjects = await listSubjects();
  if (subjects.length === 0) await replaceSubjects(defaultSubjects);
}
