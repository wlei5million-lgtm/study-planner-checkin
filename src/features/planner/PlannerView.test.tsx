import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { makeSubject } from "../../test/factories";
import { PlannerView } from "./PlannerView";

describe("PlannerView", () => {
  it("submits a new study task", async () => {
    const user = userEvent.setup();
    const onCreateTask = vi.fn();

    render(
      <PlannerView
        date="2026-05-11"
        subjects={[makeSubject({ id: "subject-chinese", name: "语文" })]}
        tasks={[]}
        onCreateTask={onCreateTask}
        onStartTask={vi.fn()}
        onPauseTask={vi.fn()}
        onStopTask={vi.fn()}
      />,
    );

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
    });
  });
});
