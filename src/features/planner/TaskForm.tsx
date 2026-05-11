import { useEffect, useState } from "react";
import type { RepeatRule, Subject } from "../../domain/types";

type TaskFormInput = {
  title: string;
  content: string;
  plannedDurationMinutes: number;
  subjectId: string;
  repeatRule: RepeatRule;
};

type TaskFormProps = {
  date: string;
  subjects: Subject[];
  onCreateTask: (input: TaskFormInput) => void;
};

const weekdayLabels = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];

export function TaskForm({ date, subjects, onCreateTask }: TaskFormProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [plannedDurationMinutes, setPlannedDurationMinutes] = useState(20);
  const [subjectId, setSubjectId] = useState(subjects[0]?.id ?? "");
  const [repeatType, setRepeatType] = useState<RepeatRule["type"]>("none");
  const [endDate, setEndDate] = useState(date);
  const [weekdays, setWeekdays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!subjectId && subjects[0]) {
      setSubjectId(subjects[0].id);
    }
  }, [subjectId, subjects]);

  function buildRepeatRule(): RepeatRule | null {
    if (repeatType === "none") return { type: "none" };
    if (!endDate || endDate < date) {
      setError("结束日期不能早于开始日期");
      return null;
    }
    if (repeatType === "daily") return { type: "daily", startDate: date, endDate };
    if (repeatType === "workdays") return { type: "workdays", startDate: date, endDate };
    if (weekdays.length === 0) {
      setError("请至少选择一个星期");
      return null;
    }
    return { type: "weekly", weekdays, startDate: date, endDate };
  }

  return (
    <form
      className="task-form"
      onSubmit={(event) => {
        event.preventDefault();
        if (!title.trim() || !subjectId) return;
        const repeatRule = buildRepeatRule();
        if (!repeatRule) return;
        setError("");
        onCreateTask({ title: title.trim(), content: content.trim(), plannedDurationMinutes, subjectId, repeatRule });
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
      <label>
        重复
        <select value={repeatType} onChange={(event) => setRepeatType(event.target.value as RepeatRule["type"])}>
          <option value="none">不重复</option>
          <option value="daily">每天</option>
          <option value="workdays">工作日</option>
          <option value="weekly">自定义星期</option>
        </select>
      </label>
      {repeatType !== "none" ? (
        <label>
          结束日期
          <input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} />
        </label>
      ) : null}
      {repeatType === "weekly" ? (
        <fieldset className="weekday-picker">
          <legend>重复星期</legend>
          {[1, 2, 3, 4, 5, 6, 7].map((day) => (
            <label key={day}>
              <input
                type="checkbox"
                checked={weekdays.includes(day)}
                onChange={(event) => {
                  setWeekdays((current) =>
                    event.target.checked ? [...current, day].sort() : current.filter((item) => item !== day),
                  );
                }}
              />
              {weekdayLabels[day - 1]}
            </label>
          ))}
        </fieldset>
      ) : null}
      {error ? <p className="form-error">{error}</p> : null}
      <button type="submit">添加任务</button>
    </form>
  );
}
