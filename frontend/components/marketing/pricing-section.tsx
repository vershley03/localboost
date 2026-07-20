"use client";

import Link from "next/link";
import { CheckIcon } from "@/components/icons";

interface PricingPlan {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  ctaStyle: "primary" | "outline";
  ctaHref: string;
  highlighted?: boolean;
}

const PRICING_PLANS: PricingPlan[] = [
  {
    name: "Starter",
    price: "$0",
    period: "",
    description: "Always free",
    features: [
      "1 Business Profile",
      "10 AI Generations/mo",
      "Basic Analytics",
      "Email Support",
    ],
    cta: "Get Started",
    ctaStyle: "outline",
    ctaHref: "/sign-up",
  },
  {
    name: "Pro Growth",
    price: "$24",
    period: "/month",
    description: "Everything you need to run your marketing on autopilot.",
    features: [
      "Up to 3 Profiles",
      "Unlimited AI Content",
      "Full Auto-Scheduling",
      "Advanced Analytics",
      "Priority Support",
      "Custom Brand DNA",
    ],
    cta: "Start 3-day free trial",
    ctaStyle: "primary",
    ctaHref: "/sign-up?plan=pro",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For teams with advanced needs.",
    features: [
      "Unlimited Profiles",
      "Unlimited AI Content",
      "White Label Options",
      "Custom Integrations",
      "Dedicated Support",
      "API Access",
    ],
    cta: "Contact Sales",
    ctaStyle: "outline",
    ctaHref: "/contact",
  },
];

export function MarketingPricingSection() {
  return (
    <div className="pricing-shared">
      <div className="section-header pricing-shared-header">
        <div className="section-label">
          Pricing
        </div>
        <h2 className="section-title">Simple plans for local heroes.</h2>
        <p className="section-subtitle">
          Start free and scale as you grow. No credit card required.
        </p>
      </div>

      <div className="pricing-grid">
        {PRICING_PLANS.map((plan) => (
          <div
            key={plan.name}
            className={`pricing-card ${plan.highlighted ? "pricing-card-highlighted" : ""}`}
          >
            <div className="pricing-card-header">
              <h3 className="pricing-card-name">{plan.name}</h3>
              <p className="pricing-card-desc">{plan.description}</p>
            </div>

            <div className="pricing-card-price">
              <span className="pricing-card-amount">{plan.price}</span>
              {plan.period && <span className="pricing-card-period">{plan.period}</span>}
            </div>

            <div className="pricing-card-billing">
              {plan.name === "Pro Growth" && (
                <label className="pricing-billing-toggle">
                  <input type="checkbox" defaultChecked />
                  <span>Billed annually</span>
                </label>
              )}
            </div>

            <Link href={plan.ctaHref} className={`btn btn-${plan.ctaStyle} btn-lg pricing-card-cta`}>
              {plan.cta}
            </Link>

            <div className="pricing-card-features">
              {plan.features.map((feature) => (
                <div key={feature} className="pricing-feature">
                  <CheckIcon size={20} />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <p className="pricing-shared-note">
        All plans include a 14-day free trial. No credit card required to get started.
      </p>
    </div>
  );
}
