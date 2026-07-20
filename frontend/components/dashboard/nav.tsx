"use client";

import Link from "next/link";
import {
  CalendarIcon,
  FingerprintIcon,
  HomeIcon,
  PlugIcon,
  SparklesIcon,
  StarIcon,
} from "@/components/icons";
import { PinSparkLogo } from "@/components/logo";

export type TabId = "overview" | "creator" | "calendar" | "brand" | "reputation" | "integrations";

export const TABS: { id: TabId; label: string; icon: typeof HomeIcon }[] = [
  { id: "overview", label: "Overview", icon: HomeIcon },
  { id: "creator", label: "Magic Creator", icon: SparklesIcon },
  { id: "calendar", label: "Calendar", icon: CalendarIcon },
  { id: "brand", label: "Brand DNA", icon: FingerprintIcon },
  { id: "reputation", label: "Reputation", icon: StarIcon },
  { id: "integrations", label: "Integrations", icon: PlugIcon },
];

export function Logo({ iconSize = 32 }: { iconSize?: number }) {
  return <PinSparkLogo size={iconSize} />;
}

function NavItems({ active, onSelect }: { active: TabId; onSelect: (t: TabId) => void }) {
  return (
    <>
      {TABS.map(({ id, label, icon: TabIcon }) => (
        <button
          key={id}
          className={`app-nav-item ${active === id ? "active" : ""}`}
          onClick={() => onSelect(id)}
          aria-current={active === id ? "page" : undefined}
        >
          <TabIcon size={20} />
          {label}
        </button>
      ))}
    </>
  );
}

import { OrgSwitcher } from "./org-switcher";
import { type Org, type ScheduledPost } from "@/lib/store";
import { ThemeToggle } from "./theme-toggle";

export function Sidebar({
  active,
  onSelect,
  businessName,
  orgs,
  activeOrgId,
  onSwitchOrg,
  onCreateOrg,
}: {
  active: TabId;
  onSelect: (t: TabId) => void;
  businessName: string;
  orgs: Org[];
  activeOrgId: string;
  onSwitchOrg: (id: string) => void;
  onCreateOrg: () => void;
}) {
  return (
    <aside className="app-sidebar">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
        <Link href="/" className="app-sidebar-logo" style={{ margin: 0, padding: 0 }}>
          <Logo />
        </Link>
      </div>
      <nav className="app-nav" aria-label="Dashboard">
        <NavItems active={active} onSelect={onSelect} />
      </nav>
      <div className="app-sidebar-footer" style={{ padding: '16px 0 0 0', borderTop: '1px solid var(--border)', marginTop: 'auto' }}>
        <OrgSwitcher 
          orgs={orgs}
          activeOrgId={activeOrgId}
          onSwitch={onSwitchOrg}
          onCreate={onCreateOrg}
        />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 12px 0', borderTop: '1px solid var(--border)', marginTop: 12 }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Appearance</span>
          <ThemeToggle />
        </div>
      </div>
    </aside>
  );
}

import { NotificationBell } from "./notification-bell";

export function MobileNav({
  active,
  onSelect,
  posts,
}: {
  active: TabId;
  onSelect: (t: TabId) => void;
  posts: ScheduledPost[];
}) {
  return (
    <>
      <div className="app-topbar">
        <Link href="/" className="app-sidebar-logo" style={{ margin: 0, padding: 0 }}>
          <Logo iconSize={28} />
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <NotificationBell posts={posts} />
          <div className="app-avatar" style={{ width: 34, height: 34, fontSize: 13 }}>
            S
          </div>
        </div>
      </div>
      <nav className="app-mobile-nav" aria-label="Dashboard">
        <NavItems active={active} onSelect={onSelect} />
      </nav>
    </>
  );
}
