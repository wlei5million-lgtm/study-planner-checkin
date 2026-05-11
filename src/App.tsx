import { useEffect, useState } from "react";
import { AppLayout, type AppView } from "./components/AppLayout";
import { EmptyState } from "./components/EmptyState";
import { createTask, exportAllData, importAllData, listSubjects, listTasksByDate, updateTask } from "./data/repositories";
import { ensureSeedData } from "./data/seed";
import { todayIso } from "./domain/date";
import { pauseTask, startTask, stopTask } from "./domain/timer";
import type { RepeatRule, StudyTask, Subject } from "./domain/types";
import { DashboardView } from "./features/dashboard/DashboardView";
import { PlannerView } from "./features/planner/PlannerView";
import { SettingsView } from "./features/settings/SettingsView";
import { StatsView } from "./features/stats/StatsView";

function newId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID()}`;
}

export default function App() {
  const [activeView, setActiveView] = useState<AppView>("dashboard");
  const [date, setDate] = useState(todayIso());
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [tasks, setTasks] = useState<StudyTask[]>([]);
  const [activeStartByTaskId, setActiveStartByTaskId] = useState<Record<string, string>>({});
  const [backupText, setBackupText] = useState("");

  async function refresh() {
    await ensureSeedData();
    setSubjects(await listSubjects());
    setTasks(await listTasksByDate(date));
  }

  useEffect(() => {
    void refresh();
  }, [date]);

  async function handleCreateTask(input: {
    title: string;
    content: string;
    plannedDurationMinutes: number;
    subjectId: string;
    repeatRule: RepeatRule;
  }) {
    const now = new Date().toISOString();
    await createTask({
      id: newId("task"),
      title: input.title,
      content: input.content,
      subjectId: input.subjectId,
      plannedDurationMinutes: input.plannedDurationMinutes,
      plannedDate: date,
      actualDurationSeconds: 0,
      status: "planned",
      repeatRule: { type: "none" },
      createdAt: now,
      updatedAt: now,
    });
    await refresh();
  }

  async function persistTask(task: StudyTask) {
    await updateTask(task);
    await refresh();
  }

  const content =
    activeView === "dashboard" ? (
      <DashboardView date={date} subjects={subjects} tasks={tasks} />
    ) : activeView === "planner" ? (
      <PlannerView
        date={date}
        subjects={subjects}
        tasks={tasks}
        onCreateTask={handleCreateTask}
        onDateChange={setDate}
        onStartTask={(task) => {
          const now = new Date().toISOString();
          setActiveStartByTaskId((current) => ({ ...current, [task.id]: now }));
          void persistTask(startTask(task, now));
        }}
        onPauseTask={(task) => {
          const now = new Date().toISOString();
          const startedAt = activeStartByTaskId[task.id] ?? now;
          void persistTask(pauseTask(task, startedAt, now));
        }}
        onStopTask={(task) => {
          const now = new Date().toISOString();
          const startedAt = activeStartByTaskId[task.id] ?? now;
          void persistTask(stopTask(task, startedAt, now));
        }}
      />
    ) : activeView === "stats" ? (
      <StatsView subjects={subjects} tasks={tasks} />
    ) : activeView === "settings" ? (
      <SettingsView
        backupText={backupText}
        subjects={subjects}
        onBackupTextChange={setBackupText}
        onExportBackup={async () => setBackupText(await exportAllData())}
        onImportBackup={async () => {
          await importAllData(backupText);
          await refresh();
        }}
      />
    ) : (
      <EmptyState title="好学伴" description="学习计划与打卡统计助手" />
    );

  return (
    <AppLayout activeView={activeView} onViewChange={setActiveView}>
      {content}
    </AppLayout>
  );
}
