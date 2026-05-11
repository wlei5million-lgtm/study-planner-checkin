import { useEffect, useState } from "react";
import { AppLayout, type AppView } from "./components/AppLayout";
import { EmptyState } from "./components/EmptyState";
import { createTask, exportAllData, importAllData, listSubjects, listTasksByDate, updateTask } from "./data/repositories";
import { ensureSeedData } from "./data/seed";
import { todayIso } from "./domain/date";
import { expandRepeatDates } from "./domain/repeatRules";
import { pauseTask, startTask, stopTask } from "./domain/timer";
import type { RepeatRule, StudyTask, Subject } from "./domain/types";
import { DashboardView } from "./features/dashboard/DashboardView";
import { PlannerView } from "./features/planner/PlannerView";
import { SettingsView } from "./features/settings/SettingsView";
import { StatsView } from "./features/stats/StatsView";

function newId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID()}`;
}

function readTextFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => resolve(String(reader.result ?? "")));
    reader.addEventListener("error", () => reject(reader.error ?? new Error("无法读取备份文件")));
    reader.readAsText(file);
  });
}

export default function App() {
  const [activeView, setActiveView] = useState<AppView>("dashboard");
  const [date, setDate] = useState(todayIso());
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [tasks, setTasks] = useState<StudyTask[]>([]);
  const [activeStartByTaskId, setActiveStartByTaskId] = useState<Record<string, string>>({});
  const [backupStatus, setBackupStatus] = useState("");

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
    await Promise.all(
      expandRepeatDates(input.repeatRule, date).map((plannedDate) =>
        createTask({
          id: newId("task"),
          title: input.title,
          content: input.content,
          subjectId: input.subjectId,
          plannedDurationMinutes: input.plannedDurationMinutes,
          plannedDate,
          actualDurationSeconds: 0,
          status: "planned",
          repeatRule: input.repeatRule,
          createdAt: now,
          updatedAt: now,
        }),
      ),
    );
    await refresh();
  }

  async function persistTask(task: StudyTask) {
    await updateTask(task);
    await refresh();
  }

  async function handleExportBackup() {
    const backup = await exportAllData();
    const blob = new Blob([backup], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `study-planner-backup-${date}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setBackupStatus("备份已下载");
  }

  async function handleImportBackupFile(file: File) {
    if (!window.confirm("导入会覆盖当前本地数据，确定继续吗？")) return;
    try {
      await importAllData(await readTextFile(file));
      await refresh();
      setBackupStatus("导入成功");
    } catch {
      setBackupStatus("备份文件格式不正确");
    }
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
        backupStatus={backupStatus}
        subjects={subjects}
        onExportBackup={handleExportBackup}
        onImportBackupFile={handleImportBackupFile}
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
