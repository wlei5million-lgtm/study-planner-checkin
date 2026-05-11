import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { makeSubject, makeTask } from "../../test/factories";
import { DashboardView } from "./DashboardView";

describe("DashboardView", () => {
  it("shows daily summary metrics", () => {
    render(
      <DashboardView
        date="2026-05-11"
        subjects={[
          makeSubject({ id: "chinese", name: "语文", kind: "study" }),
          makeSubject({ id: "sports", name: "运动", kind: "sports" }),
        ]}
        tasks={[
          makeTask({ subjectId: "chinese", actualDurationSeconds: 3600, status: "completed" }),
          makeTask({ subjectId: "sports", actualDurationSeconds: 1800, status: "planned" }),
        ]}
      />,
    );

    expect(screen.getByText("今日学习")).toBeInTheDocument();
    expect(screen.getByText("1.0h")).toBeInTheDocument();
    expect(screen.getByText("50%")).toBeInTheDocument();
  });
});
