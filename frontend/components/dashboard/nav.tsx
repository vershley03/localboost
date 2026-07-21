"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CalendarIcon,
  FingerprintIcon,
  HomeIcon,
  MenuIcon,
  PlugIcon,
  SparklesIcon,
  StarIcon,
  TargetIcon,
  XIcon,
} from "@/components/icons";
import { PinSparkLogo } from "@/components/logo";

export type TabId = "overview" | "creator" | "calendar" | "brand" | "reputation" | "competitor-watch" | "integrations";

export const TABS: { id: TabId; label: string; icon: typeof HomeIcon }[] = [
  { id: "overview", label: "Overview", icon: HomeIcon },
  { id: "creator", label: "Magic Creator", icon: SparklesIcon },
  { id: "calendar", label: "Calendar", icon: CalendarIcon },
  { id: "brand", label: "Brand DNA", icon: FingerprintIcon },
  { id: "reputation", label: "Reputation", icon: StarIcon },
  { id: "competitor-watch", label: "Competitor Watch", icon: TargetIcon },
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
  orgs,
  activeOrgId,
  onSwitchOrg,
  onCreateOrg,
}: {
  active: TabId;
  onSelect: (t: TabId) => void;
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
import { UserButton } from "@clerk/nextjs";

export function MobileNav({
  active,
  onSelect,
  posts,
  orgs,
  activeOrgId,
  onSwitchOrg,
  onCreateOrg,
}: {
  active: TabId;
  onSelect: (t: TabId) => void;
  posts: ScheduledPost[];
  orgs: Org[];
  activeOrgId: string;
  onSwitchOrg: (id: string) => void;
  onCreateOrg: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 900) {
        setMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleSelect = (tab: TabId) => {
    onSelect(tab);
    setMenuOpen(false);
  };

  return (
    <>
      <div className="app-topbar">
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            type="button"
            className="app-mobile-menu-btn"
            onClick={() => setMenuOpen((value) => !value)}
            aria-expanded={menuOpen}
            aria-controls="dashboard-mobile-menu"
            aria-label={menuOpen ? "Close navigation" : "Open navigation"}
          >
            {menuOpen ? <XIcon size={20} /> : <MenuIcon size={20} />}
          </button>
          <Link href="/" className="app-sidebar-logo" style={{ margin: 0, padding: 0 }}>
            <Logo iconSize={28} />
          </Link>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <ThemeToggle />
          <NotificationBell posts={posts} />
          <UserButton />
        </div>
      </div>
      {menuOpen && <button type="button" className="app-mobile-menu-backdrop" aria-label="Close navigation" onClick={() => setMenuOpen(false)} />}
      <nav
        id="dashboard-mobile-menu"
        className={`app-mobile-nav${menuOpen ? " open" : ""}`}
        aria-label="Dashboard"
      >
        <div className="app-mobile-nav-header">
          <div>
            <div className="app-mobile-nav-eyebrow">Workspace</div>
            <div className="app-mobile-nav-title">Choose a section</div>
          </div>
        </div>
        <div className="app-mobile-nav-utilities">
          <div className="app-mobile-nav-org-block">
            <div className="app-mobile-nav-section-label">Organization</div>
            <OrgSwitcher
              orgs={orgs}
              activeOrgId={activeOrgId}
              onSwitch={onSwitchOrg}
              onCreate={onCreateOrg}
            />
          </div>
        </div>
        <NavItems active={active} onSelect={handleSelect} />
      </nav>
    </>
  );
}
