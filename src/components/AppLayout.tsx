import { BarChart3, CalendarCheck, Home, Settings } from "lucide-react";
import type { ReactNode } from "react";

export type AppView = "dashboard" | "planner" | "stats" | "settings";

type AppLayoutProps = {
  activeView: AppView;
  onViewChange: (view: AppView) => void;
  children?: ReactNode;
};

const navItems = [
  { id: "dashboard", label: "首页", icon: Home },
  { id: "planner", label: "学习计划", icon: CalendarCheck },
  { id: "stats", label: "数据统计", icon: BarChart3 },
  { id: "settings", label: "设置", icon: Settings },
] as const;

export function AppLayout({ activeView, onViewChange, children }: AppLayoutProps) {
  return (
    <div className="app-frame">
      <aside className="sidebar" aria-label="主导航">
        <div className="brand">
          <strong>好学伴</strong>
          <span>计划与打卡</span>
        </div>
        <nav className="nav-list">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                className={activeView === item.id ? "nav-button active" : "nav-button"}
                onClick={() => onViewChange(item.id)}
                type="button"
              >
                <Icon size={18} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </aside>
      <main className="content-panel">{children}</main>
    </div>
  );
}
