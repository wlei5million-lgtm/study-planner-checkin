# File Backup Design

## Goal

Replace the current textarea-based backup workflow with real JSON file download and file import, while protecting users from accidental data overwrite.

## Scope

This round implements:

- Downloading all local data as a `.json` backup file.
- Selecting a local `.json` backup file for import.
- Confirming before import overwrites current local data.
- Showing import success and error messages in settings.

Out of scope:

- Import preview panel with record counts.
- Merge import.
- Cloud sync.
- Password-protected import.
- Encrypted backups.

## User Experience

The Settings page keeps the subject list and replaces the large backup textarea with a compact backup panel:

- `下载备份` button downloads `study-planner-backup-YYYY-MM-DD.json`.
- `选择备份文件` opens the browser file picker.
- The file input accepts `.json` and `application/json`.
- After the user selects a file, the app shows a native confirmation:
  `导入会覆盖当前本地数据，确定继续吗？`
- If the user cancels, nothing changes.
- If the user confirms, the app imports the file and refreshes data.
- Success message: `导入成功`
- Error message: `备份文件格式不正确`

## Data Flow

`exportAllData()` continues returning a JSON string. `App` creates a `Blob`, creates an object URL, clicks a temporary anchor, and revokes the object URL.

`SettingsView` owns the file input event and passes the selected `File` to `App`. `App` reads `file.text()`, asks for confirmation, calls `importAllData(text)`, refreshes repository-backed state, and updates a status message.

`importAllData()` already validates the basic backup shape and replaces local subjects and tasks in a transaction. This behavior remains unchanged.

## Components

### SettingsView

Props change from textarea-oriented backup controls to file-oriented controls:

- `subjects`
- `backupStatus`
- `onExportBackup`
- `onImportBackupFile`

It renders:

- Subject list.
- Download button.
- File input wrapped in a label styled as a button.
- Optional status message.

### App

App removes `backupText` state. It adds:

- `backupStatus`
- `handleExportBackup()`
- `handleImportBackupFile(file: File)`

## Error Handling

Import catches errors from file reading, JSON parsing, and repository validation. It displays `备份文件格式不正确`.

When confirmation is canceled, App leaves data unchanged and can show no message. This avoids implying a failure when the user intentionally canceled.

Export should revoke the object URL after clicking the temporary link.

## Testing

Add/adjust tests:

- `SettingsView` renders `下载备份`, `选择备份文件`, and passes a selected file to `onImportBackupFile`.
- `App` export test mocks object URL creation and anchor click.
- `App` import cancel test mocks `window.confirm` returning `false` and verifies no imported data appears.
- `App` import confirm test mocks `window.confirm` returning `true`, selects a JSON file, and verifies imported task data appears after refresh.
- Existing repository import/export tests remain as data-layer coverage.

Full verification:

```bash
npm test
npm run build
```

## Acceptance Criteria

- A user can download a JSON backup file from Settings.
- A user can select a JSON backup file from Settings.
- The app asks for confirmation before replacing local data.
- Canceling confirmation leaves existing local data unchanged.
- Confirming import replaces local data and refreshes visible app state.
- Invalid backup files show a clear error message.
