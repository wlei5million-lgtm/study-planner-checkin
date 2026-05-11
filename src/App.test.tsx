import "fake-indexeddb/auto";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
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
});
