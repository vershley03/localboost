import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { PinSparkLogo } from "@/components/logo";
import { MarketingPricingSection } from "@/components/marketing/pricing-section";

export default async function PricingPage() {
  const { userId } = await auth();

  return (
    <div className="pricing-page">
      <div className="page-backdrop" aria-hidden="true">
        <div className="page-grid" />
        <div className="page-glow" />
      </div>

      <nav className="pricing-page-nav">
        <Link href="/" className="pricing-page-logo">
          <PinSparkLogo size={32} />
        </Link>
        <div className="pricing-page-nav-actions">
          {userId ? (
            <Link href="/dashboard" className="btn btn-primary btn-sm">
              Open dashboard
            </Link>
          ) : (
            <>
              <Link href="/sign-in" className="btn btn-outline btn-sm">
                Sign in
              </Link>
              <Link href="/sign-up" className="btn btn-primary btn-sm">
                Start free
              </Link>
            </>
          )}
        </div>
      </nav>

      <div className="pricing-page-content">
        <MarketingPricingSection />
      </div>
    </div>
  );
}
