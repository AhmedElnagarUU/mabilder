# nextbuilder

A minimal Next.js project with one feature: a generator that renders five
static HTML pages with React server-side rendering and writes them to
`generated-sites/demo-site/`.

The generated site is plain HTML and CSS. It runs without React, Next.js, or
JavaScript at runtime.

## Generate from the page

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), click **Generate website**,
then click **Open generated website**. The app serves the generated files
through `/preview/`.

## Generate from the command line

```bash
npm run generate:site
```

The command compiles the generator with TypeScript and writes:

```text
generated-sites/demo-site/
├── index.html
├── about.html
├── services.html
├── projects.html
├── contact.html
└── styles.css
```

## Preview the generated site without Next.js

Serve the output directory with any static file server. For example, with
Python:

```bash
python -m http.server 8000 --directory generated-sites/demo-site
```

Or with `serve`:

```bash
npx serve generated-sites/demo-site
```

Then open the URL printed by the server (for Python, that is
`http://localhost:8000`).

The pages use relative links, so opening `generated-sites/demo-site/index.html`
directly in a browser also works.

## How it works

- `src/features/static-site-generator/pages.ts` holds the page content.
- `render-page.tsx` builds the shared layout and calls
  `renderToStaticMarkup`.
- `styles.ts` holds the shared responsive stylesheet.
- `generate-site.ts` writes the HTML pages and `styles.css`.
- `scripts/generate-site.ts` is the command-line entry point.
- `src/app/api/generate-site/route.ts` runs the generator for the button.
- `src/app/preview/[...file]/route.ts` serves the generated files.

The generator is compiled before `dev` and `build`, then the button runs that
compiled CLI in a child process. This keeps React DOM's server renderer out of
the Next.js route bundle.

## Checks

```bash
npm run lint
npm run build
```
