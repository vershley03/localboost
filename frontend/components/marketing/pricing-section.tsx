"use client";

import { PricingTable } from "@clerk/nextjs";

export function MarketingPricingSection() {
  return (
    <div className="pricing-shared">
      <div className="section-header pricing-shared-header">
        <div
          className="section-label"
          style={{ background: "rgba(2, 132, 199, 0.1)", color: "var(--accent)" }}
        >
          Pricing
        </div>
        <h2 className="section-title">Simple plans for local heroes.</h2>
        <p className="section-subtitle">
          Live plans come directly from Clerk, so checkout, trials, and upgrades stay
          consistent everywhere your customers see them.
        </p>
      </div>

      <div className="pricing-clerk-shell">
        <PricingTable newSubscriptionRedirectUrl="/dashboard" />
      </div>

      <p className="pricing-shared-note">
        Secure checkout is handled by Clerk. Your landing page and pricing page now use
        the same source of truth for plans and billing flows.
      </p>
    </div>
  );
}
