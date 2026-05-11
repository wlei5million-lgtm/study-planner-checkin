import { EmptyState } from "../../components/EmptyState";
import { formatDisplayDate } from "../../domain/date";
import type { StudyTask, Subject } from "../../domain/types";
import { TaskCard } from "./TaskCard";
import { TaskForm } from "./TaskForm";

type PlannerViewProps = {
  date: string;
  subjects: Subject[];
  tasks: StudyTask[];
  onCreateTask: (input: { title: string; content: string; plannedDurationMinutes: number; subjectId: string }) => void;
  onStartTask: (task: StudyTask) => void;
  onPauseTask: (task: StudyTask) => void;
  onStopTask: (task: StudyTask) => void;
};

export function PlannerView({ date, subjects, tasks, onCreateTask, onStartTask, onPauseTask, onStopTask }: PlannerViewProps) {
  const subjectById = new Map(subjects.map((subject) => [subject.id, subject]));

  return (
    <section className="view-stack">
      <header className="section-header">
        <div>
          <p className="eyebrow-dark">学习计划</p>
          <h1>{formatDisplayDate(date)}</h1>
        </div>
      </header>
      <TaskForm subjects={subjects} onCreateTask={onCreateTask} />
      <div className="task-list">
        {tasks.length === 0 ? (
          <EmptyState title="今天还没有任务" description="先添加一个清晰、可完成的学习任务。" />
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              subject={subjectById.get(task.subjectId)}
              onStartTask={onStartTask}
              onPauseTask={onPauseTask}
              onStopTask={onStopTask}
            />
          ))
        )}
      </div>
    </section>
  );
}
