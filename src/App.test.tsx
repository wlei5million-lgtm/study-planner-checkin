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
});
