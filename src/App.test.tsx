import "fake-indexeddb/auto";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";
import { appDb } from "./data/db";

describe("App", () => {
  beforeEach(async () => {
    await appDb.delete();
    await appDb.open();
  });

  it("renders the dashboard by default", async () => {
    render(<App />);
    expect(await screen.findByText("今日概览")).toBeInTheDocument();
    expect(screen.getByText("今日学习")).toBeInTheDocument();
  });

  it("opens the planner section", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(await screen.findByRole("button", { name: "学习计划" }));

    expect(await screen.findByRole("button", { name: "添加任务" })).toBeInTheDocument();
  });

  it("creates repeated tasks and shows them on generated dates", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(await screen.findByRole("button", { name: "学习计划" }));
    await user.type(screen.getByLabelText("任务名称"), "口算练习");
    await user.selectOptions(screen.getByLabelText("重复"), "daily");
    fireEvent.change(screen.getByLabelText("结束日期"), { target: { value: "2026-05-12" } });
    await user.click(screen.getByRole("button", { name: "添加任务" }));
    expect(await screen.findByRole("button", { name: "开始 口算练习" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "下一天" }));

    expect(await screen.findByText("口算练习")).toBeInTheDocument();
  });

  it("downloads a backup file from settings", async () => {
    const user = userEvent.setup();
    const createObjectURL = vi.fn().mockReturnValue("blob:backup");
    const revokeObjectURL = vi.fn();
    const click = vi.fn();
    const originalCreateElement = document.createElement.bind(document);
    Object.defineProperty(URL, "createObjectURL", { configurable: true, value: createObjectURL });
    Object.defineProperty(URL, "revokeObjectURL", { configurable: true, value: revokeObjectURL });
    const createElement = vi.spyOn(document, "createElement");
    createElement.mockImplementation(((tagName: string, options?: ElementCreationOptions) => {
      const element = originalCreateElement(tagName, options);
      if (tagName === "a") {
        Object.defineProperty(element, "click", { configurable: true, value: click });
      }
      return element;
    }) as typeof document.createElement);

    render(<App />);
    await user.click(await screen.findByRole("button", { name: "设置" }));
    await user.click(await screen.findByRole("button", { name: "下载备份" }));

    expect(createObjectURL).toHaveBeenCalledTimes(1);
    expect(click).toHaveBeenCalledTimes(1);
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:backup");

    createElement.mockRestore();
  });

  it("does not import a selected backup when confirmation is canceled", async () => {
    const user = userEvent.setup();
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(false);
    const file = new File(
      [
        '{"version":1,"exportedAt":"2026-05-11T00:00:00.000Z","subjects":[],"tasks":[{"id":"imported","title":"导入任务","subjectId":"subject-chinese","content":"","plannedDate":"2026-05-11","plannedDurationMinutes":20,"actualDurationSeconds":0,"status":"planned","repeatRule":{"type":"none"},"createdAt":"2026-05-11T00:00:00.000Z","updatedAt":"2026-05-11T00:00:00.000Z"}]}',
      ],
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
      [
        '{"version":1,"exportedAt":"2026-05-11T00:00:00.000Z","subjects":[{"id":"subject-chinese","name":"语文","kind":"study","color":"#ef5b5b","icon":"book-open","sortOrder":1}],"tasks":[{"id":"imported","title":"导入任务","subjectId":"subject-chinese","content":"","plannedDate":"2026-05-11","plannedDurationMinutes":20,"actualDurationSeconds":0,"status":"planned","repeatRule":{"type":"none"},"createdAt":"2026-05-11T00:00:00.000Z","updatedAt":"2026-05-11T00:00:00.000Z"}]}',
      ],
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
});
