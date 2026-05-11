import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { makeSubject, makeTask } from "../../test/factories";
import { StatsView } from "./StatsView";

describe("StatsView", () => {
  it("renders time by subject", () => {
    const subjects = [
      makeSubject({ id: "subject-chinese", name: "语文", color: "#ef5b5b" }),
      makeSubject({ id: "subject-math", name: "数学", color: "#315ba7", sortOrder: 2 }),
    ];
    const tasks = [
      makeTask({ subjectId: "subject-chinese", actualDurationSeconds: 3600, status: "completed" }),
      makeTask({ id: "task-2", subjectId: "subject-math", actualDurationSeconds: 1800, status: "completed" }),
    ];

    render(<StatsView subjects={subjects} tasks={tasks} />);

    expect(screen.getByRole("heading", { name: "各科用时统计" })).toBeInTheDocument();
    expect(screen.getByText("语文")).toBeInTheDocument();
    expect(screen.getByText("1.0h")).toBeInTheDocument();
    expect(screen.getByText("数学")).toBeInTheDocument();
    expect(screen.getByText("0.5h")).toBeInTheDocument();
  });
});
