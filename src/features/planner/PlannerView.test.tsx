import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { makeSubject } from "../../test/factories";
import { PlannerView } from "./PlannerView";

function renderPlanner(onCreateTask = vi.fn()) {
  render(
    <PlannerView
      date="2026-05-11"
      subjects={[makeSubject({ id: "subject-chinese", name: "语文" })]}
      tasks={[]}
      onCreateTask={onCreateTask}
      onDateChange={vi.fn()}
      onStartTask={vi.fn()}
      onPauseTask={vi.fn()}
      onStopTask={vi.fn()}
    />,
  );
  return onCreateTask;
}

describe("PlannerView", () => {
  it("submits a new non-repeating study task", async () => {
    const user = userEvent.setup();
    const onCreateTask = renderPlanner();

    await user.type(screen.getByLabelText("任务名称"), "晨读");
    await user.type(screen.getByLabelText("任务内容"), "朗读古诗");
    await user.clear(screen.getByLabelText("计划分钟"));
    await user.type(screen.getByLabelText("计划分钟"), "20");
    await user.click(screen.getByRole("button", { name: "添加任务" }));

    expect(onCreateTask).toHaveBeenCalledWith({
      title: "晨读",
      content: "朗读古诗",
      plannedDurationMinutes: 20,
      subjectId: "subject-chinese",
      repeatRule: { type: "none" },
    });
  });

  it("submits a daily repeated study task", async () => {
    const user = userEvent.setup();
    const onCreateTask = renderPlanner();

    await user.type(screen.getByLabelText("任务名称"), "口算练习");
    await user.selectOptions(screen.getByLabelText("重复"), "daily");
    fireEvent.change(screen.getByLabelText("结束日期"), { target: { value: "2026-05-13" } });
    await user.click(screen.getByRole("button", { name: "添加任务" }));

    expect(onCreateTask).toHaveBeenCalledWith({
      title: "口算练习",
      content: "",
      plannedDurationMinutes: 20,
      subjectId: "subject-chinese",
      repeatRule: { type: "daily", startDate: "2026-05-11", endDate: "2026-05-13" },
    });
  });
});
