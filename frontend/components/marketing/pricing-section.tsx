"use client";

import { ClerkFailed, ClerkLoaded, ClerkLoading, PricingTable } from "@clerk/nextjs";

function PricingSkeleton() {
  return (
    <div className="pricing-fallback" aria-hidden="true">
      {[0, 1, 2].map((card) => (
        <div key={card} className="pricing-fallback-card">
          <div className="pricing-fallback-line title" />
          <div className="pricing-fallback-line price" />
          <div className="pricing-fallback-line" />
          <div className="pricing-fallback-line short" />
          <div className="pricing-fallback-line" />
          <div className="pricing-fallback-line cta" />
        </div>
      ))}
    </div>
  );
}

export function MarketingPricingSection() {
  return (
    <div className="pricing-shared">
      <div className="section-header pricing-shared-header">
        <div className="section-label">
          Pricing
        </div>
        <h2 className="section-title">Simple plans for local heroes.</h2>
        <p className="section-subtitle">
          Start free and upgrade when you&apos;re ready. Every plan includes the AI
          content creator, your brand profile, and scheduling.
        </p>
      </div>

      <div className="pricing-clerk-shell">
        <ClerkLoading>
          <PricingSkeleton />
        </ClerkLoading>

        <ClerkLoaded>
          <PricingTable newSubscriptionRedirectUrl="/dashboard" />
        </ClerkLoaded>

        <ClerkFailed>
          <div className="pricing-unavailable" role="status">
            <div className="pricing-unavailable-title">Plans are taking a moment</div>
            <p className="pricing-unavailable-text">
              We couldn&apos;t load live pricing just now. Refresh the page, or email us
              at <a href="mailto:hello@pinspark.app">hello@pinspark.app</a> and we&apos;ll
              walk you through the plans.
            </p>
          </div>
        </ClerkFailed>
      </div>

      <p className="pricing-shared-note">
        Secure checkout. Cancel or change your plan any time — no contracts, no setup fees.
      </p>
    </div>
  );
}
