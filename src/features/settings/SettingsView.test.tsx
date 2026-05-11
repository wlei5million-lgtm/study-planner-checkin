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
