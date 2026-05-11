# File Backup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace textarea backup with JSON file download and confirmed file import.

**Architecture:** Keep repository import/export as JSON string boundaries. Move file selection UI into SettingsView and browser file/Blob handling into App.

**Tech Stack:** React, TypeScript, Vitest, React Testing Library, fake-indexeddb, browser Blob/File APIs.

---

## File Structure

- `src/features/settings/SettingsView.tsx`: replace textarea backup controls with download button, file input, and status message.
- `src/features/settings/SettingsView.test.tsx`: verify file-oriented controls and selected file callback.
- `src/App.tsx`: remove `backupText`, add export download and confirmed file import handlers.
- `src/App.test.tsx`: add export, import cancel, and import confirm behavior tests.
- `README.md`: update backup description.
- `docs/mvp-scope.md`: update backup scope.

## Task 1: File-Oriented Settings View

**Files:**
- Modify: `src/features/settings/SettingsView.tsx`
- Modify: `src/features/settings/SettingsView.test.tsx`
- Modify: `src/styles.css`

- [ ] **Step 1: Write failing SettingsView test**

Replace the existing settings test with:

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { makeSubject } from "../../test/factories";
import { SettingsView } from "./SettingsView";

describe("SettingsView", () => {
  it("renders file backup actions and passes selected files", async () => {
    const user = userEvent.setup();
    const onExport = vi.fn().mockResolvedValue(undefined);
    const onImportFile = vi.fn().mockResolvedValue(undefined);
    const file = new File(['{"version":1,"subjects":[],"tasks":[]}'], "backup.json", { type: "application/json" });

    render(
      <SettingsView
        backupStatus="导入成功"
        subjects={[makeSubject({ name: "语文" })]}
        onExportBackup={onExport}
        onImportBackupFile={onImportFile}
      />,
    );

    expect(screen.getByRole("heading", { name: "设置与备份" })).toBeInTheDocument();
    expect(screen.getByText("语文")).toBeInTheDocument();
    expect(screen.getByText("导入成功")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "下载备份" }));
    await user.upload(screen.getByLabelText("选择备份文件"), file);

    expect(onExport).toHaveBeenCalledTimes(1);
    expect(onImportFile).toHaveBeenCalledWith(file);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
npm test -- src/features/settings/SettingsView.test.tsx
```

Expected: FAIL because `SettingsView` still expects textarea props and does not render file controls.

- [ ] **Step 3: Implement SettingsView file controls**

Change `SettingsViewProps` to:

```ts
type SettingsViewProps = {
  subjects: Subject[];
  backupStatus: string;
  onExportBackup: () => Promise<void>;
  onImportBackupFile: (file: File) => Promise<void>;
};
```

Replace the backup textarea section with:

```tsx
<section className="settings-panel">
  <h2>数据备份</h2>
  <p className="settings-note">导出完整本地数据，或选择备份文件恢复。导入前会再次确认。</p>
  {backupStatus ? <p className="backup-status">{backupStatus}</p> : null}
  <div className="settings-actions">
    <button onClick={onExportBackup} type="button">
      下载备份
    </button>
    <label className="file-import-button">
      选择备份文件
      <input
        aria-label="选择备份文件"
        accept=".json,application/json"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void onImportBackupFile(file);
          event.currentTarget.value = "";
        }}
        type="file"
      />
    </label>
  </div>
</section>
```

- [ ] **Step 4: Add styles**

Append/update styles in `src/styles.css`:

```css
.settings-note {
  color: #536175;
  margin: 0;
}

.backup-status {
  background: #eef6ff;
  border: 1px solid #cfe0ff;
  border-radius: 8px;
  color: #315ba7;
  font-weight: 700;
  margin: 0;
  padding: 10px 12px;
}

.file-import-button {
  align-items: center;
  background: #315ba7;
  border-radius: 8px;
  color: #fff;
  cursor: pointer;
  display: inline-flex;
  font-weight: 700;
  padding: 10px 14px;
}

.file-import-button input {
  display: none;
}
```

- [ ] **Step 5: Verify SettingsView**

Run:

```bash
npm test -- src/features/settings/SettingsView.test.tsx
npm run build
```

Expected: test passes and build exits with code 0.

- [ ] **Step 6: Commit SettingsView**

Run:

```bash
git add src/features/settings src/styles.css
git commit -m "feat: add file backup controls"
```

## Task 2: App Download and Confirmed Import

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/App.test.tsx`

- [ ] **Step 1: Add failing App tests**

Add these tests to `src/App.test.tsx`:

```tsx
it("downloads a backup file from settings", async () => {
  const user = userEvent.setup();
  const createObjectURL = vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:backup");
  const revokeObjectURL = vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});
  const click = vi.fn();
  const createElement = vi.spyOn(document, "createElement");
  createElement.mockImplementation(((tagName: string) => {
    const element = document.createElementNS("http://www.w3.org/1999/xhtml", tagName);
    if (tagName === "a") {
      Object.defineProperty(element, "click", { value: click });
    }
    return element;
  }) as typeof document.createElement);

  render(<App />);
  await user.click(await screen.findByRole("button", { name: "设置" }));
  await user.click(await screen.findByRole("button", { name: "下载备份" }));

  expect(createObjectURL).toHaveBeenCalledTimes(1);
  expect(click).toHaveBeenCalledTimes(1);
  expect(revokeObjectURL).toHaveBeenCalledWith("blob:backup");

  createObjectURL.mockRestore();
  revokeObjectURL.mockRestore();
  createElement.mockRestore();
});

it("does not import a selected backup when confirmation is canceled", async () => {
  const user = userEvent.setup();
  const confirm = vi.spyOn(window, "confirm").mockReturnValue(false);
  const file = new File(
    ['{"version":1,"exportedAt":"2026-05-11T00:00:00.000Z","subjects":[],"tasks":[{"id":"imported","title":"导入任务","subjectId":"subject-chinese","content":"","plannedDate":"2026-05-11","plannedDurationMinutes":20,"actualDurationSeconds":0,"status":"planned","repeatRule":{"type":"none"},"createdAt":"2026-05-11T00:00:00.000Z","updatedAt":"2026-05-11T00:00:00.000Z"}]}'],
    "backup.json",
    { type: "application/json" },
  );

  render(<App />);
  await user.click(await screen.findByRole("button", { name: "设置" }));
  await user.upload(await screen.findByLabelText("选择备份文件"), file);
  await user.click(screen.getByRole("button", { name: "学习计划" }));

  expect(screen.queryByText("导入任务")).not.toBeInTheDocument();
  expect(confirm).toHaveBeenCalledTimes(1);
  confirm.mockRestore();
});

it("imports a selected backup after confirmation", async () => {
  const user = userEvent.setup();
  const confirm = vi.spyOn(window, "confirm").mockReturnValue(true);
  const file = new File(
    ['{"version":1,"exportedAt":"2026-05-11T00:00:00.000Z","subjects":[{"id":"subject-chinese","name":"语文","kind":"study","color":"#ef5b5b","icon":"book-open","sortOrder":1}],"tasks":[{"id":"imported","title":"导入任务","subjectId":"subject-chinese","content":"","plannedDate":"2026-05-11","plannedDurationMinutes":20,"actualDurationSeconds":0,"status":"planned","repeatRule":{"type":"none"},"createdAt":"2026-05-11T00:00:00.000Z","updatedAt":"2026-05-11T00:00:00.000Z"}]}'],
    "backup.json",
    { type: "application/json" },
  );

  render(<App />);
  await user.click(await screen.findByRole("button", { name: "设置" }));
  await user.upload(await screen.findByLabelText("选择备份文件"), file);

  expect(await screen.findByText("导入成功")).toBeInTheDocument();

  await user.click(screen.getByRole("button", { name: "学习计划" }));
  expect(await screen.findByText("导入任务")).toBeInTheDocument();

  confirm.mockRestore();
});
```

Also update the App test imports:

```ts
import { beforeEach, describe, expect, it, vi } from "vitest";
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
npm test -- src/App.test.tsx
```

Expected: FAIL because App still passes textarea props and has no file handlers.

- [ ] **Step 3: Implement App file handlers**

Remove:

```ts
const [backupText, setBackupText] = useState("");
```

Add:

```ts
const [backupStatus, setBackupStatus] = useState("");
```

Add handlers before `const content`:

```ts
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
    await importAllData(await file.text());
    await refresh();
    setBackupStatus("导入成功");
  } catch {
    setBackupStatus("备份文件格式不正确");
  }
}
```

Update the SettingsView branch:

```tsx
<SettingsView
  backupStatus={backupStatus}
  subjects={subjects}
  onExportBackup={handleExportBackup}
  onImportBackupFile={handleImportBackupFile}
/>
```

- [ ] **Step 4: Verify App behavior**

Run:

```bash
npm test -- src/App.test.tsx src/features/settings/SettingsView.test.tsx
npm run build
```

Expected: tests pass and build exits with code 0.

- [ ] **Step 5: Commit App file backup integration**

Run:

```bash
git add src/App.tsx src/App.test.tsx
git commit -m "feat: download and import backup files"
```

## Task 3: Documentation and Final Verification

**Files:**
- Modify: `README.md`
- Modify: `docs/mvp-scope.md`

- [ ] **Step 1: Update docs**

In `README.md`, change backup text to mention file download/upload:

```md
- 设置与备份：查看科目列表，下载 JSON 备份文件，并从 JSON 备份文件确认导入。
```

In `docs/mvp-scope.md`, update implemented scope:

```md
- 真实 JSON 备份文件下载与确认导入。
```

Remove real file backup from deferred scope if present.

- [ ] **Step 2: Full verification**

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

- [ ] **Step 3: Commit docs**

Run:

```bash
git add README.md docs/mvp-scope.md
git commit -m "docs: document file backup workflow"
```

- [ ] **Step 4: Local run verification**

Confirm the dev server:

```bash
Invoke-WebRequest -UseBasicParsing -Uri http://127.0.0.1:5173/ -TimeoutSec 5
```

Manual smoke path:

1. Open `http://127.0.0.1:5173/`.
2. Go to Settings.
3. Click `下载备份` and confirm a JSON file download starts.
4. Click `选择备份文件`, choose a valid backup, cancel confirmation, and confirm data remains unchanged.
5. Repeat import and confirm; confirm `导入成功` appears and data refreshes.

## Self-Review

- Spec coverage: Plan covers download, file selection, confirmation, cancel path, confirmed import, error status, docs, and local run.
- Incomplete instruction scan: No open-ended implementation instructions remain.
- Type consistency: `SettingsView`, `App`, `exportAllData`, and `importAllData` signatures are consistent across tasks.
- Risk: Anchor click and object URL need DOM mocks in tests; restore all spies inside the test to avoid leaking browser API mocks.
