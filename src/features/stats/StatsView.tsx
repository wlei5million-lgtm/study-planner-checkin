import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { buildTimeBySubject } from "../../domain/taskStats";
import type { StudyTask, Subject } from "../../domain/types";

type StatsViewProps = {
  subjects: Subject[];
  tasks: StudyTask[];
};

function hours(seconds: number): string {
  return `${(seconds / 3600).toFixed(1)}h`;
}

export function StatsView({ subjects, tasks }: StatsViewProps) {
  const rows = buildTimeBySubject(tasks, subjects).map((row) => ({
    ...row,
    hours: Number((row.seconds / 3600).toFixed(2)),
  }));

  return (
    <section className="view-stack">
      <header className="section-header">
        <div>
          <p className="eyebrow-dark">学习分布</p>
          <h1>各科用时统计</h1>
        </div>
      </header>
      <div className="chart-panel">
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={rows} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
            <CartesianGrid stroke="#d8e0ec" vertical={false} />
            <XAxis dataKey="subjectName" />
            <YAxis unit="h" width={42} />
            <Tooltip formatter={(value) => [`${value}h`, "学习时长"]} />
            <Bar dataKey="hours" fill="#315ba7" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="stats-list">
        {rows.map((row) => (
          <article className="stats-row" key={row.subjectId}>
            <span>{row.subjectName}</span>
            <strong>{hours(row.seconds)}</strong>
          </article>
        ))}
      </div>
    </section>
  );
}
