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
