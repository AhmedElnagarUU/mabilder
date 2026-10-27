import { Icon } from "@/shared/ui/icon";

const pageNames = ["Home", "Studio", "Services", "Work", "Profile", "Contact"];

export function LandingFeatures() {
  return (
    <section id="capabilities" className="pt-[140px]">
      <div className="mx-auto w-full max-w-[1180px] px-5">
        <div className="mb-[42px] flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between lg:gap-10">
          <div>
            <p className="eyebrow">03 — Capabilities</p>
            <h2 className="mt-5 font-display text-[clamp(38px,4.4vw,60px)] leading-[1.01] font-normal tracking-[-0.055em]">
              Everything it takes.
              <br />
              <span className="text-faint">Nothing it doesn&apos;t.</span>
            </h2>
          </div>
          <p className="max-w-[330px] text-[13px] leading-[1.65] text-muted">
            A complete website studio, reduced to the few things that matter:
            the brief, the draft, and the editor. The rest stays out of your
            way.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          <article className="glass relative flex min-h-[280px] flex-col overflow-hidden rounded-[22px] p-7 lg:col-span-7">
            <div className="mb-9 flex items-center justify-between">
              <span className="mono-label text-[8.5px] tracking-[0.1em] text-faint">
                01 / Write
              </span>
              <Icon name="pen" className="h-4 w-4 text-faint" />
            </div>
            <h3 className="font-display text-[22px] leading-[1.1] font-normal tracking-[-0.04em]">
              It writes like a
              <br />
              careful copywriter.
            </h3>
            <p className="mt-2.5 max-w-[380px] text-xs leading-[1.6] text-muted">
              Brief it once. The draft follows the business, its audience and
              its tone — then needs a light touch, not a rewrite.
            </p>

            <div className="mt-auto pt-7">
              <div className="rounded-xl border border-ink/5 bg-white p-4 shadow-soft">
                <div className="mb-2.5 flex items-center gap-1.5">
                  <i className="h-[5px] w-[5px] rounded-full bg-[#b4ece6]" />
                  <i className="h-[5px] w-[5px] rounded-full bg-[#b4ece6]" />
                  <i className="h-[5px] w-[5px] rounded-full bg-[#b4ece6]" />
                  <span className="ms-auto font-mono text-[6.5px] tracking-[0.08em] text-faint">
                    DRAFT 01 / IN THE BUSINESS&apos;S VOICE
                  </span>
                </div>
                <h4 className="font-display text-base font-medium leading-[1.2] tracking-[-0.035em]">
                  Spaces made for long, quiet afternoons.
                </h4>
                <p className="mt-1.5 max-w-[420px] text-[9px] leading-[1.55] text-muted">
                  Northline Studio designs calm residential architecture for
                  people who would rather live slowly.
                </p>
                <div className="mt-3 flex flex-col gap-[5px]">
                  <i className="h-1 w-[88%] rounded-sm bg-[#eef8f6]" />
                  <i className="h-1 w-[72%] rounded-sm bg-[#eef8f6]" />
                  <i className="h-1 w-[48%] rounded-sm bg-[#eef8f6]" />
                </div>
              </div>
            </div>
          </article>

          <article className="relative flex min-h-[280px] flex-col overflow-hidden rounded-[22px] border border-white/12 bg-[linear-gradient(160deg,#0a5b5c,#032b2e_62%)] p-7 text-white shadow-[0_40px_100px_-40px_rgba(2,38,41,0.5),0_12px_32px_-18px_rgba(2,48,51,0.24)] lg:col-span-5">
            <div className="mb-9 flex items-center justify-between">
              <span className="mono-label text-[8.5px] tracking-[0.1em] text-white/40">
                02 / Ground
              </span>
              <Icon name="shield" className="h-4 w-4 text-white/40" />
            </div>
            <h3 className="font-display text-[22px] leading-[1.1] font-normal tracking-[-0.04em]">
              Only what
              <br />
              you told it.
            </h3>
            <p className="mt-2.5 max-w-[300px] text-xs leading-[1.6] text-white/48">
              Blank fields stay blank. Every award, client and claim on the
              website comes from the brief.
            </p>

            <div className="mt-auto pt-6">
              {[
                { index: "01", label: "The facts you supply", note: "BRIEF" },
                { index: "02", label: "A six-page draft", note: "AI" },
                { index: "03", label: "Your review", note: "EDITOR" },
                { index: "04", label: "A static site", note: "OUTPUT" },
              ].map((step, index) => (
                <div key={step.index}>
                  {index > 0 ? (
                    <div className="ms-[11px] h-2.5 w-px bg-white/15" />
                  ) : null}
                  <div className="flex items-center gap-2.5 py-1.5">
                    <i
                      className={`grid h-[22px] w-[22px] place-items-center rounded-full border font-mono text-[7px] ${
                        index === 0
                          ? "border-white bg-white text-ink"
                          : "border-white/20 text-white/60"
                      }`}
                    >
                      {step.index}
                    </i>
                    <b
                      className={`text-[10px] font-normal tracking-[-0.01em] ${
                        index === 0 ? "text-white" : "text-white/54"
                      }`}
                    >
                      {step.label}
                    </b>
                    <span className="ms-auto font-mono text-[7px] text-white/32">
                      {step.note}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="glass relative flex min-h-[250px] flex-col justify-between overflow-hidden rounded-[22px] p-7 lg:col-span-5">
            <div className="flex items-center justify-between">
              <span className="mono-label text-[8.5px] tracking-[0.1em] text-faint">
                03 / Complete
              </span>
              <Icon name="pages" className="h-4 w-4 text-faint" />
            </div>
            <div>
              <div className="font-display text-[clamp(52px,5vw,72px)] leading-[0.9] font-light tracking-[-0.07em]">
                6<span className="ms-1 align-top text-[0.38em] font-normal tracking-[-0.02em] text-muted">pages</span>
              </div>
              <div className="mono-label mt-2.5 text-[7.5px] tracking-[0.08em] text-faint">
                Home through contact / every site
              </div>
            </div>
            <p className="mt-5 max-w-[280px] text-xs leading-[1.6] text-muted">
              The same business profile feeds every page, so nothing reads like
              an afterthought.
            </p>
          </article>

          <article className="glass relative flex min-h-[250px] flex-col overflow-hidden rounded-[22px] p-7 lg:col-span-7">
            <div className="mb-9 flex items-center justify-between">
              <span className="mono-label text-[8.5px] tracking-[0.1em] text-faint">
                04 / Shape
              </span>
              <Icon name="monitor" className="h-4 w-4 text-faint" />
            </div>
            <h3 className="font-display text-[22px] leading-[1.1] font-normal tracking-[-0.04em]">
              The preview
              <br />
              is the page.
            </h3>
            <p className="mt-2.5 max-w-[360px] text-xs leading-[1.6] text-muted">
              Open any page, switch between edit and preview, and check the
              result exactly as a visitor would see it.
            </p>

            <div className="mt-auto grid grid-cols-2 gap-2 pt-6 sm:grid-cols-3">
              {pageNames.map((name) => (
                <span
                  key={name}
                  className="flex items-center gap-2 rounded-full border border-line bg-white/60 px-3 py-2 text-[10px] text-soft shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]"
                >
                  <i className="h-[3px] w-[3px] rounded-full bg-ink" />
                  {name}
                </span>
              ))}
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
