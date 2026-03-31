import { Link, useRouterState } from "@tanstack/react-router";

interface Tab { to: string; label: string; }
interface SubTabsProps { tabs: Tab[]; }

export function SubTabs({ tabs }: SubTabsProps) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="flex gap-4 border-b border-border-glass px-4 py-2">
      {tabs.map((tab) => {
        const isActive = pathname === tab.to;
        return (
          <Link key={tab.to} to={tab.to}
            className={`pb-1 text-xs transition-colors ${
              isActive ? "border-b-2 border-accent-green text-accent-green" : "text-text-muted hover:text-text-primary"
            }`}>
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
