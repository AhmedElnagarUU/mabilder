"use client";

import { useTranslations } from "next-intl";
import { authClient } from "@/features/auth/auth-client";
import { SignOutButton } from "@/features/auth/components/sign-out-button";
import { Link } from "@/shared/i18n/navigation";
import { Icon } from "@/shared/ui/icon";

const headerPillClassName =
  "hidden h-[38px] items-center gap-1.5 rounded-full border border-white/[0.13] bg-white/[0.04] px-[17px] text-[11.5px] text-[#e8e8e5] transition-colors hover:border-white/[0.22] hover:bg-white/[0.09] sm:inline-flex";

const menuPrimaryClassName =
  "mt-1 flex h-11 items-center justify-between rounded-[11px] bg-[#efefeb] px-3.5 text-[13px] font-medium text-[#08080a]";

const menuRowClassName =
  "flex h-11 items-center justify-between rounded-[11px] px-3.5 text-[13px] text-[#c9c9c6] transition-colors hover:bg-white/[0.055] hover:text-white";

const variantClassNames = {
  header: {
    primary: headerPillClassName,
    secondary: headerPillClassName,
    arrow: "h-3 w-3 rtl:rotate-180",
  },
  menu: {
    primary: menuPrimaryClassName,
    secondary: menuRowClassName,
    arrow: "h-3.5 w-3.5 rtl:rotate-180",
  },
};

export function LandingAccountActions({
  variant,
  onNavigate,
}: {
  variant: "header" | "menu";
  onNavigate?: () => void;
}) {
  const t = useTranslations("landing.nav");
  const { data: session } = authClient.useSession();
  const classNames = variantClassNames[variant];

  if (session) {
    return (
      <>
        <Link href="/dashboard" onClick={onNavigate} className={classNames.primary}>
          {t("dashboard")}
        </Link>
        <SignOutButton redirectTo="/" className={classNames.secondary} />
      </>
    );
  }

  return (
    <>
      <Link href="/dashboard" onClick={onNavigate} className={classNames.primary}>
        {t("startTrial")}
        <Icon name="arrow-up" className={classNames.arrow} />
      </Link>
      <Link href="/sign-in" onClick={onNavigate} className={classNames.secondary}>
        {t("signIn")}
      </Link>
    </>
  );
}
