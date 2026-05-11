import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { AppLayout } from "./AppLayout";

describe("AppLayout", () => {
  it("switches between primary app sections", async () => {
    const user = userEvent.setup();
    const onViewChange = vi.fn();

    render(<AppLayout activeView="planner" onViewChange={onViewChange} />);

    expect(screen.getByRole("button", { name: "学习计划" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "数据统计" }));

    expect(onViewChange).toHaveBeenCalledWith("stats");
  });
});
