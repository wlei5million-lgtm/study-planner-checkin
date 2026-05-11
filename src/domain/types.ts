export type SubjectKind = "study" | "sports" | "entertainment";

export type Subject = {
  id: string;
  name: string;
  kind: SubjectKind;
  color: string;
  icon: string;
  sortOrder: number;
};

export type TaskStatus = "planned" | "running" | "paused" | "completed";

export type RepeatRule =
  | { type: "none" }
  | { type: "daily"; startDate: string; endDate: string }
  | { type: "weekly"; weekdays: number[]; startDate: string; endDate: string }
  | { type: "workdays"; startDate: string; endDate: string };

export type StudyTask = {
  id: string;
  title: string;
  subjectId: string;
  content: string;
  plannedDate: string;
  plannedDurationMinutes: number;
  actualDurationSeconds: number;
  status: TaskStatus;
  repeatRule: RepeatRule;
  createdAt: string;
  updatedAt: string;
};

export type TimerSession = {
  id: string;
  taskId: string;
  startedAt: string;
  endedAt?: string;
  durationSeconds: number;
  status: "running" | "paused" | "stopped";
};
