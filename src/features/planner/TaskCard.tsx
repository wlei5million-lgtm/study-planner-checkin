import { Pause, Play, Square } from "lucide-react";
import type { StudyTask, Subject } from "../../domain/types";

type TaskCardProps = {
  task: StudyTask;
  subject?: Subject;
  onStartTask: (task: StudyTask) => void;
  onPauseTask: (task: StudyTask) => void;
  onStopTask: (task: StudyTask) => void;
};

function formatSeconds(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(rest).padStart(2, "0")}`;
}

export function TaskCard({ task, subject, onStartTask, onPauseTask, onStopTask }: TaskCardProps) {
  return (
    <article className="task-card" style={{ borderLeftColor: subject?.color ?? "#315ba7" }}>
      <div>
        <strong>{task.title}</strong>
        <p>{task.content}</p>
        <small>{subject?.name ?? "未分类"} · 计划 {task.plannedDurationMinutes} 分钟</small>
      </div>
      <div className="task-actions">
        <span className="timer-readout">{formatSeconds(task.actualDurationSeconds)}</span>
        <button type="button" aria-label={`开始 ${task.title}`} onClick={() => onStartTask(task)}>
          <Play size={16} />
        </button>
        <button type="button" aria-label={`暂停 ${task.title}`} onClick={() => onPauseTask(task)}>
          <Pause size={16} />
        </button>
        <button type="button" aria-label={`完成 ${task.title}`} onClick={() => onStopTask(task)}>
          <Square size={16} />
        </button>
      </div>
    </article>
  );
}
