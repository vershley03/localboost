"use client";

import Link from "next/link";
import {
  CalendarIcon,
  FingerprintIcon,
  HomeIcon,
  PlugIcon,
  SparklesIcon,
} from "@/components/icons";
import { PinSparkLogo } from "@/components/logo";

export type TabId = "overview" | "creator" | "calendar" | "brand" | "integrations";

export const TABS: { id: TabId; label: string; icon: typeof HomeIcon }[] = [
  { id: "overview", label: "Overview", icon: HomeIcon },
  { id: "creator", label: "Magic Creator", icon: SparklesIcon },
  { id: "calendar", label: "Calendar", icon: CalendarIcon },
  { id: "brand", label: "Brand DNA", icon: FingerprintIcon },
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
import { type Org } from "@/lib/store";

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
      <Link href="/" className="app-sidebar-logo">
        <Logo />
      </Link>
      
      <OrgSwitcher 
        orgs={orgs}
        activeOrgId={activeOrgId}
        onSwitch={onSwitchOrg}
        onCreate={onCreateOrg}
      />

      <nav className="app-nav" aria-label="Dashboard">
        <NavItems active={active} onSelect={onSelect} />
      </nav>
      <div className="app-sidebar-footer">
        <div className="app-user">
          <div className="app-avatar">S</div>
          <div>
            <div className="app-user-name">Sarah Jenkins</div>
            <div className="app-user-meta">{businessName}</div>
          </div>
        </div>
      </div>
    </aside>
  );
}

export function MobileNav({
  active,
  onSelect,
}: {
  active: TabId;
  onSelect: (t: TabId) => void;
}) {
  return (
    <>
      <div className="app-topbar">
        <Link href="/" className="app-sidebar-logo" style={{ margin: 0, padding: 0 }}>
          <Logo iconSize={28} />
        </Link>
        <div className="app-avatar" style={{ width: 34, height: 34, fontSize: 13 }}>
          S
        </div>
      </div>
      <nav className="app-mobile-nav" aria-label="Dashboard">
        <NavItems active={active} onSelect={onSelect} />
      </nav>
    </>
  );
}
