import type { Metadata } from "next";
import { GenerateSiteButton } from "@/features/static-site-generator/components/generate-site-button";

export const metadata: Metadata = {
  title: "Static Site Generator",
  description: "Generate a five-page static website with React.",
};

export default function Home() {
  return (
    <main className="flex flex-1 items-center justify-center bg-zinc-50 px-6 py-16 dark:bg-black">
      <section className="w-full max-w-xl rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 sm:p-10">
        <p className="text-xs font-semibold tracking-[0.2em] text-emerald-700 uppercase dark:text-emerald-400">
          Static site generator
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50 sm:text-4xl">
          Generate a five-page website
        </h1>
        <p className="mt-4 text-base leading-7 text-zinc-600 dark:text-zinc-400">
          Click the button to render Home, About, Services, Projects, and
          Contact with React, then open the result in a new tab.
        </p>
        <div className="mt-8">
          <GenerateSiteButton />
        </div>
        <p className="mt-6 text-sm leading-6 text-zinc-500 dark:text-zinc-500">
          The output is plain HTML and CSS in{" "}
          <code className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-xs text-zinc-800 dark:bg-zinc-900 dark:text-zinc-200">
            generated-sites/demo-site
          </code>
          .
        </p>
      </section>
    </main>
  );
}
