import { CircleArrowUp, Moon, Rocket, Sun } from "lucide-react";
import { routes } from "@/constants";
import type { Route } from "@/types";
import { Button } from "@/components/ui/button";

type SidebarProps = {
  currentRoute: Route;
  onNavigate: (route: Route) => void;
  hasUpdate?: boolean;
  latestVersion?: string;
  theme: "dark" | "light";
  onToggleTheme: () => void;
  onRestart: () => void;
};

export function Sidebar({
  currentRoute,
  onNavigate,
  hasUpdate,
  latestVersion,
  theme,
  onToggleTheme,
  onRestart,
}: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">C++</div>
        <div className="brand-copy">
          <div className="brand-title-row">
            <div className="brand-title">Codex++</div>
            {hasUpdate ? (
              <button
                className="update-dot"
                onClick={() => onNavigate("about")}
                title={`New version available: ${latestVersion ?? ""}`}
                type="button"
              >
                <CircleArrowUp className="h-4 w-4" aria-hidden="true" />
              </button>
            ) : null}
          </div>
          <div className="brand-subtitle">Management Console</div>
        </div>
      </div>
      <nav className="nav">
        {routes.map((item) => {
          const Icon = item.icon;
          return (
            <button
              className={`nav-item ${currentRoute === item.id ? "active" : ""}`}
              key={item.id}
              onClick={() => onNavigate(item.id)}
              title={item.label}
              type="button"
            >
              <span className="nav-icon">
                <Icon className="h-4 w-4" aria-hidden="true" />
              </span>
              <span className="nav-label">{item.label}</span>
              {item.badge ? <span className="nav-badge">{item.badge}</span> : null}
            </button>
          );
        })}
      </nav>
      <div className="sidebar-actions">
        <Button
          onClick={onToggleTheme}
          size="icon"
          title={theme === "dark" ? "Switch to light" : "Switch to dark"}
          variant="outline"
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
        <Button onClick={onRestart} title="Restart Codex++" variant="outline">
          <Rocket className="h-4 w-4" />
          Restart Codex++
        </Button>
      </div>
    </aside>
  );
}
