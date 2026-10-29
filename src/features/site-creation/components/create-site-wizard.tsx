"use client";

import { useState, type FormEvent } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, useRouter } from "@/shared/i18n/navigation";
import { buttonClass } from "@/shared/ui/button";
import { Field, TextAreaField } from "@/shared/ui/field";
import { wizardSteps } from "../wizard-steps";
import { WizardStepper } from "./wizard-stepper";

type FormState = {
  businessName: string;
  industry: string;
  description: string;
  services: string;
  audience: string;
  location: string;
  tone: string;
  email: string;
  phone: string;
  website: string;
  yearsInBusiness: string;
  awards: string;
  notableClients: string;
  projectCount: string;
  extraDetails: string;
};

type WizardError = {
  code: string;
  fields?: string[];
  paths?: string[];
};

type CreateResponse = {
  site?: { id: string };
  error?: string;
  code?: string;
  errors?: { path: string }[];
};

type GenerateResponse = {
  ok?: boolean;
  error?: string;
  code?: string;
};

const emptyForm: FormState = {
  businessName: "",
  industry: "",
  description: "",
  services: "",
  audience: "",
  location: "",
  tone: "",
  email: "",
  phone: "",
  website: "",
  yearsInBusiness: "",
  awards: "",
  notableClients: "",
  projectCount: "",
  extraDetails: "",
};

const requiredFields = [
  "businessName",
  "industry",
  "description",
] as const satisfies readonly (keyof FormState)[];

const errorCodes = new Set([
  "invalid_request",
  "site_not_found",
  "database_unavailable",
  "create_failed",
  "load_failed",
  "delete_failed",
  "save_failed",
  "generation_failed",
  "site_exists",
  "subscription_required",
  "unauthorized",
  "account_inactive",
]);

function errorCodeFrom(code: string | undefined, fallback: string): string {
  return code && errorCodes.has(code) ? code : fallback;
}

function isBlank(value: string): boolean {
  return value.trim() === "";
}

export function CreateSiteWizard() {
  const t = useTranslations("siteCreation");
  const locale = useLocale();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [busy, setBusy] = useState<"idle" | "creating" | "generating">("idle");
  const [statusKey, setStatusKey] = useState<"saving" | "generating" | null>(
    null,
  );
  const [error, setError] = useState<WizardError | null>(null);
  const [failedSiteId, setFailedSiteId] = useState<string | null>(null);

  const isLastStep = step === wizardSteps.length - 1;
  const stepKey = wizardSteps[step].key;

  function update(key: keyof FormState, value: string): void {
    setForm((current) => ({ ...current, [key]: value }));
    setError(null);
  }

  function goNext(): void {
    if (step === 0) {
      const missing = requiredFields.filter((key) => isBlank(form[key]));

      if (missing.length > 0) {
        setError({
          code: "missingFields",
          fields: missing.map((key) => t(`fields.${key}`)),
        });
        return;
      }
    }

    setError(null);
    setStep((current) => Math.min(current + 1, wizardSteps.length - 1));
  }

  function goBack(): void {
    setError(null);
    setStep((current) => Math.max(current - 1, 0));
  }

  function goToStep(index: number): void {
    if (busy !== "idle" || index > step) {
      return;
    }

    setError(null);
    setStep(index);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isLastStep) {
      goNext();
      return;
    }

    if (busy !== "idle") {
      return;
    }

    setBusy("creating");
    setError(null);
    setFailedSiteId(null);
    setStatusKey("saving");

    try {
      const createResponse = await fetch("/api/sites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, locale }),
      });
      const created = (await createResponse.json()) as CreateResponse;

      if (!createResponse.ok || !created.site) {
        setError({
          code: errorCodeFrom(
            created.code,
            createResponse.status === 400 ? "invalid_request" : "create_failed",
          ),
          paths: created.errors?.map((issue) => issue.path),
        });
        setStatusKey(null);
        setBusy("idle");
        return;
      }

      const siteId = created.site.id;
      setBusy("generating");
      setStatusKey("generating");

      const generateResponse = await fetch(`/api/sites/${siteId}/generate`, {
        method: "POST",
      });
      const generated = (await generateResponse.json()) as GenerateResponse;

      if (!generateResponse.ok || !generated.ok) {
        setFailedSiteId(siteId);
        setError({
          code: errorCodeFrom(generated.code, "generation_failed"),
        });
        setStatusKey(null);
        setBusy("idle");
        return;
      }

      router.push(`/edit/${siteId}`);
    } catch {
      setError({ code: "default" });
      setStatusKey(null);
      setBusy("idle");
    }
  }

  const reviewGroups = [
    {
      title: t("review.basics"),
      step: 0,
      rows: [
        ["businessName", form.businessName],
        ["industry", form.industry],
        ["description", form.description],
      ],
    },
    {
      title: t("review.offer"),
      step: 1,
      rows: [
        ["services", form.services],
        ["audience", form.audience],
        ["tone", form.tone],
      ],
    },
    {
      title: t("review.details"),
      step: 2,
      rows: [
        ["location", form.location],
        ["email", form.email],
        ["phone", form.phone],
        ["website", form.website],
        ["yearsInBusiness", form.yearsInBusiness],
        ["projectCount", form.projectCount],
        ["awards", form.awards],
        ["notableClients", form.notableClients],
        ["extraDetails", form.extraDetails],
      ],
    },
  ] as const;

  return (
    <div className="flex-1">
      <main className="mx-auto w-full max-w-6xl px-1 py-8 sm:px-2 lg:py-12">
        <div className="max-w-2xl">
          <p className="eyebrow text-soft">{t("eyebrow")}</p>
          <h1 className="mt-5 font-display text-[clamp(38px,4.6vw,58px)] leading-[0.99] font-normal tracking-[-0.055em]">
            {t("title")}
          </h1>
          <p className="mt-3 max-w-lg text-[15px] leading-[1.65] text-muted">
            {t("intro")}
          </p>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[16rem_1fr] lg:gap-12">
          <aside className="hidden lg:block">
            <WizardStepper current={step} onSelect={goToStep} />
          </aside>

          <form onSubmit={handleSubmit} className="min-w-0">
            <div className="mb-5 lg:hidden">
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="font-medium text-ink">
                  {t("stepper.stepOf", {
                    current: step + 1,
                    total: wizardSteps.length,
                  })}{" "}
                  · {t(`steps.${stepKey}.title`)}
                </span>
                <span className="max-w-[50%] text-end text-[13px] leading-4 text-muted">
                  {t(`steps.${stepKey}.description`)}
                </span>
              </div>
              <div className="mt-2 h-1 overflow-hidden rounded-full bg-line">
                <div
                  className="h-full rounded-full bg-accent transition-all duration-300"
                  style={{
                    width: `${((step + 1) / wizardSteps.length) * 100}%`,
                  }}
                />
              </div>
            </div>

            <fieldset
              disabled={busy !== "idle"}
              className="glass min-w-0 rounded-[30px] p-5 sm:p-8"
            >
              <p className="mono-label text-[11px] tracking-[0.14em] text-faint">
                {t("stepper.stepOf", {
                  current: step + 1,
                  total: wizardSteps.length,
                })}
              </p>
              <h2 className="mt-3 font-display text-[clamp(26px,3vw,34px)] leading-[1.05] font-normal tracking-[-0.05em]">
                {t(`stepIntro.${stepKey}.title`)}
              </h2>
              <p className="mt-2 max-w-xl text-[15px] leading-[1.65] text-muted">
                {t(`stepIntro.${stepKey}.description`)}
              </p>

              <div className="mt-8 space-y-6">
                {step === 0 ? (
                  <>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field
                        label={t("fields.businessName")}
                        value={form.businessName}
                        onChange={(value) => update("businessName", value)}
                        placeholder={t("placeholders.businessName")}
                        required
                      />
                      <Field
                        label={t("fields.industry")}
                        value={form.industry}
                        onChange={(value) => update("industry", value)}
                        placeholder={t("placeholders.industry")}
                        required
                      />
                    </div>

                    <TextAreaField
                      label={t("fields.description")}
                      value={form.description}
                      onChange={(value) => update("description", value)}
                      placeholder={t("placeholders.description")}
                      required
                      rows={5}
                    />
                  </>
                ) : null}

                {step === 1 ? (
                  <>
                    <TextAreaField
                      label={t("fields.services")}
                      value={form.services}
                      onChange={(value) => update("services", value)}
                      placeholder={t("placeholders.services")}
                      rows={5}
                    />
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field
                        label={t("fields.audience")}
                        value={form.audience}
                        onChange={(value) => update("audience", value)}
                        placeholder={t("placeholders.audience")}
                      />
                      <Field
                        label={t("fields.tone")}
                        value={form.tone}
                        onChange={(value) => update("tone", value)}
                        placeholder={t("placeholders.tone")}
                      />
                    </div>
                  </>
                ) : null}

                {step === 2 ? (
                  <>
                    <div>
                      <h3 className="text-[13px] font-semibold tracking-[0.14em] text-muted uppercase">
                        {t("sections.contactLocation")}
                      </h3>
                      <div className="mt-4 grid gap-4 sm:grid-cols-2">
                        <Field
                          label={t("fields.location")}
                          value={form.location}
                          onChange={(value) => update("location", value)}
                          placeholder={t("placeholders.location")}
                        />
                        <Field
                          label={t("fields.email")}
                          type="email"
                          value={form.email}
                          onChange={(value) => update("email", value)}
                          placeholder={t("placeholders.email")}
                        />
                        <Field
                          label={t("fields.phone")}
                          value={form.phone}
                          onChange={(value) => update("phone", value)}
                          placeholder={t("placeholders.phone")}
                        />
                        <Field
                          label={t("fields.website")}
                          value={form.website}
                          onChange={(value) => update("website", value)}
                          placeholder={t("placeholders.website")}
                        />
                      </div>
                    </div>

                    <div>
                      <h3 className="text-[13px] font-semibold tracking-[0.14em] text-muted uppercase">
                        {t("sections.trackRecord")}
                      </h3>
                      <div className="mt-4 grid gap-4 sm:grid-cols-2">
                        <Field
                          label={t("fields.yearsInBusiness")}
                          value={form.yearsInBusiness}
                          onChange={(value) =>
                            update("yearsInBusiness", value)
                          }
                          placeholder={t("placeholders.yearsInBusiness")}
                        />
                        <Field
                          label={t("fields.projectCount")}
                          value={form.projectCount}
                          onChange={(value) => update("projectCount", value)}
                          placeholder={t("placeholders.projectCount")}
                        />
                      </div>
                      <div className="mt-4 space-y-4">
                        <TextAreaField
                          label={t("fields.awards")}
                          value={form.awards}
                          onChange={(value) => update("awards", value)}
                          placeholder={t("placeholders.awards")}
                          rows={2}
                        />
                        <TextAreaField
                          label={t("fields.notableClients")}
                          value={form.notableClients}
                          onChange={(value) =>
                            update("notableClients", value)
                          }
                          placeholder={t("placeholders.notableClients")}
                          rows={2}
                        />
                      </div>
                    </div>

                    <TextAreaField
                      label={t("fields.extraDetails")}
                      value={form.extraDetails}
                      onChange={(value) => update("extraDetails", value)}
                      placeholder={t("placeholders.extraDetails")}
                    />
                  </>
                ) : null}

                {step === 3 ? (
                  <div className="space-y-4">
                    {reviewGroups.map((group) => (
                      <section
                        key={group.title}
                        className="rounded-2xl border border-line bg-white/[0.03] p-4 sm:p-5"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <h3 className="text-base font-medium text-ink">
                            {group.title}
                          </h3>
                          <button
                            type="button"
                            onClick={() => goToStep(group.step)}
                            className="font-mono text-[11px] tracking-[0.08em] text-muted uppercase underline decoration-line underline-offset-4 transition-colors hover:text-ink"
                          >
                            {t("review.edit")}
                          </button>
                        </div>

                    <dl className="mt-2 divide-y divide-line">
                      {group.rows.map(([key, value]) => (
                            <div
                              key={key}
                              className="grid gap-1 py-3 sm:grid-cols-[10rem_1fr] sm:gap-4"
                            >
                              <dt className="font-mono text-[11px] font-medium tracking-[0.08em] text-muted uppercase">
                                {t(`fields.${key}`)}
                              </dt>
                              <dd
                                className={`text-[15px] leading-6 ${
                                  value.trim()
                                    ? "whitespace-pre-line text-ink"
                                    : "text-muted/70"
                                }`}
                              >
                                {value.trim() ? value : t("review.notProvided")}
                              </dd>
                            </div>
                          ))}
                        </dl>
                      </section>
                    ))}

                    <p className="rounded-2xl border border-line bg-white/[0.03] px-4 py-3 text-sm leading-5 text-muted">
                      {t("review.note")}
                    </p>
                  </div>
                ) : null}
              </div>
            </fieldset>

            {error ? (
              <div
                role="alert"
                className="mt-4 rounded-2xl border border-danger/20 bg-danger-soft px-4 py-3 text-sm leading-5 text-danger"
              >
                <p>
                  {error.code === "missingFields"
                    ? t("errors.missingFields", {
                        fields: (error.fields ?? []).join(", "),
                      })
                    : t(`errors.${error.code}`)}
                </p>
                {error.paths && error.paths.length > 0 ? (
                  <ul className="mt-2 list-disc space-y-1 ps-4 font-mono text-[13px]">
                    {error.paths.map((path) => (
                      <li key={path}>{path}</li>
                    ))}
                  </ul>
                ) : null}
                {error.code === "subscription_required" ? (
                  <Link href="/billing" className="mt-1 inline-block font-semibold underline">
                    {t("buttons.subscribe")}
                  </Link>
                ) : null}
                {failedSiteId ? (
                  <Link
                    href={`/edit/${failedSiteId}`}
                    className="mt-1 inline-block font-semibold underline"
                  >
                    {t("buttons.openEditor")}
                  </Link>
                ) : null}
              </div>
            ) : null}

            {statusKey ? (
              <p
                role="status"
                aria-live="polite"
                className="mt-4 rounded-2xl border border-line bg-white/[0.03] px-4 py-3 text-sm leading-5 text-muted"
              >
                {t(`status.${statusKey}`)}
              </p>
            ) : null}

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={goBack}
                disabled={step === 0 || busy !== "idle"}
                className={buttonClass("ghost", "md")}
              >
                {t("buttons.back")}
              </button>

              <div className="flex items-center gap-4">
                <span className="hidden text-sm text-muted sm:inline">
                  {t("stepper.stepOf", {
                    current: step + 1,
                    total: wizardSteps.length,
                  })}
                </span>

                {isLastStep ? (
                  <button
                    type="submit"
                    disabled={busy !== "idle"}
                    className={buttonClass("primary", "md", "min-w-40")}
                  >
                    {busy === "creating"
                      ? t("buttons.creating")
                      : busy === "generating"
                        ? t("buttons.writingPages")
                        : t("buttons.createWebsite")}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={goNext}
                    disabled={busy !== "idle"}
                    className={buttonClass("primary", "md")}
                  >
                    {t("buttons.continue")}
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
