import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { requirePageUser } from "@/features/auth/session";
import { trialDaysLeft } from "@/features/billing/access";
import { BillingActions } from "@/features/billing/components/billing-actions";
import { getUserAccess } from "@/features/billing/user-access";
import { DashboardShell } from "@/features/site-creation/components/dashboard-shell";
import { listSites } from "@/features/site-creation/service";
import type { SiteSummary } from "@/features/site-creation/types";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/billing">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "billing.meta" });

  return {
    title: t("title"),
    description: t("description"),
  };
}

export const dynamic = "force-dynamic";

function formatDate(locale: string, value: Date): string {
  return value.toLocaleDateString(locale, { month: "long", day: "numeric", year: "numeric" });
}

async function loadSite(userId: string): Promise<SiteSummary | null> {
  try {
    return (await listSites(userId))[0] ?? null;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export default async function BillingPage({ params }: PageProps<"/[locale]/billing">) {
  const { locale } = await params;
  setRequestLocale(locale);

  const user = await requirePageUser(locale, "/billing");
  const t = await getTranslations("billing");
  const [access, site] = await Promise.all([getUserAccess(user.id), loadSite(user.id)]);

  let detail = t("expiredBody");

  if (access.state === "trial" && access.trialEndsAt) {
    detail = t("trialEnds", { date: formatDate(locale, access.trialEndsAt) });
  } else if (access.state === "active" && access.renewsAt) {
    detail = t(access.canceled ? "canceled" : "renews", {
      date: formatDate(locale, access.renewsAt),
    });
  }

  return (
    <DashboardShell user={user} site={site} crumbLabel={t("breadcrumb")}>
      <main>
        <div className="pt-7 pb-6">
          <h1 className="font-display text-[clamp(24px,2.4vw,29px)] leading-[1.05] font-light tracking-[-0.045em] text-[#f1f1ee]">
            {t("title")}
          </h1>
          <p className="mt-2 text-[13px] text-dim">{t("subtitle")}</p>
        </div>

        <section className="max-w-xl rounded-panel border border-line-soft bg-[linear-gradient(160deg,rgba(255,255,255,0.036),rgba(255,255,255,0.01))] p-[22px]">
          <p className="mono-label text-[11px] tracking-[0.12em] text-dim">{t("currentPlan")}</p>
          <p className="mt-2 font-display text-[26px] leading-none tracking-[-0.04em] text-[#f0f0ed]">
            {t(`state.${access.state}`)}
          </p>
          {access.state === "trial" && access.trialEndsAt ? (
            <p className="mt-3 text-sm text-ink">
              {t("trialDaysLeft", { count: trialDaysLeft(access.trialEndsAt) })}
            </p>
          ) : null}
          <p className="mt-2 text-sm leading-[1.65] text-muted">{detail}</p>
          <div className="mt-6">
            <BillingActions canManage={access.state === "active"} />
          </div>
        </section>
      </main>
    </DashboardShell>
  );
}
