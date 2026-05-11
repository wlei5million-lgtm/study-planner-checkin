import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { DateNavigator } from "./DateNavigator";

describe("DateNavigator", () => {
  it("moves to previous day, today, next day, and direct date", async () => {
    const user = userEvent.setup();
    const onDateChange = vi.fn();

    render(<DateNavigator date="2026-05-11" onDateChange={onDateChange} today="2026-05-11" />);

    await user.click(screen.getByRole("button", { name: "上一天" }));
    await user.click(screen.getByRole("button", { name: "今天" }));
    await user.click(screen.getByRole("button", { name: "下一天" }));
    fireEvent.change(screen.getByLabelText("选择日期"), { target: { value: "2026-05-15" } });

    expect(onDateChange).toHaveBeenNthCalledWith(1, "2026-05-10");
    expect(onDateChange).toHaveBeenNthCalledWith(2, "2026-05-11");
    expect(onDateChange).toHaveBeenNthCalledWith(3, "2026-05-12");
    expect(onDateChange).toHaveBeenLastCalledWith("2026-05-15");
  });
});
