import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { makeSubject } from "../../test/factories";
import { SettingsView } from "./SettingsView";

describe("SettingsView", () => {
  it("renders subjects and runs backup actions", async () => {
    const user = userEvent.setup();
    const onExport = vi.fn().mockResolvedValue('{"version":1}');
    const onImport = vi.fn().mockResolvedValue(undefined);

    render(
      <SettingsView
        backupText=""
        subjects={[makeSubject({ name: "语文" })]}
        onBackupTextChange={() => {}}
        onExportBackup={onExport}
        onImportBackup={onImport}
      />,
    );

    expect(screen.getByRole("heading", { name: "设置与备份" })).toBeInTheDocument();
    expect(screen.getByText("语文")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "导出备份" }));
    await user.click(screen.getByRole("button", { name: "导入备份" }));

    expect(onExport).toHaveBeenCalledTimes(1);
    expect(onImport).toHaveBeenCalledTimes(1);
  });
});
