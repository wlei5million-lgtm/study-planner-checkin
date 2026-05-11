import { useState } from "react";
import type { Subject } from "../../domain/types";

type TaskFormProps = {
  subjects: Subject[];
  onCreateTask: (input: { title: string; content: string; plannedDurationMinutes: number; subjectId: string }) => void;
};

export function TaskForm({ subjects, onCreateTask }: TaskFormProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [plannedDurationMinutes, setPlannedDurationMinutes] = useState(20);
  const [subjectId, setSubjectId] = useState(subjects[0]?.id ?? "");

  return (
    <form
      className="task-form"
      onSubmit={(event) => {
        event.preventDefault();
        if (!title.trim() || !subjectId) return;
        onCreateTask({ title: title.trim(), content: content.trim(), plannedDurationMinutes, subjectId });
        setTitle("");
        setContent("");
      }}
    >
      <label>
        任务名称
        <input value={title} onChange={(event) => setTitle(event.target.value)} />
      </label>
      <label>
        科目
        <select value={subjectId} onChange={(event) => setSubjectId(event.target.value)}>
          {subjects.map((subject) => (
            <option key={subject.id} value={subject.id}>
              {subject.name}
            </option>
          ))}
        </select>
      </label>
      <label>
        计划分钟
        <input
          min={1}
          type="number"
          value={plannedDurationMinutes}
          onChange={(event) => setPlannedDurationMinutes(Number(event.target.value))}
        />
      </label>
      <label className="task-form-wide">
        任务内容
        <textarea value={content} onChange={(event) => setContent(event.target.value)} />
      </label>
      <button type="submit">添加任务</button>
    </form>
  );
}
