"use client";

import { PricingTable } from "@clerk/nextjs";
import Link from "next/link";
import { PinSparkLogo } from "@/components/logo";

export default function PricingPage() {
  return (
    <div className="pricing-page">
      <nav className="pricing-page-nav">
        <Link href="/" className="pricing-page-logo">
          <PinSparkLogo size={32} />
        </Link>
        <Link href="/dashboard" className="btn btn-outline btn-sm">
          Go to Dashboard
        </Link>
      </nav>

      <div className="pricing-page-content">
        <div className="pricing-page-header">
          <h1 className="pricing-page-title">Choose your plan</h1>
          <p className="pricing-page-subtitle">
            Start free and upgrade when you&apos;re ready to automate everything.
          </p>
        </div>

        <PricingTable
          newSubscriptionRedirectUrl="/dashboard"
        />
      </div>
    </div>
  );
}
