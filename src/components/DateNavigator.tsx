import { addDaysIso, todayIso } from "../domain/date";

type DateNavigatorProps = {
  date: string;
  onDateChange: (date: string) => void;
  today?: string;
};

export function DateNavigator({ date, onDateChange, today = todayIso() }: DateNavigatorProps) {
  return (
    <div className="date-navigator" aria-label="日期切换">
      <button type="button" onClick={() => onDateChange(addDaysIso(date, -1))}>
        上一天
      </button>
      <button type="button" onClick={() => onDateChange(today)}>
        今天
      </button>
      <button type="button" onClick={() => onDateChange(addDaysIso(date, 1))}>
        下一天
      </button>
      <label>
        选择日期
        <input type="date" value={date} onChange={(event) => onDateChange(event.target.value)} />
      </label>
    </div>
  );
}
