import type { Metadata } from "next";
import {
  LandingCta,
  LandingFooter,
  LandingPrinciple,
} from "@/features/landing/components/landing-cta";
import { LandingFeatures } from "@/features/landing/components/landing-features";
import { LandingHeader } from "@/features/landing/components/landing-header";
import { LandingHero } from "@/features/landing/components/landing-hero";
import { LandingSteps } from "@/features/landing/components/landing-steps";

export const metadata: Metadata = {
  title: "Website Studio — from a short brief to a finished website",
  description:
    "Describe a business, let AI write six pages, then edit every word and image in a live visual editor.",
};

export default function LandingPage() {
  return (
    <div className="flex-1">
      <LandingHeader />
      <main>
        <LandingHero />
        <LandingSteps />
        <LandingFeatures />
        <LandingPrinciple />
        <LandingCta />
      </main>
      <LandingFooter />
    </div>
  );
}
