import Link from "next/link";
import { Icon } from "@/shared/ui/icon";

const steps = [
  {
    number: "01",
    title: "Write the brief",
    body: "Name the business, describe what it does, and add the services worth showing. Only the first three answers are required.",
    note: "About two minutes",
  },
  {
    number: "02",
    title: "AI drafts six pages",
    body: "Home, studio, services, work, profile and contact — written from the facts you supplied. No invented awards, clients or history.",
    note: "One pass",
  },
  {
    number: "03",
    title: "Shape it visually",
    body: "Click any headline, paragraph, image or link in the live preview. The page you edit is the page the website serves.",
    note: "Live editor",
  },
  {
    number: "04",
    title: "Share the result",
    body: "Save once and the static site is rebuilt. Every site gets its own preview link, ready to send to the business.",
    note: "Ready to share",
  },
];

const meta = [
  { label: "The brief", value: "Four short steps" },
  { label: "The draft", value: "Six pages, one voice" },
  { label: "The editor", value: "Click, type, save" },
  { label: "The output", value: "Static, fast HTML" },
];

export function LandingSteps() {
  return (
    <section id="how-it-works" className="pt-32">
      <div className="mx-auto w-full max-w-[1180px] px-5">
        <div className="grid gap-14 lg:grid-cols-[1fr_1fr] lg:gap-20">
          <div>
            <p className="eyebrow text-soft">02 — How it works</p>
            <h2 className="mt-6 font-display text-[clamp(46px,5.4vw,76px)] leading-[0.99] font-normal tracking-[-0.058em]">
              Four steps.
              <br />
              <span className="text-faint">One finished site.</span>
            </h2>
            <p className="mt-7 max-w-[430px] text-[16px] leading-[1.7] tracking-[-0.01em] text-soft">
              There is no page builder to learn. The brief is the starting
              point, the AI draft is the first version, and the editor is where
              it becomes the business&apos;s own.
            </p>

            <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-4 border-t border-line pt-5">
              {meta.map((item) => (
                <div key={item.label}>
                  <span className="mono-label block text-[9.5px] tracking-[0.12em] text-faint">
                    {item.label}
                  </span>
                  <b className="mt-1.5 block text-[13.5px] font-medium tracking-[-0.01em] text-soft">
                    {item.value}
                  </b>
                </div>
              ))}
            </div>
          </div>

          <ol className="border-t border-line">
            {steps.map((step) => (
              <li
                key={step.number}
                className="group flex gap-5 border-b border-line py-6 sm:gap-8"
              >
                <span className="font-mono text-[10px] font-medium tracking-[0.14em] text-faint">
                  {step.number}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                    <h3 className="font-display text-[24px] font-normal tracking-[-0.04em]">
                      {step.title}
                    </h3>
                    <span className="mono-label text-[9px] tracking-[0.1em] text-faint">
                      {step.note}
                    </span>
                  </div>
                  <p className="mt-2 max-w-[380px] text-[13.5px] leading-[1.65] text-muted">
                    {step.body}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="glass relative mt-[72px] grid overflow-hidden rounded-[30px] px-7 py-12 sm:px-14 lg:grid-cols-[1fr_auto] lg:items-center lg:gap-10">
          <div aria-hidden className="pointer-events-none absolute inset-0">
            <div className="absolute inset-0 bg-[radial-gradient(600px_260px_at_80%_10%,rgba(255,255,255,0.9),transparent_70%),linear-gradient(120deg,rgba(255,255,255,0.34),rgba(255,255,255,0.04))]" />
          </div>

          <div className="relative">
            <div className="font-display text-[20px] text-faint">“</div>
            <h3 className="mt-2 max-w-[760px] font-display text-[clamp(28px,3.4vw,44px)] leading-[1.12] font-normal tracking-[-0.048em]">
              A website shouldn&apos;t feel like a form you filled in.{" "}
              <span className="text-faint">
                It should feel like the business itself.
              </span>
            </h3>
            <p className="mt-4 max-w-[460px] text-[14px] leading-[1.65] text-muted">
              One profile feeds every page, so the site reads like one brand
              from home to contact.
            </p>
          </div>

          <div className="relative mt-8 flex flex-col items-center gap-3 lg:mt-0">
            <Link
              href="/dashboard/new"
              aria-label="Start a website brief"
              className="grid h-[86px] w-[86px] place-items-center rounded-full bg-accent text-white shadow-[0_24px_40px_-20px_rgba(6,91,92,0.6),inset_0_1px_0_rgba(255,255,255,0.2)] transition-transform duration-300 hover:scale-105"
            >
              <Icon name="arrow-up" className="h-6 w-6" />
            </Link>
            <small className="mono-label text-[9.5px] tracking-[0.12em] text-muted">
              Start a brief
            </small>
          </div>
        </div>
      </div>
    </section>
  );
}
