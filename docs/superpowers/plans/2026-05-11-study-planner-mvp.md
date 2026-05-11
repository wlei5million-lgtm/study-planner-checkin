# Study Planner MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first working version of a local-first study planning, timer check-in, dashboard, and statistics app inspired by the product analysis in `docs/product-analysis.md`.

**Architecture:** Use a React + TypeScript single-page app with a local-first data layer. Keep domain logic in pure TypeScript modules, persistence behind a repository boundary, and UI components focused on rendering and user interaction.

**Tech Stack:** Vite, React, TypeScript, Vitest, React Testing Library, Dexie/IndexedDB, Recharts, lucide-react, date-fns.

---

## Scope Check

The product analysis covers several independent subsystems: task planning, timer check-in, statistics, score analysis, badges, points rewards, parent controls, and backup/restore. This plan implements the MVP only:

- Project scaffold and tests
- Local-first storage
- Subject and task management
- Daily task list
- Timer start/pause/stop
- Dashboard summary
- Basic statistics charts
- JSON backup/export and import

The following should be separate implementation plans after this MVP is stable:

- Score tracking and score analysis
- Badge unlock engine
- Points ledger and reward redemption
- Parent password control
- Multi-child support
- PWA install/offline polish

## File Structure

Create the app as a Vite React project rooted in the repository.

- `package.json`: scripts and dependencies.
- `index.html`: Vite entry HTML.
- `vite.config.ts`: Vite + Vitest config.
- `tsconfig.json`: TypeScript compiler config.
- `tsconfig.node.json`: Node-side TypeScript config.
- `vitest.setup.ts`: test DOM setup.
- `.gitignore`: ignore dependencies, build output, logs, local artifacts.
- `src/main.tsx`: React entry.
- `src/App.tsx`: top-level app shell and route/tab state.
- `src/styles.css`: global app styling.
- `src/domain/types.ts`: shared domain types.
- `src/domain/date.ts`: date helpers.
- `src/domain/repeatRules.ts`: repeat rule expansion logic.
- `src/domain/taskStats.ts`: dashboard and chart aggregation logic.
- `src/domain/timer.ts`: timer state transition helpers.
- `src/data/db.ts`: Dexie schema.
- `src/data/repositories.ts`: persistence operations.
- `src/data/seed.ts`: default subjects and starter data.
- `src/features/planner/PlannerView.tsx`: daily task list and task creation.
- `src/features/planner/TaskForm.tsx`: task form component.
- `src/features/planner/TaskCard.tsx`: task row/card with timer controls.
- `src/features/dashboard/DashboardView.tsx`: dashboard cards and shortcuts.
- `src/features/stats/StatsView.tsx`: basic charts and filters.
- `src/features/settings/SettingsView.tsx`: subject management and backup/import.
- `src/components/AppLayout.tsx`: tablet-first layout.
- `src/components/MetricCard.tsx`: reusable dashboard metric card.
- `src/components/EmptyState.tsx`: reusable empty state.
- `src/test/factories.ts`: test data factories.
- `src/**/*.test.ts`: pure domain tests.
- `src/**/*.test.tsx`: UI behavior tests.

## Data Model Decisions

Use ISO date strings for calendar dates, such as `2026-05-11`. Use ISO datetime strings for event times. Store elapsed durations in seconds.

Core status values:

```ts
export type TaskStatus = "planned" | "running" | "paused" | "completed";
```

MVP repeat rules:

```ts
export type RepeatRule =
  | { type: "none" }
  | { type: "daily"; startDate: string; endDate: string }
  | { type: "weekly"; weekdays: number[]; startDate: string; endDate: string }
  | { type: "workdays"; startDate: string; endDate: string };
```

Defer monthly and Ebbinghaus review-cycle rules to a later plan. Add the type boundary now so those rules can be added without reshaping tasks.

---

### Task 1: Scaffold React App and Test Harness

**Files:**
- Create: `package.json`
- Create: `index.html`
- Create: `vite.config.ts`
- Create: `tsconfig.json`
- Create: `tsconfig.node.json`
- Create: `vitest.setup.ts`
- Create: `.gitignore`
- Create: `src/main.tsx`
- Create: `src/App.tsx`
- Create: `src/styles.css`
- Test: `src/App.test.tsx`

- [ ] **Step 1: Create package metadata and scripts**

Create `package.json`:

```json
{
  "name": "study-planner-checkin",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "test": "vitest run",
    "test:watch": "vitest",
    "lint": "tsc -b --pretty false"
  },
  "dependencies": {
    "date-fns": "^4.1.0",
    "dexie": "^4.0.11",
    "lucide-react": "^0.468.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "recharts": "^2.15.0"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.6.3",
    "@testing-library/react": "^16.2.0",
    "@testing-library/user-event": "^14.6.1",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "@vitejs/plugin-react": "^5.0.0",
    "jsdom": "^25.0.1",
    "typescript": "^5.8.0",
    "vite": "^6.0.0",
    "vitest": "^2.1.8"
  }
}
```

- [ ] **Step 2: Install dependencies**

Run:

```bash
npm install
```

Expected: `package-lock.json` is created and install exits with code 0.

- [ ] **Step 3: Create Vite and TypeScript config**

Create `index.html`:

```html
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>好学伴</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

Create `vite.config.ts`:

```ts
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: "./vitest.setup.ts",
    globals: true,
  },
});
```

Create `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["DOM", "DOM.Iterable", "ES2022"],
    "allowJs": false,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx"
  },
  "include": ["src", "vitest.setup.ts"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

Create `tsconfig.node.json`:

```json
{
  "compilerOptions": {
    "composite": true,
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "allowSyntheticDefaultImports": true,
    "strict": true
  },
  "include": ["vite.config.ts"]
}
```

Create `vitest.setup.ts`:

```ts
import "@testing-library/jest-dom/vitest";
```

Create `.gitignore`:

```gitignore
node_modules/
dist/
.env
.env.local
*.log
cdp-proxy.*.log
```

- [ ] **Step 4: Write failing app smoke test**

Create `src/App.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import App from "./App";

describe("App", () => {
  it("renders the product shell", () => {
    render(<App />);
    expect(screen.getByRole("heading", { name: "好学伴" })).toBeInTheDocument();
    expect(screen.getByText("学习计划与打卡统计助手")).toBeInTheDocument();
  });
});
```

- [ ] **Step 5: Run test to verify it fails**

Run:

```bash
npm test -- src/App.test.tsx
```

Expected: FAIL because `src/App.tsx` does not exist.

- [ ] **Step 6: Create minimal app shell**

Create `src/main.tsx`:

```tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

Create `src/App.tsx`:

```tsx
export default function App() {
  return (
    <main className="app-shell">
      <section className="hero-panel">
        <p className="eyebrow">学习计划与打卡统计助手</p>
        <h1>好学伴</h1>
      </section>
    </main>
  );
}
```

Create `src/styles.css`:

```css
:root {
  font-family: "Microsoft YaHei", "PingFang SC", system-ui, sans-serif;
  color: #172033;
  background: #eef3f8;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  min-width: 320px;
}

.app-shell {
  min-height: 100vh;
  padding: 24px;
}

.hero-panel {
  border-radius: 8px;
  background: linear-gradient(135deg, #244b91, #13294f);
  color: #fff;
  padding: 24px;
}

.eyebrow {
  margin: 0 0 8px;
  opacity: 0.85;
}

h1 {
  margin: 0;
  font-size: 36px;
}
```

- [ ] **Step 7: Run tests and build**

Run:

```bash
npm test
npm run build
```

Expected: tests pass and production build exits with code 0.

- [ ] **Step 8: Commit scaffold**

Run:

```bash
git add .gitignore index.html package.json package-lock.json tsconfig.json tsconfig.node.json vite.config.ts vitest.setup.ts src
git commit -m "chore: scaffold study planner app"
```

---

### Task 2: Domain Types, Factories, and Date Helpers

**Files:**
- Create: `src/domain/types.ts`
- Create: `src/domain/date.ts`
- Create: `src/test/factories.ts`
- Test: `src/domain/date.test.ts`

- [ ] **Step 1: Write failing date helper tests**

Create `src/domain/date.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { addDaysIso, formatDisplayDate, todayIso } from "./date";

describe("date helpers", () => {
  it("adds days to an ISO date", () => {
    expect(addDaysIso("2026-05-11", 1)).toBe("2026-05-12");
    expect(addDaysIso("2026-05-11", -1)).toBe("2026-05-10");
  });

  it("formats display date in Chinese", () => {
    expect(formatDisplayDate("2026-05-11")).toBe("2026年5月11日");
  });

  it("returns a stable ISO date shape for today", () => {
    expect(todayIso()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
npm test -- src/domain/date.test.ts
```

Expected: FAIL because `src/domain/date.ts` does not exist.

- [ ] **Step 3: Add shared domain types**

Create `src/domain/types.ts`:

```ts
export type SubjectKind = "study" | "sports" | "entertainment";

export type Subject = {
  id: string;
  name: string;
  kind: SubjectKind;
  color: string;
  icon: string;
  sortOrder: number;
};

export type TaskStatus = "planned" | "running" | "paused" | "completed";

export type RepeatRule =
  | { type: "none" }
  | { type: "daily"; startDate: string; endDate: string }
  | { type: "weekly"; weekdays: number[]; startDate: string; endDate: string }
  | { type: "workdays"; startDate: string; endDate: string };

export type StudyTask = {
  id: string;
  title: string;
  subjectId: string;
  content: string;
  plannedDate: string;
  plannedDurationMinutes: number;
  actualDurationSeconds: number;
  status: TaskStatus;
  repeatRule: RepeatRule;
  createdAt: string;
  updatedAt: string;
};

export type TimerSession = {
  id: string;
  taskId: string;
  startedAt: string;
  endedAt?: string;
  durationSeconds: number;
  status: "running" | "paused" | "stopped";
};
```

- [ ] **Step 4: Implement date helpers**

Create `src/domain/date.ts`:

```ts
import { addDays, format, parseISO } from "date-fns";

export function todayIso(now = new Date()): string {
  return format(now, "yyyy-MM-dd");
}

export function addDaysIso(date: string, days: number): string {
  return format(addDays(parseISO(date), days), "yyyy-MM-dd");
}

export function formatDisplayDate(date: string): string {
  return format(parseISO(date), "yyyy年M月d日");
}
```

Create `src/test/factories.ts`:

```ts
import type { StudyTask, Subject } from "../domain/types";

export function makeSubject(overrides: Partial<Subject> = {}): Subject {
  return {
    id: "subject-chinese",
    name: "语文",
    kind: "study",
    color: "#ef5b5b",
    icon: "book-open",
    sortOrder: 1,
    ...overrides,
  };
}

export function makeTask(overrides: Partial<StudyTask> = {}): StudyTask {
  return {
    id: "task-1",
    title: "晨读",
    subjectId: "subject-chinese",
    content: "复习古诗词并朗读课文",
    plannedDate: "2026-05-11",
    plannedDurationMinutes: 20,
    actualDurationSeconds: 0,
    status: "planned",
    repeatRule: { type: "none" },
    createdAt: "2026-05-11T08:00:00.000Z",
    updatedAt: "2026-05-11T08:00:00.000Z",
    ...overrides,
  };
}
```

- [ ] **Step 5: Verify domain helpers**

Run:

```bash
npm test -- src/domain/date.test.ts
npm run build
```

Expected: tests pass and build exits with code 0.

- [ ] **Step 6: Commit domain foundation**

Run:

```bash
git add src/domain src/test
git commit -m "feat: add study planner domain foundation"
```

---

### Task 3: Repeat Rule Expansion

**Files:**
- Create: `src/domain/repeatRules.ts`
- Test: `src/domain/repeatRules.test.ts`

- [ ] **Step 1: Write failing repeat rule tests**

Create `src/domain/repeatRules.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { expandRepeatDates } from "./repeatRules";

describe("expandRepeatDates", () => {
  it("returns the planned date for non-repeating tasks", () => {
    expect(expandRepeatDates({ type: "none" }, "2026-05-11")).toEqual(["2026-05-11"]);
  });

  it("expands daily dates inclusively", () => {
    expect(expandRepeatDates({ type: "daily", startDate: "2026-05-11", endDate: "2026-05-13" }, "2026-05-11")).toEqual([
      "2026-05-11",
      "2026-05-12",
      "2026-05-13",
    ]);
  });

  it("expands workdays only", () => {
    expect(expandRepeatDates({ type: "workdays", startDate: "2026-05-11", endDate: "2026-05-17" }, "2026-05-11")).toEqual([
      "2026-05-11",
      "2026-05-12",
      "2026-05-13",
      "2026-05-14",
      "2026-05-15",
    ]);
  });

  it("expands selected weekdays where Monday is 1", () => {
    expect(expandRepeatDates({ type: "weekly", weekdays: [1, 3], startDate: "2026-05-11", endDate: "2026-05-17" }, "2026-05-11")).toEqual([
      "2026-05-11",
      "2026-05-13",
    ]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
npm test -- src/domain/repeatRules.test.ts
```

Expected: FAIL because `expandRepeatDates` does not exist.

- [ ] **Step 3: Implement repeat rule expansion**

Create `src/domain/repeatRules.ts`:

```ts
import { eachDayOfInterval, format, getDay, parseISO } from "date-fns";
import type { RepeatRule } from "./types";

function toIso(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

function weekdayNumber(date: Date): number {
  const day = getDay(date);
  return day === 0 ? 7 : day;
}

export function expandRepeatDates(rule: RepeatRule, plannedDate: string): string[] {
  if (rule.type === "none") return [plannedDate];

  const days = eachDayOfInterval({
    start: parseISO(rule.startDate),
    end: parseISO(rule.endDate),
  });

  if (rule.type === "daily") return days.map(toIso);

  if (rule.type === "workdays") {
    return days.filter((day) => weekdayNumber(day) <= 5).map(toIso);
  }

  return days.filter((day) => rule.weekdays.includes(weekdayNumber(day))).map(toIso);
}
```

- [ ] **Step 4: Verify repeat rules**

Run:

```bash
npm test -- src/domain/repeatRules.test.ts
npm run build
```

Expected: tests pass and build exits with code 0.

- [ ] **Step 5: Commit repeat rules**

Run:

```bash
git add src/domain/repeatRules.ts src/domain/repeatRules.test.ts
git commit -m "feat: expand study task repeat rules"
```

---

### Task 4: Task Timer State Machine

**Files:**
- Create: `src/domain/timer.ts`
- Test: `src/domain/timer.test.ts`

- [ ] **Step 1: Write failing timer tests**

Create `src/domain/timer.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { pauseTask, startTask, stopTask } from "./timer";
import { makeTask } from "../test/factories";

describe("timer transitions", () => {
  it("starts a planned task", () => {
    const task = startTask(makeTask(), "2026-05-11T08:00:00.000Z");
    expect(task.status).toBe("running");
    expect(task.updatedAt).toBe("2026-05-11T08:00:00.000Z");
  });

  it("pauses a running task and adds elapsed seconds", () => {
    const task = pauseTask(
      makeTask({ status: "running", actualDurationSeconds: 60 }),
      "2026-05-11T08:00:00.000Z",
      "2026-05-11T08:05:00.000Z",
    );
    expect(task.status).toBe("paused");
    expect(task.actualDurationSeconds).toBe(360);
  });

  it("stops a running task as completed", () => {
    const task = stopTask(
      makeTask({ status: "running" }),
      "2026-05-11T08:00:00.000Z",
      "2026-05-11T08:20:00.000Z",
    );
    expect(task.status).toBe("completed");
    expect(task.actualDurationSeconds).toBe(1200);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
npm test -- src/domain/timer.test.ts
```

Expected: FAIL because `src/domain/timer.ts` does not exist.

- [ ] **Step 3: Implement timer transitions**

Create `src/domain/timer.ts`:

```ts
import type { StudyTask } from "./types";

function elapsedSeconds(startedAt: string, endedAt: string): number {
  return Math.max(0, Math.round((Date.parse(endedAt) - Date.parse(startedAt)) / 1000));
}

export function startTask(task: StudyTask, now: string): StudyTask {
  return {
    ...task,
    status: "running",
    updatedAt: now,
  };
}

export function pauseTask(task: StudyTask, startedAt: string, now: string): StudyTask {
  return {
    ...task,
    status: "paused",
    actualDurationSeconds: task.actualDurationSeconds + elapsedSeconds(startedAt, now),
    updatedAt: now,
  };
}

export function stopTask(task: StudyTask, startedAt: string, now: string): StudyTask {
  return {
    ...task,
    status: "completed",
    actualDurationSeconds: task.actualDurationSeconds + elapsedSeconds(startedAt, now),
    updatedAt: now,
  };
}
```

- [ ] **Step 4: Verify timer transitions**

Run:

```bash
npm test -- src/domain/timer.test.ts
npm run build
```

Expected: tests pass and build exits with code 0.

- [ ] **Step 5: Commit timer logic**

Run:

```bash
git add src/domain/timer.ts src/domain/timer.test.ts
git commit -m "feat: add task timer transitions"
```

---

### Task 5: Dashboard and Statistics Aggregation

**Files:**
- Create: `src/domain/taskStats.ts`
- Test: `src/domain/taskStats.test.ts`

- [ ] **Step 1: Write failing statistics tests**

Create `src/domain/taskStats.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { buildDashboardSummary, buildTimeBySubject } from "./taskStats";
import { makeSubject, makeTask } from "../test/factories";

describe("task statistics", () => {
  const subjects = [
    makeSubject({ id: "chinese", name: "语文", kind: "study" }),
    makeSubject({ id: "sports", name: "运动", kind: "sports" }),
  ];

  it("builds dashboard summary for a date", () => {
    const tasks = [
      makeTask({ id: "1", subjectId: "chinese", plannedDate: "2026-05-11", actualDurationSeconds: 1200, status: "completed" }),
      makeTask({ id: "2", subjectId: "sports", plannedDate: "2026-05-11", actualDurationSeconds: 600, status: "planned" }),
      makeTask({ id: "3", subjectId: "chinese", plannedDate: "2026-05-12", actualDurationSeconds: 300, status: "completed" }),
    ];

    expect(buildDashboardSummary(tasks, subjects, "2026-05-11")).toEqual({
      studySeconds: 1200,
      sportsSeconds: 600,
      completedTasks: 1,
      totalTasks: 2,
      completionRate: 50,
    });
  });

  it("groups actual time by subject", () => {
    const tasks = [
      makeTask({ subjectId: "chinese", actualDurationSeconds: 1200 }),
      makeTask({ subjectId: "sports", actualDurationSeconds: 600 }),
    ];

    expect(buildTimeBySubject(tasks, subjects)).toEqual([
      { subjectId: "chinese", subjectName: "语文", seconds: 1200 },
      { subjectId: "sports", subjectName: "运动", seconds: 600 },
    ]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
npm test -- src/domain/taskStats.test.ts
```

Expected: FAIL because `taskStats.ts` does not exist.

- [ ] **Step 3: Implement statistics aggregation**

Create `src/domain/taskStats.ts`:

```ts
import type { StudyTask, Subject } from "./types";

export type DashboardSummary = {
  studySeconds: number;
  sportsSeconds: number;
  completedTasks: number;
  totalTasks: number;
  completionRate: number;
};

export function buildDashboardSummary(tasks: StudyTask[], subjects: Subject[], date: string): DashboardSummary {
  const subjectById = new Map(subjects.map((subject) => [subject.id, subject]));
  const dailyTasks = tasks.filter((task) => task.plannedDate === date);
  const completedTasks = dailyTasks.filter((task) => task.status === "completed").length;

  return {
    studySeconds: sumByKind(dailyTasks, subjectById, "study"),
    sportsSeconds: sumByKind(dailyTasks, subjectById, "sports"),
    completedTasks,
    totalTasks: dailyTasks.length,
    completionRate: dailyTasks.length === 0 ? 0 : Math.round((completedTasks / dailyTasks.length) * 100),
  };
}

function sumByKind(tasks: StudyTask[], subjectById: Map<string, Subject>, kind: Subject["kind"]): number {
  return tasks
    .filter((task) => subjectById.get(task.subjectId)?.kind === kind)
    .reduce((total, task) => total + task.actualDurationSeconds, 0);
}

export function buildTimeBySubject(tasks: StudyTask[], subjects: Subject[]) {
  return subjects.map((subject) => ({
    subjectId: subject.id,
    subjectName: subject.name,
    seconds: tasks
      .filter((task) => task.subjectId === subject.id)
      .reduce((total, task) => total + task.actualDurationSeconds, 0),
  }));
}
```

- [ ] **Step 4: Verify stats logic**

Run:

```bash
npm test -- src/domain/taskStats.test.ts
npm run build
```

Expected: tests pass and build exits with code 0.

- [ ] **Step 5: Commit stats logic**

Run:

```bash
git add src/domain/taskStats.ts src/domain/taskStats.test.ts
git commit -m "feat: aggregate study task statistics"
```

---

### Task 6: Local Database and Repository Boundary

**Files:**
- Create: `src/data/db.ts`
- Create: `src/data/repositories.ts`
- Create: `src/data/seed.ts`
- Test: `src/data/repositories.test.ts`

- [ ] **Step 1: Write failing repository tests**

Create `src/data/repositories.test.ts`:

```ts
import "fake-indexeddb/auto";
import { beforeEach, describe, expect, it } from "vitest";
import { appDb } from "./db";
import { createTask, listTasksByDate, replaceSubjects } from "./repositories";
import { makeSubject, makeTask } from "../test/factories";

describe("repositories", () => {
  beforeEach(async () => {
    await appDb.delete();
    await appDb.open();
  });

  it("stores subjects and tasks", async () => {
    await replaceSubjects([makeSubject({ id: "chinese" })]);
    await createTask(makeTask({ subjectId: "chinese", plannedDate: "2026-05-11" }));

    const tasks = await listTasksByDate("2026-05-11");
    expect(tasks).toHaveLength(1);
    expect(tasks[0].title).toBe("晨读");
  });
});
```

- [ ] **Step 2: Install IndexedDB test dependency**

Run:

```bash
npm install -D fake-indexeddb
```

Expected: dependency is added to `package.json` and `package-lock.json`.

- [ ] **Step 3: Run test to verify it fails**

Run:

```bash
npm test -- src/data/repositories.test.ts
```

Expected: FAIL because data modules do not exist.

- [ ] **Step 4: Implement Dexie database**

Create `src/data/db.ts`:

```ts
import Dexie, { type Table } from "dexie";
import type { StudyTask, Subject, TimerSession } from "../domain/types";

export class StudyPlannerDb extends Dexie {
  subjects!: Table<Subject, string>;
  tasks!: Table<StudyTask, string>;
  timerSessions!: Table<TimerSession, string>;

  constructor() {
    super("study-planner-db");
    this.version(1).stores({
      subjects: "id, sortOrder, kind",
      tasks: "id, plannedDate, subjectId, status",
      timerSessions: "id, taskId, status",
    });
  }
}

export const appDb = new StudyPlannerDb();
```

Create `src/data/repositories.ts`:

```ts
import type { StudyTask, Subject } from "../domain/types";
import { appDb } from "./db";

export async function listSubjects(): Promise<Subject[]> {
  return appDb.subjects.orderBy("sortOrder").toArray();
}

export async function replaceSubjects(subjects: Subject[]): Promise<void> {
  await appDb.transaction("rw", appDb.subjects, async () => {
    await appDb.subjects.clear();
    await appDb.subjects.bulkPut(subjects);
  });
}

export async function createTask(task: StudyTask): Promise<void> {
  await appDb.tasks.put(task);
}

export async function updateTask(task: StudyTask): Promise<void> {
  await appDb.tasks.put(task);
}

export async function listTasksByDate(date: string): Promise<StudyTask[]> {
  return appDb.tasks.where("plannedDate").equals(date).sortBy("createdAt");
}

export async function listAllTasks(): Promise<StudyTask[]> {
  return appDb.tasks.toArray();
}
```

Create `src/data/seed.ts`:

```ts
import type { Subject } from "../domain/types";
import { listSubjects, replaceSubjects } from "./repositories";

export const defaultSubjects: Subject[] = [
  { id: "subject-chinese", name: "语文", kind: "study", color: "#ef5b5b", icon: "book-open", sortOrder: 1 },
  { id: "subject-math", name: "数学", kind: "study", color: "#5c7cfa", icon: "calculator", sortOrder: 2 },
  { id: "subject-english", name: "英语", kind: "study", color: "#f59f00", icon: "languages", sortOrder: 3 },
  { id: "subject-sports", name: "运动", kind: "sports", color: "#37b24d", icon: "activity", sortOrder: 4 },
  { id: "subject-entertainment", name: "娱乐", kind: "entertainment", color: "#ae3ec9", icon: "smile", sortOrder: 5 },
];

export async function ensureSeedData(): Promise<void> {
  const subjects = await listSubjects();
  if (subjects.length === 0) await replaceSubjects(defaultSubjects);
}
```

- [ ] **Step 5: Verify repository**

Run:

```bash
npm test -- src/data/repositories.test.ts
npm run build
```

Expected: tests pass and build exits with code 0.

- [ ] **Step 6: Commit data layer**

Run:

```bash
git add package.json package-lock.json src/data
git commit -m "feat: add local study planner database"
```

---

### Task 7: App Layout and Navigation

**Files:**
- Create: `src/components/AppLayout.tsx`
- Create: `src/components/MetricCard.tsx`
- Create: `src/components/EmptyState.tsx`
- Modify: `src/App.tsx`
- Modify: `src/styles.css`
- Test: `src/components/AppLayout.test.tsx`

- [ ] **Step 1: Write failing layout test**

Create `src/components/AppLayout.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { AppLayout } from "./AppLayout";

describe("AppLayout", () => {
  it("switches between primary app sections", async () => {
    const user = userEvent.setup();
    render(<AppLayout activeView="planner" onViewChange={() => {}} />);

    expect(screen.getByRole("button", { name: "学习计划" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "数据统计" }));
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
npm test -- src/components/AppLayout.test.tsx
```

Expected: FAIL because component does not exist.

- [ ] **Step 3: Implement layout primitives**

Create `src/components/AppLayout.tsx`:

```tsx
import { BarChart3, CalendarCheck, Home, Settings } from "lucide-react";

export type AppView = "dashboard" | "planner" | "stats" | "settings";

type AppLayoutProps = {
  activeView: AppView;
  onViewChange: (view: AppView) => void;
  children?: React.ReactNode;
};

const navItems = [
  { id: "dashboard", label: "首页", icon: Home },
  { id: "planner", label: "学习计划", icon: CalendarCheck },
  { id: "stats", label: "数据统计", icon: BarChart3 },
  { id: "settings", label: "设置", icon: Settings },
] as const;

export function AppLayout({ activeView, onViewChange, children }: AppLayoutProps) {
  return (
    <div className="app-frame">
      <aside className="sidebar" aria-label="主导航">
        <div className="brand">
          <strong>好学伴</strong>
          <span>学习计划与打卡统计助手</span>
        </div>
        <nav className="nav-list">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                className={activeView === item.id ? "nav-button active" : "nav-button"}
                onClick={() => onViewChange(item.id)}
                type="button"
              >
                <Icon size={18} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </aside>
      <main className="content-panel">{children}</main>
    </div>
  );
}
```

Create `src/components/MetricCard.tsx`:

```tsx
type MetricCardProps = {
  label: string;
  value: string;
  helper?: string;
};

export function MetricCard({ label, value, helper }: MetricCardProps) {
  return (
    <article className="metric-card">
      <span>{label}</span>
      <strong>{value}</strong>
      {helper ? <small>{helper}</small> : null}
    </article>
  );
}
```

Create `src/components/EmptyState.tsx`:

```tsx
type EmptyStateProps = {
  title: string;
  description: string;
};

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <section className="empty-state">
      <h2>{title}</h2>
      <p>{description}</p>
    </section>
  );
}
```

- [ ] **Step 4: Wire layout into App**

Modify `src/App.tsx`:

```tsx
import { useState } from "react";
import { AppLayout, type AppView } from "./components/AppLayout";
import { EmptyState } from "./components/EmptyState";

export default function App() {
  const [activeView, setActiveView] = useState<AppView>("dashboard");

  return (
    <AppLayout activeView={activeView} onViewChange={setActiveView}>
      <EmptyState title="好学伴" description="学习计划与打卡统计助手" />
    </AppLayout>
  );
}
```

Append to `src/styles.css`:

```css
.app-frame {
  display: grid;
  grid-template-columns: 220px 1fr;
  min-height: 100vh;
}

.sidebar {
  background: #13294f;
  color: #fff;
  padding: 20px;
}

.brand {
  display: grid;
  gap: 6px;
  margin-bottom: 24px;
}

.brand span {
  color: rgba(255, 255, 255, 0.72);
  font-size: 13px;
}

.nav-list {
  display: grid;
  gap: 8px;
}

.nav-button {
  align-items: center;
  background: transparent;
  border: 0;
  border-radius: 8px;
  color: #dbe7ff;
  cursor: pointer;
  display: flex;
  gap: 10px;
  padding: 12px;
  text-align: left;
}

.nav-button.active,
.nav-button:hover {
  background: rgba(255, 255, 255, 0.12);
  color: #fff;
}

.content-panel {
  padding: 24px;
}

.metric-card,
.empty-state {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(19, 41, 79, 0.08);
  padding: 18px;
}

.metric-card {
  display: grid;
  gap: 8px;
}

.metric-card strong {
  color: #315ba7;
  font-size: 28px;
}

@media (max-width: 760px) {
  .app-frame {
    grid-template-columns: 1fr;
  }

  .sidebar {
    position: sticky;
    top: 0;
    z-index: 2;
  }

  .nav-list {
    grid-template-columns: repeat(4, 1fr);
  }
}
```

- [ ] **Step 5: Verify layout**

Run:

```bash
npm test -- src/components/AppLayout.test.tsx src/App.test.tsx
npm run build
```

Expected: tests pass and build exits with code 0.

- [ ] **Step 6: Commit layout**

Run:

```bash
git add src/App.tsx src/components src/styles.css
git commit -m "feat: add tablet-first app layout"
```

---

### Task 8: Planner View with Task Creation

**Files:**
- Create: `src/features/planner/TaskForm.tsx`
- Create: `src/features/planner/TaskCard.tsx`
- Create: `src/features/planner/PlannerView.tsx`
- Modify: `src/App.tsx`
- Test: `src/features/planner/PlannerView.test.tsx`

- [ ] **Step 1: Write failing planner behavior test**

Create `src/features/planner/PlannerView.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { PlannerView } from "./PlannerView";
import { makeSubject } from "../../test/factories";

describe("PlannerView", () => {
  it("submits a new study task", async () => {
    const user = userEvent.setup();
    const onCreateTask = vi.fn();

    render(
      <PlannerView
        date="2026-05-11"
        subjects={[makeSubject({ id: "subject-chinese", name: "语文" })]}
        tasks={[]}
        onCreateTask={onCreateTask}
        onStartTask={vi.fn()}
        onPauseTask={vi.fn()}
        onStopTask={vi.fn()}
      />,
    );

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
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
npm test -- src/features/planner/PlannerView.test.tsx
```

Expected: FAIL because planner components do not exist.

- [ ] **Step 3: Implement task form and card**

Create `src/features/planner/TaskForm.tsx`:

```tsx
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
            <option key={subject.id} value={subject.id}>{subject.name}</option>
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
```

Create `src/features/planner/TaskCard.tsx`:

```tsx
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
        <button type="button" aria-label={`开始 ${task.title}`} onClick={() => onStartTask(task)}><Play size={16} /></button>
        <button type="button" aria-label={`暂停 ${task.title}`} onClick={() => onPauseTask(task)}><Pause size={16} /></button>
        <button type="button" aria-label={`完成 ${task.title}`} onClick={() => onStopTask(task)}><Square size={16} /></button>
      </div>
    </article>
  );
}
```

- [ ] **Step 4: Implement planner view**

Create `src/features/planner/PlannerView.tsx`:

```tsx
import { TaskCard } from "./TaskCard";
import { TaskForm } from "./TaskForm";
import type { StudyTask, Subject } from "../../domain/types";
import { formatDisplayDate } from "../../domain/date";
import { EmptyState } from "../../components/EmptyState";

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
```

- [ ] **Step 5: Add planner styles**

Append to `src/styles.css`:

```css
.view-stack {
  display: grid;
  gap: 18px;
}

.section-header {
  align-items: center;
  display: flex;
  justify-content: space-between;
}

.section-header h1 {
  color: #172033;
  font-size: 28px;
}

.eyebrow-dark {
  color: #315ba7;
  font-weight: 700;
  margin: 0 0 4px;
}

.task-form {
  background: #fff;
  border-radius: 8px;
  display: grid;
  gap: 12px;
  grid-template-columns: 1fr 180px 140px;
  padding: 18px;
}

.task-form label {
  display: grid;
  gap: 6px;
  font-weight: 700;
}

.task-form input,
.task-form select,
.task-form textarea {
  border: 1px solid #d8e0ec;
  border-radius: 8px;
  font: inherit;
  padding: 10px;
}

.task-form-wide {
  grid-column: 1 / -1;
}

.task-form button,
.task-actions button {
  border: 0;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 700;
  padding: 10px 14px;
}

.task-form button {
  background: #315ba7;
  color: #fff;
  grid-column: 1 / -1;
}

.task-list {
  display: grid;
  gap: 12px;
}

.task-card {
  align-items: center;
  background: #fff;
  border-left: 8px solid #315ba7;
  border-radius: 8px;
  display: grid;
  gap: 16px;
  grid-template-columns: 1fr auto;
  padding: 16px;
}

.task-card p {
  color: #536175;
  margin: 6px 0;
}

.task-actions {
  align-items: center;
  display: flex;
  gap: 8px;
}

.timer-readout {
  color: #e03131;
  font-size: 22px;
  font-weight: 800;
  min-width: 74px;
}
```

- [ ] **Step 6: Verify planner view**

Run:

```bash
npm test -- src/features/planner/PlannerView.test.tsx
npm run build
```

Expected: tests pass and build exits with code 0.

- [ ] **Step 7: Commit planner view**

Run:

```bash
git add src/features/planner src/styles.css
git commit -m "feat: add daily study planner view"
```

---

### Task 9: Wire App State to Local Repository

**Files:**
- Modify: `src/App.tsx`
- Test: `src/App.test.tsx`

- [ ] **Step 1: Update app smoke test for planner navigation**

Modify `src/App.test.tsx`:

```tsx
import "fake-indexeddb/auto";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import App from "./App";
import { appDb } from "./data/db";

describe("App", () => {
  beforeEach(async () => {
    await appDb.delete();
    await appDb.open();
  });

  it("renders the product shell", async () => {
    render(<App />);
    expect(await screen.findByText("学习计划与打卡统计助手")).toBeInTheDocument();
  });

  it("opens the planner section", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(await screen.findByRole("button", { name: "学习计划" }));
    expect(await screen.findByRole("button", { name: "添加任务" })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
npm test -- src/App.test.tsx
```

Expected: FAIL because `App` is not wired to planner data.

- [ ] **Step 3: Implement app data wiring**

Modify `src/App.tsx`:

```tsx
import { useEffect, useState } from "react";
import { AppLayout, type AppView } from "./components/AppLayout";
import { EmptyState } from "./components/EmptyState";
import { todayIso } from "./domain/date";
import type { StudyTask, Subject } from "./domain/types";
import { ensureSeedData } from "./data/seed";
import { createTask, listSubjects, listTasksByDate, updateTask } from "./data/repositories";
import { PlannerView } from "./features/planner/PlannerView";
import { pauseTask, startTask, stopTask } from "./domain/timer";

function newId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID()}`;
}

export default function App() {
  const [activeView, setActiveView] = useState<AppView>("dashboard");
  const [date] = useState(todayIso());
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [tasks, setTasks] = useState<StudyTask[]>([]);
  const [activeStartByTaskId, setActiveStartByTaskId] = useState<Record<string, string>>({});

  async function refresh() {
    await ensureSeedData();
    setSubjects(await listSubjects());
    setTasks(await listTasksByDate(date));
  }

  useEffect(() => {
    void refresh();
  }, [date]);

  async function handleCreateTask(input: { title: string; content: string; plannedDurationMinutes: number; subjectId: string }) {
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
    activeView === "planner" ? (
      <PlannerView
        date={date}
        subjects={subjects}
        tasks={tasks}
        onCreateTask={handleCreateTask}
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
    ) : (
      <EmptyState title="好学伴" description="学习计划与打卡统计助手" />
    );

  return (
    <AppLayout activeView={activeView} onViewChange={setActiveView}>
      {content}
    </AppLayout>
  );
}
```

- [ ] **Step 4: Verify app data wiring**

Run:

```bash
npm test -- src/App.test.tsx
npm run build
```

Expected: tests pass and build exits with code 0.

- [ ] **Step 5: Commit app wiring**

Run:

```bash
git add src/App.tsx src/App.test.tsx
git commit -m "feat: wire planner to local data"
```

---

### Task 10: Dashboard View

**Files:**
- Create: `src/features/dashboard/DashboardView.tsx`
- Modify: `src/App.tsx`
- Test: `src/features/dashboard/DashboardView.test.tsx`

- [ ] **Step 1: Write failing dashboard test**

Create `src/features/dashboard/DashboardView.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DashboardView } from "./DashboardView";
import { makeSubject, makeTask } from "../../test/factories";

describe("DashboardView", () => {
  it("shows daily summary metrics", () => {
    render(
      <DashboardView
        date="2026-05-11"
        subjects={[
          makeSubject({ id: "chinese", name: "语文", kind: "study" }),
          makeSubject({ id: "sports", name: "运动", kind: "sports" }),
        ]}
        tasks={[
          makeTask({ subjectId: "chinese", actualDurationSeconds: 3600, status: "completed" }),
          makeTask({ subjectId: "sports", actualDurationSeconds: 1800, status: "planned" }),
        ]}
      />,
    );

    expect(screen.getByText("今日学习")).toBeInTheDocument();
    expect(screen.getByText("1.0h")).toBeInTheDocument();
    expect(screen.getByText("50%")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
npm test -- src/features/dashboard/DashboardView.test.tsx
```

Expected: FAIL because `DashboardView` does not exist.

- [ ] **Step 3: Implement dashboard**

Create `src/features/dashboard/DashboardView.tsx`:

```tsx
import { MetricCard } from "../../components/MetricCard";
import { buildDashboardSummary } from "../../domain/taskStats";
import type { StudyTask, Subject } from "../../domain/types";
import { formatDisplayDate } from "../../domain/date";

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
```

Append to `src/styles.css`:

```css
.metric-grid {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(4, minmax(140px, 1fr));
}

@media (max-width: 900px) {
  .metric-grid {
    grid-template-columns: repeat(2, minmax(140px, 1fr));
  }
}
```

- [ ] **Step 4: Wire dashboard into App**

Modify the imports in `src/App.tsx`:

```tsx
import { DashboardView } from "./features/dashboard/DashboardView";
```

Change the `content` expression so dashboard uses `DashboardView`:

```tsx
const content =
  activeView === "dashboard" ? (
    <DashboardView date={date} subjects={subjects} tasks={tasks} />
  ) : activeView === "planner" ? (
    <PlannerView
      date={date}
      subjects={subjects}
      tasks={tasks}
      onCreateTask={handleCreateTask}
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
  ) : (
    <EmptyState title="好学伴" description="学习计划与打卡统计助手" />
  );
```

- [ ] **Step 5: Verify dashboard**

Run:

```bash
npm test -- src/features/dashboard/DashboardView.test.tsx src/App.test.tsx
npm run build
```

Expected: tests pass and build exits with code 0.

- [ ] **Step 6: Commit dashboard**

Run:

```bash
git add src/App.tsx src/features/dashboard src/styles.css
git commit -m "feat: add daily dashboard"
```

---

### Task 11: Statistics Charts

**Files:**
- Create: `src/features/stats/StatsView.tsx`
- Modify: `src/App.tsx`
- Test: `src/features/stats/StatsView.test.tsx`

- [ ] **Step 1: Write failing stats test**

Create `src/features/stats/StatsView.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StatsView } from "./StatsView";
import { makeSubject, makeTask } from "../../test/factories";

describe("StatsView", () => {
  it("shows subject time chart section", () => {
    render(
      <StatsView
        subjects={[makeSubject({ id: "chinese", name: "语文" })]}
        tasks={[makeTask({ subjectId: "chinese", actualDurationSeconds: 1200 })]}
      />,
    );

    expect(screen.getByRole("heading", { name: "各科用时统计" })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
npm test -- src/features/stats/StatsView.test.tsx
```

Expected: FAIL because `StatsView` does not exist.

- [ ] **Step 3: Implement statistics view**

Create `src/features/stats/StatsView.tsx`:

```tsx
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { buildTimeBySubject } from "../../domain/taskStats";
import type { StudyTask, Subject } from "../../domain/types";

type StatsViewProps = {
  subjects: Subject[];
  tasks: StudyTask[];
};

export function StatsView({ subjects, tasks }: StatsViewProps) {
  const data = buildTimeBySubject(tasks, subjects).map((item) => ({
    name: item.subjectName,
    hours: Number((item.seconds / 3600).toFixed(2)),
  }));

  return (
    <section className="view-stack">
      <header className="section-header">
        <div>
          <p className="eyebrow-dark">数据统计</p>
          <h1>各科用时统计</h1>
        </div>
      </header>
      <div className="chart-panel">
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="hours" fill="#315ba7" name="小时" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
```

Append to `src/styles.css`:

```css
.chart-panel {
  background: #fff;
  border-radius: 8px;
  height: 360px;
  padding: 18px;
}
```

- [ ] **Step 4: Wire stats into App**

Import in `src/App.tsx`:

```tsx
import { StatsView } from "./features/stats/StatsView";
```

Add the stats branch to the `content` expression:

```tsx
) : activeView === "stats" ? (
  <StatsView subjects={subjects} tasks={tasks} />
) : (
```

- [ ] **Step 5: Verify charts**

Run:

```bash
npm test -- src/features/stats/StatsView.test.tsx src/App.test.tsx
npm run build
```

Expected: tests pass and build exits with code 0.

- [ ] **Step 6: Commit stats view**

Run:

```bash
git add src/App.tsx src/features/stats src/styles.css
git commit -m "feat: add basic study statistics charts"
```

---

### Task 12: Settings, Subject Management, Backup and Import

**Files:**
- Create: `src/features/settings/SettingsView.tsx`
- Modify: `src/data/repositories.ts`
- Modify: `src/App.tsx`
- Test: `src/features/settings/SettingsView.test.tsx`

- [ ] **Step 1: Write failing settings test**

Create `src/features/settings/SettingsView.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SettingsView } from "./SettingsView";
import { makeSubject } from "../../test/factories";

describe("SettingsView", () => {
  it("shows subjects and backup actions", () => {
    render(
      <SettingsView
        subjects={[makeSubject({ name: "语文" })]}
        onExportData={vi.fn()}
        onImportData={vi.fn()}
      />,
    );

    expect(screen.getByText("语文")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "导出备份" })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
npm test -- src/features/settings/SettingsView.test.tsx
```

Expected: FAIL because `SettingsView` does not exist.

- [ ] **Step 3: Extend repository for backup**

Modify `src/data/repositories.ts` and add:

```ts
export async function exportAllData() {
  const [subjects, tasks, timerSessions] = await Promise.all([
    appDb.subjects.toArray(),
    appDb.tasks.toArray(),
    appDb.timerSessions.toArray(),
  ]);
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    subjects,
    tasks,
    timerSessions,
  };
}

export async function importAllData(data: Awaited<ReturnType<typeof exportAllData>>): Promise<void> {
  await appDb.transaction("rw", appDb.subjects, appDb.tasks, appDb.timerSessions, async () => {
    await appDb.subjects.clear();
    await appDb.tasks.clear();
    await appDb.timerSessions.clear();
    await appDb.subjects.bulkPut(data.subjects);
    await appDb.tasks.bulkPut(data.tasks);
    await appDb.timerSessions.bulkPut(data.timerSessions);
  });
}
```

- [ ] **Step 4: Implement settings view**

Create `src/features/settings/SettingsView.tsx`:

```tsx
import type { Subject } from "../../domain/types";

type SettingsViewProps = {
  subjects: Subject[];
  onExportData: () => void;
  onImportData: (file: File) => void;
};

export function SettingsView({ subjects, onExportData, onImportData }: SettingsViewProps) {
  return (
    <section className="view-stack">
      <header className="section-header">
        <div>
          <p className="eyebrow-dark">设置</p>
          <h1>科目与数据</h1>
        </div>
      </header>
      <section className="settings-panel">
        <h2>默认科目</h2>
        <div className="subject-list">
          {subjects.map((subject) => (
            <span key={subject.id} className="subject-pill" style={{ borderColor: subject.color }}>
              {subject.name}
            </span>
          ))}
        </div>
      </section>
      <section className="settings-panel">
        <h2>数据安全</h2>
        <div className="settings-actions">
          <button type="button" onClick={onExportData}>导出备份</button>
          <label className="import-button">
            导入备份
            <input
              type="file"
              accept="application/json"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) onImportData(file);
              }}
            />
          </label>
        </div>
      </section>
    </section>
  );
}
```

Append to `src/styles.css`:

```css
.settings-panel {
  background: #fff;
  border-radius: 8px;
  padding: 18px;
}

.subject-list,
.settings-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.subject-pill {
  border: 2px solid;
  border-radius: 999px;
  font-weight: 700;
  padding: 8px 12px;
}

.settings-actions button,
.import-button {
  background: #315ba7;
  border: 0;
  border-radius: 8px;
  color: #fff;
  cursor: pointer;
  font: inherit;
  font-weight: 700;
  padding: 10px 14px;
}

.import-button input {
  display: none;
}
```

- [ ] **Step 5: Wire backup actions into App**

Import in `src/App.tsx`:

```tsx
import { exportAllData, importAllData } from "./data/repositories";
import { SettingsView } from "./features/settings/SettingsView";
```

Add handlers before `const content`:

```tsx
async function handleExportData() {
  const data = await exportAllData();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `study-planner-backup-${date}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

async function handleImportData(file: File) {
  const text = await file.text();
  await importAllData(JSON.parse(text));
  await refresh();
}
```

Add settings branch:

```tsx
) : activeView === "settings" ? (
  <SettingsView subjects={subjects} onExportData={handleExportData} onImportData={handleImportData} />
) : (
```

- [ ] **Step 6: Verify settings and backup**

Run:

```bash
npm test -- src/features/settings/SettingsView.test.tsx src/App.test.tsx
npm run build
```

Expected: tests pass and build exits with code 0.

- [ ] **Step 7: Commit settings**

Run:

```bash
git add src/App.tsx src/data/repositories.ts src/features/settings src/styles.css
git commit -m "feat: add settings and local backup"
```

---

### Task 13: Final MVP Verification and Documentation

**Files:**
- Modify: `README.md`
- Create: `docs/mvp-scope.md`

- [ ] **Step 1: Update README**

Modify `README.md`:

```md
# 好学伴

本项目是一个本地优先的学习计划与打卡统计助手，用于帮助家长为孩子规划学习任务、记录实际学习时长，并通过数据统计复盘执行情况。

## MVP 功能

- 学习科目与分类
- 每日学习任务
- 任务计时打卡
- 今日仪表盘
- 各科用时统计图
- 本地数据备份与导入

## Development

```bash
npm install
npm run dev
```

## Verification

```bash
npm test
npm run build
```

## Product Research

See `docs/product-analysis.md`.
```

- [ ] **Step 2: Add MVP scope document**

Create `docs/mvp-scope.md`:

```md
# MVP Scope

## Included

- Local-first React app
- Default subjects: 语文、数学、英语、运动、娱乐
- Daily task creation
- Timer start, pause, and completion
- Dashboard summary
- Subject time chart
- JSON backup and import

## Deferred

- Exam score tracking
- Badge unlock engine
- Points reward redemption
- Parent password verification
- Multi-child profiles
- Monthly and Ebbinghaus repeat rules

## Acceptance Criteria

- A parent can open the app and see default subjects.
- A parent can create a task for today.
- A student can start, pause, and complete the task.
- The dashboard updates after task completion.
- Statistics show subject-level time distribution.
- The user can export and import a JSON backup.
```

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
- `git status --short` only shows intended documentation changes before commit.

- [ ] **Step 4: Commit docs**

Run:

```bash
git add README.md docs/mvp-scope.md
git commit -m "docs: document study planner mvp"
```

## Self-Review

- Spec coverage: This plan covers the MVP recommended in `docs/product-analysis.md`: local storage, subject/category management, task creation, timer check-in, dashboard summary, basic statistics, and backup/import.
- Deferred systems are explicitly split out: score tracking, badges, points rewards, parent password, multi-child support, advanced repeat rules, and PWA polish.
- Placeholder scan: No placeholder phrases are used as implementation instructions.
- Type consistency: The plan consistently uses `Subject`, `StudyTask`, `RepeatRule`, `TaskStatus`, `TimerSession`, `buildDashboardSummary`, and `buildTimeBySubject`.
- Risk: Some package versions may need small updates if npm resolves newer incompatible majors. Keep the public interfaces and tests in this plan as the source of truth.
