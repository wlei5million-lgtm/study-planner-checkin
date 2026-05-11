import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import App from "./App";

describe("App", () => {
  it("renders the product shell", () => {
    render(<App />);

    expect(screen.getByRole("heading", { name: "好学伴" })).toBeInTheDocument();
    expect(screen.getByText("学习计划与打卡统计助手")).toBeInTheDocument();
  });
});
