import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { requireAdminPage } from "@/features/admin/auth/guards";
import { AdminShell } from "@/features/admin/components/admin-shell";
import { FeedbackInbox } from "@/features/admin/components/feedback-inbox";
import { listFeedbackInbox } from "@/features/admin/service";
import { feedbackListQuerySchema } from "@/features/feedback/types";

export const metadata: Metadata = {
  title: "Admin feedback",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

function firstValues(searchParams: Record<string, string | string[] | undefined>) {
  return Object.fromEntries(
    Object.entries(searchParams).map(([key, value]) => [key, Array.isArray(value) ? value[0] : value]),
  );
}

export default async function AdminFeedbackPage({
  params,
  searchParams,
}: PageProps<"/[locale]/admin/feedback">) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireAdminPage(locale);

  const query = feedbackListQuerySchema.parse(firstValues(await searchParams));

  return (
    <AdminShell title="Feedback" active="feedback">
      <FeedbackInbox page={await listFeedbackInbox(query)} query={query} />
    </AdminShell>
  );
}
