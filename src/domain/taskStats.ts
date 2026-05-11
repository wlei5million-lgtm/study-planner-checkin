import type { StudyTask, Subject } from "./types";

export type DashboardSummary = {
  studySeconds: number;
  sportsSeconds: number;
  completedTasks: number;
  totalTasks: number;
  completionRate: number;
};

export function buildDashboardSummary(tasks: StudyTask[], subjects: Subject[], date: string): DashboardSummary {
  const subjectById = new Map(subjects.map((subject) => [subject.id, subject]));
  const dailyTasks = tasks.filter((task) => task.plannedDate === date);
  const completedTasks = dailyTasks.filter((task) => task.status === "completed").length;

  return {
    studySeconds: sumByKind(dailyTasks, subjectById, "study"),
    sportsSeconds: sumByKind(dailyTasks, subjectById, "sports"),
    completedTasks,
    totalTasks: dailyTasks.length,
    completionRate: dailyTasks.length === 0 ? 0 : Math.round((completedTasks / dailyTasks.length) * 100),
  };
}

function sumByKind(tasks: StudyTask[], subjectById: Map<string, Subject>, kind: Subject["kind"]): number {
  return tasks
    .filter((task) => subjectById.get(task.subjectId)?.kind === kind)
    .reduce((total, task) => total + task.actualDurationSeconds, 0);
}

export function buildTimeBySubject(tasks: StudyTask[], subjects: Subject[]) {
  return subjects.map((subject) => ({
    subjectId: subject.id,
    subjectName: subject.name,
    seconds: tasks
      .filter((task) => task.subjectId === subject.id)
      .reduce((total, task) => total + task.actualDurationSeconds, 0),
  }));
}
