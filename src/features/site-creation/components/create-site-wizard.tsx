"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { buttonClass } from "@/shared/ui/button";
import { Field, TextAreaField } from "@/shared/ui/field";
import { Logo } from "@/shared/ui/logo";
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

const stepHeadings = [
  {
    title: "Tell us about the business",
    description: "These three answers are all the AI needs to start.",
  },
  {
    title: "What should the site sell?",
    description:
      "Optional, but specific services and a clear audience make stronger copy.",
  },
  {
    title: "Add the details that matter",
    description:
      "Only include facts you can stand behind. Blank fields are never invented.",
  },
  {
    title: "Review the brief",
    description: "One last look before AI writes all six pages.",
  },
];

type CreateResponse = {
  site?: { id: string };
  error?: string;
};

type GenerateResponse = {
  ok?: boolean;
  error?: string;
};

function isBlank(value: string): boolean {
  return value.trim() === "";
}

export function CreateSiteWizard() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [busy, setBusy] = useState<"idle" | "creating" | "generating">("idle");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [failedSiteId, setFailedSiteId] = useState<string | null>(null);

  const isLastStep = step === wizardSteps.length - 1;

  function update(key: keyof FormState, value: string): void {
    setForm((current) => ({ ...current, [key]: value }));
    setError("");
  }

  function goNext(): void {
    if (step === 0) {
      const missing: string[] = [];

      if (isBlank(form.businessName)) missing.push("business name");
      if (isBlank(form.industry)) missing.push("industry");
      if (isBlank(form.description)) missing.push("description");

      if (missing.length > 0) {
        setError(`Add the ${missing.join(", ")} to continue.`);
        return;
      }
    }

    setError("");
    setStep((current) => Math.min(current + 1, wizardSteps.length - 1));
  }

  function goBack(): void {
    setError("");
    setStep((current) => Math.max(current - 1, 0));
  }

  function goToStep(index: number): void {
    if (busy !== "idle" || index > step) {
      return;
    }

    setError("");
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
    setError("");
    setFailedSiteId(null);
    setMessage("Saving your business details...");

    try {
      const createResponse = await fetch("/api/sites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const created = (await createResponse.json()) as CreateResponse;

      if (!createResponse.ok || !created.site) {
        throw new Error(
          created.error ?? "Please fill in the required fields.",
        );
      }

      const siteId = created.site.id;
      setBusy("generating");
      setMessage(
        "Writing your six pages with AI. This can take a few minutes; keep this tab open.",
      );

      const generateResponse = await fetch(`/api/sites/${siteId}/generate`, {
        method: "POST",
      });
      const generated = (await generateResponse.json()) as GenerateResponse;

      if (!generateResponse.ok || !generated.ok) {
        setFailedSiteId(siteId);
        setError(
          generated.error ??
            "AI generation failed. Your draft is saved and you can retry.",
        );
        setBusy("idle");
        return;
      }

      router.push(`/edit/${siteId}`);
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Something went wrong.",
      );
      setBusy("idle");
    }
  }

  const reviewGroups = [
    {
      title: "Basics",
      step: 0,
      rows: [
        ["Business name", form.businessName],
        ["Industry", form.industry],
        ["What it does", form.description],
      ],
    },
    {
      title: "Offer",
      step: 1,
      rows: [
        ["Services", form.services],
        ["Audience", form.audience],
        ["Tone", form.tone],
      ],
    },
    {
      title: "Details",
      step: 2,
      rows: [
        ["Location", form.location],
        ["Email", form.email],
        ["Phone", form.phone],
        ["Website", form.website],
        ["Years in business", form.yearsInBusiness],
        ["Projects completed", form.projectCount],
        ["Awards", form.awards],
        ["Notable clients", form.notableClients],
        ["Anything else", form.extraDetails],
      ],
    },
  ];

  return (
    <div className="flex-1">
      <header className="px-5 pt-[18px] sm:px-8">
        <div className="glass mx-auto flex h-[62px] w-full max-w-6xl items-center justify-between gap-4 rounded-full pr-2.5 pl-4 sm:pl-5">
          <Logo href="/dashboard" />
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 rounded-full px-3 py-2 font-mono text-[8px] tracking-[0.08em] text-muted uppercase transition-colors hover:bg-ink/5 hover:text-ink"
          >
            Back to dashboard
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8 lg:py-14">
        <div className="max-w-2xl">
          <p className="eyebrow text-soft">New website / 01—04</p>
          <h1 className="mt-5 font-display text-[clamp(38px,4.6vw,58px)] leading-[0.99] font-normal tracking-[-0.055em]">
            Start with the brief.
          </h1>
          <p className="mt-3 max-w-lg text-[13px] leading-[1.65] text-muted">
            Four steps. Only the first three fields are required; everything
            else sharpens the copy.
          </p>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[16rem_1fr] lg:gap-12">
          <aside className="hidden lg:block">
            <WizardStepper current={step} onSelect={goToStep} />
          </aside>

          <form onSubmit={handleSubmit} className="min-w-0">
            <div className="mb-5 lg:hidden">
              <div className="flex items-center justify-between gap-3 text-xs">
                <span className="font-medium text-ink">
                  Step {step + 1} of {wizardSteps.length} ·{" "}
                  {wizardSteps[step].title}
                </span>
                <span className="max-w-[50%] text-end text-[10px] leading-4 text-muted">
                  {wizardSteps[step].description}
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
              <p className="mono-label text-[8px] tracking-[0.14em] text-faint">
                Step {step + 1} of {wizardSteps.length}
              </p>
              <h2 className="mt-3 font-display text-[clamp(26px,3vw,34px)] leading-[1.05] font-normal tracking-[-0.05em]">
                {stepHeadings[step].title}
              </h2>
              <p className="mt-2 max-w-xl text-[13px] leading-[1.65] text-muted">
                {stepHeadings[step].description}
              </p>

              <div className="mt-8 space-y-6">
                {step === 0 ? (
                  <>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field
                        label="Business name"
                        value={form.businessName}
                        onChange={(value) => update("businessName", value)}
                        placeholder="Northline Studio"
                        required
                      />
                      <Field
                        label="Industry"
                        value={form.industry}
                        onChange={(value) => update("industry", value)}
                        placeholder="Architecture"
                        required
                      />
                    </div>

                    <TextAreaField
                      label="What does the business do?"
                      value={form.description}
                      onChange={(value) => update("description", value)}
                      placeholder="Describe the business, what it offers, and what makes it different."
                      required
                      rows={5}
                    />
                  </>
                ) : null}

                {step === 1 ? (
                  <>
                    <TextAreaField
                      label="Services"
                      value={form.services}
                      onChange={(value) => update("services", value)}
                      placeholder="One service per line. Leave blank to let the AI infer from the description."
                      rows={5}
                    />
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field
                        label="Audience"
                        value={form.audience}
                        onChange={(value) => update("audience", value)}
                        placeholder="Homeowners and developers"
                      />
                      <Field
                        label="Tone"
                        value={form.tone}
                        onChange={(value) => update("tone", value)}
                        placeholder="Warm, confident, minimal"
                      />
                    </div>
                  </>
                ) : null}

                {step === 2 ? (
                  <>
                    <div>
                      <h3 className="text-[10px] font-semibold tracking-[0.14em] text-muted uppercase">
                        Contact and location
                      </h3>
                      <div className="mt-4 grid gap-4 sm:grid-cols-2">
                        <Field
                          label="Location"
                          value={form.location}
                          onChange={(value) => update("location", value)}
                          placeholder="Zurich, Switzerland"
                        />
                        <Field
                          label="Email"
                          type="email"
                          value={form.email}
                          onChange={(value) => update("email", value)}
                          placeholder="hello@example.com"
                        />
                        <Field
                          label="Phone"
                          value={form.phone}
                          onChange={(value) => update("phone", value)}
                          placeholder="+41 44 123 4567"
                        />
                        <Field
                          label="Website"
                          value={form.website}
                          onChange={(value) => update("website", value)}
                          placeholder="example.com"
                        />
                      </div>
                    </div>

                    <div>
                      <h3 className="text-[10px] font-semibold tracking-[0.14em] text-muted uppercase">
                        Track record
                      </h3>
                      <div className="mt-4 grid gap-4 sm:grid-cols-2">
                        <Field
                          label="Years in business"
                          value={form.yearsInBusiness}
                          onChange={(value) =>
                            update("yearsInBusiness", value)
                          }
                          placeholder="12"
                        />
                        <Field
                          label="Projects completed"
                          value={form.projectCount}
                          onChange={(value) => update("projectCount", value)}
                          placeholder="140"
                        />
                      </div>
                      <div className="mt-4 space-y-4">
                        <TextAreaField
                          label="Awards and recognition"
                          value={form.awards}
                          onChange={(value) => update("awards", value)}
                          placeholder="One per line, for example: 2023 - Swiss Architecture Prize"
                          rows={2}
                        />
                        <TextAreaField
                          label="Notable clients"
                          value={form.notableClients}
                          onChange={(value) =>
                            update("notableClients", value)
                          }
                          placeholder="One per line. Only add names you have permission to publish."
                          rows={2}
                        />
                      </div>
                    </div>

                    <TextAreaField
                      label="Anything else"
                      value={form.extraDetails}
                      onChange={(value) => update("extraDetails", value)}
                      placeholder="Founding story, philosophy, notable projects, or other facts to use."
                    />
                  </>
                ) : null}

                {step === 3 ? (
                  <div className="space-y-4">
                    {reviewGroups.map((group) => (
                      <section
                        key={group.title}
                        className="rounded-2xl border border-ink/8 bg-white/50 p-4 sm:p-5"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <h3 className="text-sm font-medium text-ink">
                            {group.title}
                          </h3>
                          <button
                            type="button"
                            onClick={() => goToStep(group.step)}
                            className="font-mono text-[8px] tracking-[0.08em] text-muted uppercase underline decoration-line underline-offset-4 transition-colors hover:text-ink"
                          >
                            Edit
                          </button>
                        </div>

                        <dl className="mt-2 divide-y divide-line">
                          {group.rows.map(([label, value]) => (
                            <div
                              key={label}
                              className="grid gap-1 py-3 sm:grid-cols-[10rem_1fr] sm:gap-4"
                            >
                              <dt className="font-mono text-[8px] font-medium tracking-[0.08em] text-muted uppercase">
                                {label}
                              </dt>
                              <dd
                                className={`text-[13px] leading-6 ${
                                  value.trim()
                                    ? "whitespace-pre-line text-ink"
                                    : "text-muted/70"
                                }`}
                              >
                                {value.trim() ? value : "Not provided"}
                              </dd>
                            </div>
                          ))}
                        </dl>
                      </section>
                    ))}

                    <p className="rounded-2xl border border-ink/10 bg-white/45 px-4 py-3 text-xs leading-5 text-soft">
                      AI writes six pages from this brief: home, studio,
                      services, work, profile, and contact. You can edit
                      everything afterwards.
                    </p>
                  </div>
                ) : null}
              </div>
            </fieldset>

            {error ? (
              <div
                role="alert"
                className="mt-4 rounded-2xl border border-danger/20 bg-danger-soft px-4 py-3 text-xs leading-5 text-danger"
              >
                {error}
                {failedSiteId ? (
                  <>
                    {" "}
                    <Link
                      href={`/edit/${failedSiteId}`}
                      className="font-semibold underline"
                    >
                      Open the editor
                    </Link>
                  </>
                ) : null}
              </div>
            ) : null}

            {busy !== "idle" ? (
              <p
                role="status"
                aria-live="polite"
                className="mt-4 rounded-2xl border border-ink/10 bg-white/55 px-4 py-3 text-xs leading-5 text-soft"
              >
                {message}
              </p>
            ) : null}

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={goBack}
                disabled={step === 0 || busy !== "idle"}
                className={buttonClass("ghost", "md")}
              >
                Back
              </button>

              <div className="flex items-center gap-4">
                <span className="hidden text-xs text-muted sm:inline">
                  Step {step + 1} of {wizardSteps.length}
                </span>

                {isLastStep ? (
                  <button
                    type="submit"
                    disabled={busy !== "idle"}
                    className={buttonClass("primary", "md", "min-w-40")}
                  >
                    {busy === "creating"
                      ? "Creating..."
                      : busy === "generating"
                        ? "Writing pages..."
                        : "Create website"}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={goNext}
                    disabled={busy !== "idle"}
                    className={buttonClass("primary", "md")}
                  >
                    Continue
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
