# Date Repeat Planner Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add planner date navigation and basic repeated task creation to the existing study planner MVP.

**Architecture:** Keep active date state in `App`, render a reusable `DateNavigator`, and pass repeat rule input from `TaskForm` through `PlannerView` to `App`. Use existing pure `expandRepeatDates()` logic to generate independent dated tasks.

**Tech Stack:** React, TypeScript, Vitest, React Testing Library, date-fns, Dexie/IndexedDB.

---

## File Structure

- `src/components/DateNavigator.tsx`: reusable date switching control.
- `src/components/DateNavigator.test.tsx`: verifies previous, today, next, and direct date change behavior.
- `src/features/planner/TaskForm.tsx`: adds repeat mode, end date, weekday controls, and validation.
- `src/features/planner/PlannerView.tsx`: renders `DateNavigator` and passes selected date into `TaskForm`.
- `src/features/planner/PlannerView.test.tsx`: covers non-repeating and repeating task submission.
- `src/App.tsx`: owns selected date, reloads data by date, expands repeat dates on create.
- `src/App.test.tsx`: verifies date navigation and repeated tasks appearing on generated dates.
- `src/styles.css`: styles the date navigator and repeat controls.
- `README.md` and `docs/mvp-scope.md`: document date navigation and repeat creation.

## Task 1: Date Navigator Component

**Files:**
- Create: `src/components/DateNavigator.tsx`
- Create: `src/components/DateNavigator.test.tsx`
- Modify: `src/styles.css`

- [ ] **Step 1: Write failing DateNavigator tests**

Create `src/components/DateNavigator.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { DateNavigator } from "./DateNavigator";

describe("DateNavigator", () => {
  it("moves to previous day, today, next day, and direct date", async () => {
    const user = userEvent.setup();
    const onDateChange = vi.fn();

    render(<DateNavigator date="2026-05-11" onDateChange={onDateChange} today="2026-05-11" />);

    await user.click(screen.getByRole("button", { name: "上一天" }));
    await user.click(screen.getByRole("button", { name: "今天" }));
    await user.click(screen.getByRole("button", { name: "下一天" }));
    await user.clear(screen.getByLabelText("选择日期"));
    await user.type(screen.getByLabelText("选择日期"), "2026-05-15");

    expect(onDateChange).toHaveBeenNthCalledWith(1, "2026-05-10");
    expect(onDateChange).toHaveBeenNthCalledWith(2, "2026-05-11");
    expect(onDateChange).toHaveBeenNthCalledWith(3, "2026-05-12");
    expect(onDateChange).toHaveBeenLastCalledWith("2026-05-15");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
npm test -- src/components/DateNavigator.test.tsx
```

Expected: FAIL because `DateNavigator` does not exist.

- [ ] **Step 3: Implement DateNavigator**

Create `src/components/DateNavigator.tsx`:

```tsx
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
```

Append to `src/styles.css`:

```css
.date-navigator {
  align-items: end;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.date-navigator button {
  background: #315ba7;
  border: 0;
  border-radius: 8px;
  color: #fff;
  cursor: pointer;
  font-weight: 700;
  padding: 10px 14px;
}

.date-navigator label {
  display: grid;
  gap: 6px;
  font-weight: 700;
}

.date-navigator input {
  border: 1px solid #d8e0ec;
  border-radius: 8px;
  padding: 9px 10px;
}
```

- [ ] **Step 4: Verify DateNavigator**

Run:

```bash
npm test -- src/components/DateNavigator.test.tsx
npm run build
```

Expected: tests pass and build exits with code 0.

- [ ] **Step 5: Commit DateNavigator**

Run:

```bash
git add src/components/DateNavigator.tsx src/components/DateNavigator.test.tsx src/styles.css
git commit -m "feat: add planner date navigator"
```

## Task 2: Repeat Controls in Task Form

**Files:**
- Modify: `src/features/planner/TaskForm.tsx`
- Modify: `src/features/planner/PlannerView.tsx`
- Modify: `src/features/planner/PlannerView.test.tsx`
- Modify: `src/styles.css`

- [ ] **Step 1: Write failing PlannerView tests**

Update `src/features/planner/PlannerView.test.tsx` so the existing non-repeat test expects a repeat rule, and add a daily repeat test:

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { makeSubject } from "../../test/factories";
import { PlannerView } from "./PlannerView";

function renderPlanner(onCreateTask = vi.fn()) {
  render(
    <PlannerView
      date="2026-05-11"
      subjects={[makeSubject({ id: "subject-chinese", name: "语文" })]}
      tasks={[]}
      onCreateTask={onCreateTask}
      onDateChange={vi.fn()}
      onStartTask={vi.fn()}
      onPauseTask={vi.fn()}
      onStopTask={vi.fn()}
    />,
  );
  return onCreateTask;
}

describe("PlannerView", () => {
  it("submits a new non-repeating study task", async () => {
    const user = userEvent.setup();
    const onCreateTask = renderPlanner();

    await user.type(screen.getByLabelText("任务名称"), "晨读");
    await user.type(screen.getByLabelText("任务内容"), "朗读古诗");
    await user.clear(screen.getByLabelText("计划分钟"));
    await user.type(screen.getByLabelText("计划分钟"), "20");
    await user.click(screen.getByRole("button", { name: "添加任务" }));

    expect(onCreateTask).toHaveBeenCalledWith({
      title: "晨读",
      content: "朗读古诗",
      plannedDurationMinutes: 20,
      subjectId: "subject-chinese",
      repeatRule: { type: "none" },
    });
  });

  it("submits a daily repeated study task", async () => {
    const user = userEvent.setup();
    const onCreateTask = renderPlanner();

    await user.type(screen.getByLabelText("任务名称"), "口算练习");
    await user.selectOptions(screen.getByLabelText("重复"), "daily");
    await user.type(screen.getByLabelText("结束日期"), "2026-05-13");
    await user.click(screen.getByRole("button", { name: "添加任务" }));

    expect(onCreateTask).toHaveBeenCalledWith({
      title: "口算练习",
      content: "",
      plannedDurationMinutes: 20,
      subjectId: "subject-chinese",
      repeatRule: { type: "daily", startDate: "2026-05-11", endDate: "2026-05-13" },
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
npm test -- src/features/planner/PlannerView.test.tsx
```

Expected: FAIL because `PlannerView` does not accept `onDateChange` and `TaskForm` does not submit `repeatRule`.

- [ ] **Step 3: Implement repeat form behavior**

Modify `TaskForm` props to include:

```ts
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
```

Inside `TaskForm`, add state:

```ts
const [repeatType, setRepeatType] = useState<RepeatRule["type"]>("none");
const [endDate, setEndDate] = useState(date);
const [weekdays, setWeekdays] = useState<number[]>([1, 2, 3, 4, 5]);
const [error, setError] = useState("");
```

Add a local builder before return:

```ts
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
```

Update submit handler:

```ts
const repeatRule = buildRepeatRule();
if (!repeatRule) return;
setError("");
onCreateTask({ title: title.trim(), content: content.trim(), plannedDurationMinutes, subjectId, repeatRule });
```

Add repeat controls before the submit button:

```tsx
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
        {["周一", "周二", "周三", "周四", "周五", "周六", "周日"][day - 1]}
      </label>
    ))}
  </fieldset>
) : null}
{error ? <p className="form-error">{error}</p> : null}
```

Modify `PlannerView` props to accept:

```ts
onDateChange: (date: string) => void;
onCreateTask: (input: {
  title: string;
  content: string;
  plannedDurationMinutes: number;
  subjectId: string;
  repeatRule: RepeatRule;
}) => void;
```

Render `DateNavigator` in the header and pass `date` to `TaskForm`.

- [ ] **Step 4: Add repeat styles**

Append to `src/styles.css`:

```css
.weekday-picker {
  border: 1px solid #d8e0ec;
  border-radius: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  grid-column: 1 / -1;
  padding: 12px;
}

.weekday-picker legend {
  font-weight: 700;
  padding: 0 6px;
}

.weekday-picker label {
  align-items: center;
  display: flex;
  gap: 6px;
}

.form-error {
  color: #c92a2a;
  font-weight: 700;
  grid-column: 1 / -1;
  margin: 0;
}
```

- [ ] **Step 5: Verify repeat form**

Run:

```bash
npm test -- src/features/planner/PlannerView.test.tsx src/components/DateNavigator.test.tsx
npm run build
```

Expected: tests pass and build exits with code 0.

- [ ] **Step 6: Commit repeat form**

Run:

```bash
git add src/features/planner src/components src/styles.css
git commit -m "feat: add repeat controls to planner form"
```

## Task 3: App Date State and Batch Task Creation

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/App.test.tsx`

- [ ] **Step 1: Write failing App behavior test**

Add this test to `src/App.test.tsx`:

```tsx
it("creates repeated tasks and shows them on generated dates", async () => {
  const user = userEvent.setup();
  render(<App />);

  await user.click(await screen.findByRole("button", { name: "学习计划" }));
  await user.type(screen.getByLabelText("任务名称"), "口算练习");
  await user.selectOptions(screen.getByLabelText("重复"), "每天");
  await user.type(screen.getByLabelText("结束日期"), "2026-05-12");
  await user.click(screen.getByRole("button", { name: "添加任务" }));

  await user.click(screen.getByRole("button", { name: "下一天" }));

  expect(await screen.findByText("口算练习")).toBeInTheDocument();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
npm test -- src/App.test.tsx
```

Expected: FAIL because `App` does not expand repeat dates or pass `onDateChange`.

- [ ] **Step 3: Implement App date and batch creation**

Modify imports:

```ts
import { expandRepeatDates } from "./domain/repeatRules";
import type { RepeatRule, StudyTask, Subject } from "./domain/types";
```

Change date state:

```ts
const [date, setDate] = useState(todayIso());
```

Change `handleCreateTask` input:

```ts
async function handleCreateTask(input: {
  title: string;
  content: string;
  plannedDurationMinutes: number;
  subjectId: string;
  repeatRule: RepeatRule;
}) {
  const now = new Date().toISOString();
  const dates = expandRepeatDates(input.repeatRule, date);
  await Promise.all(
    dates.map((plannedDate) =>
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
```

Pass `onDateChange={setDate}` into `PlannerView`.

- [ ] **Step 4: Verify App behavior**

Run:

```bash
npm test -- src/App.test.tsx src/features/planner/PlannerView.test.tsx
npm run build
```

Expected: tests pass and build exits with code 0.

- [ ] **Step 5: Commit App integration**

Run:

```bash
git add src/App.tsx src/App.test.tsx
git commit -m "feat: create repeated tasks by selected date"
```

## Task 4: Documentation and Final Verification

**Files:**
- Modify: `README.md`
- Modify: `docs/mvp-scope.md`

- [ ] **Step 1: Update README**

Add date and repeat capabilities to the feature list:

```md
- 日期切换：查看和补录不同日期的学习任务。
- 基础重复任务：支持不重复、每天、工作日和自定义星期生成计划。
```

- [ ] **Step 2: Update MVP scope**

Move these items from "暂未实现" or "下一步建议" into "已实现":

```md
- 多日期切换与直接日期选择。
- 基础重复任务生成：每天、工作日、自定义星期。
```

Keep monthly repeat, Ebbinghaus review cycle, and series editing in deferred scope.

- [ ] **Step 3: Run full verification**

Run:

```bash
npm test
npm run build
git status --short
```

Expected:

- All tests pass.
- Build exits with code 0.
- `git status --short` shows only README and MVP scope changes before commit.

- [ ] **Step 4: Commit docs**

Run:

```bash
git add README.md docs/mvp-scope.md
git commit -m "docs: update date repeat planner scope"
```

- [ ] **Step 5: Local run verification**

Run or confirm the existing dev server:

```bash
npm run dev -- --host 127.0.0.1 --port 5173
```

Manual smoke path:

1. Open `http://127.0.0.1:5173/`.
2. Navigate to "学习计划".
3. Create a daily repeated task from `2026-05-11` to `2026-05-12`.
4. Click "下一天".
5. Confirm the generated task appears.
6. Start, pause, and complete the generated task.
7. Confirm dashboard metrics still update.

## Self-Review

- Spec coverage: The plan covers date navigation, shared selected date, basic repeat modes, repeated task generation, validation, docs, and final local verification.
- Placeholder scan: No incomplete implementation instructions remain.
- Type consistency: `RepeatRule`, `StudyTask`, `Subject`, `expandRepeatDates`, `DateNavigator`, `TaskForm`, and `PlannerView` signatures are consistent across tasks.
- Risk: Native date input typing in tests can be browser-dependent; if needed, use `fireEvent.change(input, { target: { value: "2026-05-12" } })` while keeping production behavior unchanged.
