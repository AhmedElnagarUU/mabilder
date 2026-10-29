import { getTranslations } from "next-intl/server";
import { Link } from "@/shared/i18n/navigation";
import { trialDaysLeft } from "../access";
import { getUserAccess } from "../user-access";

async function loadAccess(userId: string) {
  try {
    return await getUserAccess(userId);
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function PlanBadge({ userId }: { userId: string }) {
  const access = await loadAccess(userId);

  if (!access) {
    return null;
  }

  const t = await getTranslations("billing.badge");
  const label =
    access.state === "trial" && access.trialEndsAt
      ? t("trial", { count: trialDaysLeft(access.trialEndsAt) })
      : t(access.state);

  return (
    <Link
      href="/billing"
      className={`rounded-full border px-3 py-1 text-[12px] ${
        access.state === "expired"
          ? "border-danger/25 text-danger"
          : "border-line text-soft hover:text-ink"
      }`}
    >
      {label}
    </Link>
  );
}
