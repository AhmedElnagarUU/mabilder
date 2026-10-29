import { getFormatter, getTranslations } from "next-intl/server";
import { Icon } from "@/shared/ui/icon";
import type { ActivityItem } from "../types";

export async function RecentActivity({
  items,
  now,
}: {
  items: ActivityItem[];
  now: Date;
}) {
  const t = await getTranslations("dashboard.activity");
  const format = await getFormatter();

  return (
    <article className="relative flex flex-col self-start overflow-hidden rounded-panel border border-accent/10 bg-[linear-gradient(155deg,rgba(94,234,212,0.075),rgba(255,255,255,0.012)_54%)] p-[18px] min-w-0 lg:col-span-4">
      <span
        aria-hidden
        className="absolute -top-[120px] -end-[100px] h-[230px] w-[230px] rounded-full bg-[radial-gradient(circle,rgba(94,234,212,0.16),transparent_64%)]"
      />
      <div className="relative flex items-center gap-2 text-[#d8e7e3]">
        <Icon name="clock" className="h-[13px] w-[13px] text-accent" />
        <h3 className="text-[13px] font-medium tracking-[-0.01em]">
          {t("title")}
        </h3>
      </div>
      {items.length === 0 ? (
        <p className="relative mt-3 text-[13px] leading-[1.7] text-muted">
          {t("empty")}
        </p>
      ) : (
        <ul className="relative mt-3 divide-y divide-white/[0.04]">
          {items.map((item) => (
            <li key={item.id} className="py-2.5 first:pt-0 last:pb-0">
              <p className="text-[13px] leading-[1.6] text-muted">
                {t(`types.${item.type}`)}
              </p>
              <p className="mt-0.5 text-[11px] text-faint">
                {format.relativeTime(new Date(item.createdAt), now)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}
