import type { Subject } from "../../domain/types";

type SettingsViewProps = {
  subjects: Subject[];
  backupText: string;
  onBackupTextChange: (value: string) => void;
  onExportBackup: () => Promise<void>;
  onImportBackup: () => Promise<void>;
};

export function SettingsView({
  subjects,
  backupText,
  onBackupTextChange,
  onExportBackup,
  onImportBackup,
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
          <h2>备份导入</h2>
          <textarea
            aria-label="备份内容"
            onChange={(event) => onBackupTextChange(event.target.value)}
            rows={10}
            value={backupText}
          />
          <div className="settings-actions">
            <button onClick={onExportBackup} type="button">
              导出备份
            </button>
            <button onClick={onImportBackup} type="button">
              导入备份
            </button>
          </div>
        </section>
      </div>
    </section>
  );
}
