import { useState } from "react";
import { AppLayout, type AppView } from "./components/AppLayout";
import { EmptyState } from "./components/EmptyState";

export default function App() {
  const [activeView, setActiveView] = useState<AppView>("dashboard");

  return (
    <AppLayout activeView={activeView} onViewChange={setActiveView}>
      <EmptyState title="好学伴" description="学习计划与打卡统计助手" />
    </AppLayout>
  );
}
