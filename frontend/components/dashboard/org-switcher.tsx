"use client";

import { useState } from "react";
import { type Org } from "@/lib/store";
import { CheckIcon, PlusIcon, XIcon, BuildingIcon } from "@/components/icons";

export function OrgSwitcher({
  orgs,
  activeOrgId,
  onSwitch,
  onCreate,
}: {
  orgs: Org[];
  activeOrgId: string;
  onSwitch: (id: string) => void;
  onCreate: () => void;
}) {
  const [open, setOpen] = useState(false);
  
  const activeOrg = orgs.find((o) => o.id === activeOrgId) || orgs[0];
  if (!activeOrg) return null;

  const initial = activeOrg.businessName.charAt(0).toUpperCase();

  return (
    <div className="org-switcher-wrapper">
      <button 
        className="org-switcher-trigger" 
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <div className="org-avatar">{initial}</div>
        <div className="org-name-col">
          <span className="org-name-main">{activeOrg.businessName}</span>
          <span className="org-name-sub">Free Plan</span>
        </div>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginLeft: 'auto', opacity: 0.5 }}>
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <>
          <div className="org-switcher-backdrop" onClick={() => setOpen(false)} />
          <div className="org-switcher-menu">
            <div className="org-menu-label">Your Organizations</div>
            {orgs.map(org => (
              <button 
                key={org.id} 
                className={`org-menu-item ${org.id === activeOrgId ? 'active' : ''}`}
                onClick={() => {
                  onSwitch(org.id);
                  setOpen(false);
                }}
              >
                <div className="org-avatar small">{org.businessName.charAt(0).toUpperCase()}</div>
                <span className="org-item-name">{org.businessName}</span>
                {org.id === activeOrgId && <CheckIcon size={16} className="org-check" />}
              </button>
            ))}
            <div className="org-menu-divider" />
            <button 
              className="org-menu-item new-org-btn"
              onClick={() => {
                setOpen(false);
                onCreate();
              }}
            >
              <div className="org-avatar small add-icon"><PlusIcon size={14} /></div>
              <span className="org-item-name">Create Organization</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export function OrgModal({
  isOpen,
  onClose,
  onSubmit,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string, category: string) => void;
}) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Coffee Shop");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit(name.trim(), category);
    setName("");
    setCategory("Coffee Shop");
  };

  return (
    <div className="org-modal-overlay">
      <div className="org-modal-backdrop" onClick={onClose} />
      <div className="org-modal-content bento-card reveal active">
        <button className="org-modal-close" onClick={onClose}>
          <XIcon size={20} />
        </button>
        <div className="bento-icon-wrapper blue" style={{ marginBottom: 16 }}>
          <BuildingIcon size={24} />
        </div>
        <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>New Organization</h2>
        <p style={{ color: "var(--text-muted)", fontSize: 14, marginBottom: 24 }}>
          Create a new workspace for another business. Each organization has its own brand profile, posts, and integrations.
        </p>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-group">
            <label className="form-label">Business Name</label>
            <input 
              className="form-input" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              placeholder="e.g. The Second Grind"
              autoFocus
            />
          </div>
          <div className="form-group">
            <label className="form-label">Category</label>
            <select className="form-select" value={category} onChange={e => setCategory(e.target.value)}>
              <option>Coffee Shop</option>
              <option>Restaurant</option>
              <option>Bakery</option>
              <option>Salon & Beauty</option>
              <option>Fitness Studio</option>
              <option>Retail Store</option>
              <option>Other</option>
            </select>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 16 }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-accent" disabled={!name.trim()}>Create Workspace</button>
          </div>
        </form>
      </div>
    </div>
  );
}
