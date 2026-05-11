import { MetricCard } from "../../components/MetricCard";
import { formatDisplayDate } from "../../domain/date";
import { buildDashboardSummary } from "../../domain/taskStats";
import type { StudyTask, Subject } from "../../domain/types";

type DashboardViewProps = {
  date: string;
  subjects: Subject[];
  tasks: StudyTask[];
};

function hours(seconds: number): string {
  return `${(seconds / 3600).toFixed(1)}h`;
}

export function DashboardView({ date, subjects, tasks }: DashboardViewProps) {
  const summary = buildDashboardSummary(tasks, subjects, date);

  return (
    <section className="view-stack">
      <header className="section-header">
        <div>
          <p className="eyebrow-dark">今日概览</p>
          <h1>{formatDisplayDate(date)}</h1>
        </div>
      </header>
      <div className="metric-grid">
        <MetricCard label="今日学习" value={hours(summary.studySeconds)} />
        <MetricCard label="运动户外" value={hours(summary.sportsSeconds)} />
        <MetricCard label="今日任务" value={`${summary.completedTasks}/${summary.totalTasks}`} />
        <MetricCard label="完成率" value={`${summary.completionRate}%`} />
      </div>
    </section>
  );
}
