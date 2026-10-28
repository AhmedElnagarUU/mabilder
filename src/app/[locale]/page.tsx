import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { LandingAbout } from "@/features/landing/components/landing-about";
import { LandingCapabilities } from "@/features/landing/components/landing-capabilities";
import { LandingCta } from "@/features/landing/components/landing-cta";
import { LandingFooter } from "@/features/landing/components/landing-footer";
import { LandingHeader } from "@/features/landing/components/landing-header";
import { LandingHero } from "@/features/landing/components/landing-hero";
import { LandingHow } from "@/features/landing/components/landing-how";
import { LandingIndustries } from "@/features/landing/components/landing-industries";
import { LandingOrbit } from "@/features/landing/components/landing-orbit";
import { LandingPrinciple } from "@/features/landing/components/landing-principle";
import { LandingStats } from "@/features/landing/components/landing-stats";

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
        <LandingIndustries />
        <LandingOrbit />
        <LandingAbout />
        <LandingHow />
        <LandingCapabilities />
        <LandingStats />
        <LandingPrinciple />
        <LandingCta />
      </main>
      <LandingFooter />
    </div>
  );
}
