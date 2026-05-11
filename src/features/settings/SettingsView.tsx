import type { Subject } from "../../domain/types";

type SettingsViewProps = {
  subjects: Subject[];
  backupStatus: string;
  onExportBackup: () => Promise<void>;
  onImportBackupFile: (file: File) => Promise<void>;
};

export function SettingsView({
  subjects,
  backupStatus,
  onExportBackup,
  onImportBackupFile,
}: SettingsViewProps) {
  return (
    <section className="view-stack">
      <header className="section-header">
        <div>
          <p className="eyebrow-dark">本地数据</p>
          <h1>设置与备份</h1>
        </div>
      </header>
      <div className="settings-grid">
        <section className="settings-panel">
          <h2>科目管理</h2>
          <div className="subject-list">
            {subjects.map((subject) => (
              <article className="subject-chip" key={subject.id}>
                <span style={{ background: subject.color }} />
                <strong>{subject.name}</strong>
              </article>
            ))}
          </div>
        </section>
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
                accept=".json,application/json"
                aria-label="选择备份文件"
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
      </div>
    </section>
  );
}
