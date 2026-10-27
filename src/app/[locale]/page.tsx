import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import {
  LandingCta,
  LandingFooter,
  LandingPrinciple,
} from "@/features/landing/components/landing-cta";
import { LandingFeatures } from "@/features/landing/components/landing-features";
import { LandingHeader } from "@/features/landing/components/landing-header";
import { LandingHero } from "@/features/landing/components/landing-hero";
import { LandingSteps } from "@/features/landing/components/landing-steps";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "landing.meta" });

  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function LandingPage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  setRequestLocale(locale);

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
