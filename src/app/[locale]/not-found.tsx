import { useTranslations } from "next-intl";
import { Link } from "@/shared/i18n/navigation";

export default function NotFoundPage() {
  const t = useTranslations("common.notFound");

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-5 py-24 text-center">
      <p className="mono-label text-[9px] tracking-[0.12em] text-faint">404</p>
      <h1 className="mt-4 font-display text-[clamp(32px,4vw,48px)] leading-none font-normal tracking-[-0.05em]">
        {t("title")}
      </h1>
      <p className="mt-3 max-w-md text-sm leading-[1.65] text-muted">
        {t("description")}
      </p>
      <Link
        href="/"
        className="mt-7 inline-flex h-11 items-center rounded-full bg-accent px-5 text-sm font-medium text-[#04211f] transition hover:-translate-y-px hover:bg-[#8ff5e4]"
      >
        {t("back")}
      </Link>
    </div>
  );
}
