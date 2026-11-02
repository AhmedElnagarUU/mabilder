import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { requirePageUser } from "@/features/auth/session";
import { InboxList } from "@/features/inquiries/components/inbox-list";
import { InboxLocked } from "@/features/inquiries/components/inbox-locked";
import { WhatsAppSettingsForm } from "@/features/inquiries/components/whatsapp-settings";
import { getInbox } from "@/features/inquiries/service";
import { DashboardShell } from "@/features/site-creation/components/dashboard-shell";
import { getSite, listSites } from "@/features/site-creation/service";
import { Link } from "@/shared/i18n/navigation";
import { buttonClass } from "@/shared/ui/button";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/dashboard/inbox">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "inbox.meta" });

  return {
    title: t("title"),
    description: t("description"),
  };
}

export const dynamic = "force-dynamic";

export default async function InboxPage({ params }: PageProps<"/[locale]/dashboard/inbox">) {
  const { locale } = await params;
  setRequestLocale(locale);

  const user = await requirePageUser(locale, "/dashboard/inbox");
  const t = await getTranslations("inbox");

  const summary = (await listSites(user.id))[0] ?? null;
  const site = summary ? await getSite(user.id, summary.id) : null;
  let inbox = null;
  let loadFailed = false;

  try {
    inbox = site ? await getInbox(user.id, site.id) : null;
  } catch (error) {
    console.error(error);
    loadFailed = true;
  }

  return (
    <DashboardShell user={user} site={site} crumbLabel={t("breadcrumb")} active="inbox">
      <main className="pt-7 pb-6">
        <h1 className="font-display text-[clamp(24px,2.4vw,29px)] leading-[1.05] font-light tracking-[-0.045em] text-[#f1f1ee]">
          {t("title")}
        </h1>
        <p data-tour="inbox-intro" className="mt-2 mb-6 max-w-2xl text-base text-dim">
          {t("subtitle")}
        </p>

        {loadFailed ? (
          <div className="rounded-panel border border-danger/20 bg-danger-soft px-4 py-3 text-sm text-danger">
            {t("errors.default")}
          </div>
        ) : !site || !inbox ? (
          <div className="rounded-panel border border-line-soft px-6 py-12 text-center">
            <p className="text-base text-muted">{t("noSite")}</p>
            <Link href="/dashboard/new" className={buttonClass("primary", "md", "mt-6")}>
              {t("noSiteCta")}
            </Link>
          </div>
        ) : (
          <>
            {inbox.locked ? (
              <InboxLocked newCount={inbox.newCount} />
            ) : (
              <InboxList siteId={site.id} items={inbox.items} />
            )}
            <WhatsAppSettingsForm
              siteId={site.id}
              initial={site.whatsapp}
              sitePhone={site.content?.facts.phone}
            />
          </>
        )}
      </main>
    </DashboardShell>
  );
}
