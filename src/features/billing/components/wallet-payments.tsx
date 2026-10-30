import { getTranslations } from "next-intl/server";
import type { PaymentItem } from "../payments/types";
import type { WalletInfo } from "../settings/types";
import { WalletPaymentForm } from "./wallet-payment-form";

const panelClass =
  "max-w-xl rounded-panel border border-line-soft bg-[linear-gradient(160deg,rgba(255,255,255,0.036),rgba(255,255,255,0.01))] p-[22px]";

export async function WalletPayments({
  locale,
  wallet,
  payments,
}: {
  locale: string;
  wallet: WalletInfo;
  payments: PaymentItem[];
}) {
  const t = await getTranslations("billing.wallet");
  const hasPending = payments.some((payment) => payment.status === "pending");
  const hasAccounts = wallet.wallets.length > 0 || wallet.instapayAddress !== "";

  return (
    <section className={`mt-6 ${panelClass}`}>
      <h2 className="font-display text-[20px] leading-none tracking-[-0.03em] text-[#f0f0ed]">
        {t("title")}
      </h2>
      <p className="mt-3 text-sm leading-[1.65] text-muted">{t("intro", { price: wallet.priceEgp })}</p>
      <p className="mt-2 text-sm text-ink">{t("price", { price: wallet.priceEgp })}</p>

      <h3 className="mono-label mt-5 text-[11px] tracking-[0.12em] text-dim">{t("accountsTitle")}</h3>
      {hasAccounts ? (
        <ul className="mt-2 space-y-1.5 text-sm text-ink">
          {wallet.wallets.map((account) => (
            <li key={`${account.method}-${account.number}`}>
              {t(account.method)}: <bdi>{account.number}</bdi>
              {account.name ? ` (${account.name})` : ""}
            </li>
          ))}
          {wallet.instapayAddress ? (
            <li>
              {t("instapayAddress")}: <bdi>{wallet.instapayAddress}</bdi>
            </li>
          ) : null}
        </ul>
      ) : (
        <p className="mt-2 text-sm text-muted">{t("noAccounts")}</p>
      )}

      {wallet.instructions ? (
        <>
          <h3 className="mono-label mt-5 text-[11px] tracking-[0.12em] text-dim">{t("instructionsTitle")}</h3>
          <p className="mt-2 text-sm leading-[1.65] whitespace-pre-line text-muted">{wallet.instructions}</p>
        </>
      ) : null}

      <h3 className="mono-label mt-6 text-[11px] tracking-[0.12em] text-dim">{t("formTitle")}</h3>
      {hasPending ? (
        <p className="mt-2 text-sm text-ink">{t("pendingNotice")}</p>
      ) : (
        <WalletPaymentForm priceEgp={wallet.priceEgp} />
      )}

      <h3 className="mono-label mt-6 text-[11px] tracking-[0.12em] text-dim">{t("historyTitle")}</h3>
      {payments.length === 0 ? (
        <p className="mt-2 text-sm text-muted">{t("historyEmpty")}</p>
      ) : (
        <ul className="mt-2 divide-y divide-line-soft text-sm">
          {payments.map((payment) => (
            <li key={payment.id} className="flex justify-between gap-4 py-2">
              <span className="text-ink">
                {payment.amount} {payment.currency} · {t(payment.method)}
                {payment.senderPhone ? (
                  <span className="block text-muted">
                    {t("senderPhoneLabel")}: <bdi>{payment.senderPhone}</bdi>
                  </span>
                ) : null}
                {payment.reference ? (
                  <span className="block text-muted">
                    {t("referenceLabel")}: <bdi>{payment.reference}</bdi>
                  </span>
                ) : null}
                {payment.proofImageUrl ? (
                  <a
                    href={payment.proofImageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-accent underline underline-offset-4"
                  >
                    {t("screenshotLink")}
                  </a>
                ) : null}
              </span>
              <span className="text-muted">
                {new Date(payment.createdAt).toLocaleDateString(locale, { dateStyle: "medium" })} ·{" "}
                {t(`status.${payment.status}`)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
