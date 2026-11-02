"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "../../../shared/i18n/navigation";
import { requestTemplate, type ApplyTemplateOutcome, type TemplateChoice } from "../template-choice";
import { TemplateChoiceList } from "./template-choice-list";

type ChooseTemplateProps = {
  siteId: string;
  choices: TemplateChoice[];
  currentId: string;
};

type FailureCode = Extract<ApplyTemplateOutcome, { ok: false }>["code"];

const errorKeys: Record<FailureCode, string> = {
  invalid: "invalid",
  subscription_required: "subscriptionRequired",
  failed: "failed",
};

// The "Choose your template" step: pick one (saved at once) or skip and keep the current look.
export function ChooseTemplate({ siteId, choices, currentId }: ChooseTemplateProps) {
  const t = useTranslations("templatePicker");
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<FailureCode | null>(null);

  async function handleUse(templateId: string): Promise<void> {
    setBusyId(templateId);
    setError(null);

    const outcome = await requestTemplate(siteId, templateId);

    if (!outcome.ok) {
      setError(outcome.code);
      setBusyId(null);
      return;
    }

    router.push(`/edit/${siteId}`);
  }

  return (
    <div>
      <TemplateChoiceList
        siteId={siteId}
        choices={choices}
        currentId={currentId}
        busyId={busyId}
        onUse={(templateId) => void handleUse(templateId)}
      />

      {error ? (
        <p role="alert" className="mt-5 text-sm text-danger">
          {t(`errors.${errorKeys[error]}`)}
        </p>
      ) : null}

      <div className="mt-8">
        <Link
          href={`/edit/${siteId}`}
          className="text-sm text-muted underline underline-offset-4 transition-colors hover:text-ink"
        >
          {t("page.skip")}
        </Link>
      </div>
    </div>
  );
}
