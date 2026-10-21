/* eslint-disable @next/next/no-head-element, @next/next/no-css-tags -- this renders a standalone document, not a Next.js page */
import { siteName } from "./pages";
import type { StaticPage } from "./types";

type PageProps = {
  page: StaticPage;
  pages: StaticPage[];
};

function SiteHeader({ page, pages }: PageProps) {
  return (
    <header className="site-header">
      <div className="header-inner">
        <a className="brand" href="index.html">
          {siteName}
        </a>
        <nav aria-label="Main navigation">
          <ul className="nav-list">
            {pages.map((item) => (
              <li key={item.slug}>
                <a
                  className="nav-link"
                  href={`${item.slug}.html`}
                  aria-current={item.slug === page.slug ? "page" : undefined}
                >
                  {item.navLabel}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}

export function Page({ page, pages }: PageProps) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{`${page.title} | ${siteName}`}</title>
        <meta name="description" content={page.description} />
        <link rel="stylesheet" href="styles.css" />
      </head>
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <SiteHeader page={page} pages={pages} />
        <main id="main" className="container">
          <h1>{page.title}</h1>
          <p className="lead">{page.intro}</p>
          {page.sections.map((section) => (
            <section className="section" key={section.heading}>
              <h2>{section.heading}</h2>
              <p>{section.body}</p>
              {section.items ? (
                <ul>
                  {section.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : null}
            </section>
          ))}
        </main>
        <footer className="site-footer">
          <p>
            © {new Date().getFullYear()} {siteName}. Built as a static site
            example.
          </p>
        </footer>
      </body>
    </html>
  );
}
