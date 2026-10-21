export const styles = `:root {
  --background: #f6f6f2;
  --surface: #ffffff;
  --text: #1d1d1b;
  --muted: #5d5d57;
  --accent: #1f6f5f;
  --border: #deded7;
}

*,
*::before,
*::after {
  box-sizing: border-box;
}

html {
  font-family: system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif;
  line-height: 1.6;
}

body {
  margin: 0;
  background: var(--background);
  color: var(--text);
}

.skip-link {
  position: absolute;
  inset-block-start: -100px;
  inset-inline-start: 16px;
  padding: 8px 12px;
  background: var(--text);
  color: var(--surface);
  z-index: 10;
}

.skip-link:focus {
  inset-block-start: 16px;
}

.site-header {
  background: var(--surface);
  border-block-end: 1px solid var(--border);
}

.header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
  max-width: 960px;
  margin-inline: auto;
  padding: 20px 24px;
}

.brand {
  color: var(--text);
  font-size: 1.1rem;
  font-weight: 700;
  letter-spacing: -0.01em;
  text-decoration: none;
}

.nav-list {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 20px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.nav-link {
  display: inline-block;
  padding-block: 4px;
  border-block-end: 2px solid transparent;
  color: var(--muted);
  font-size: 0.95rem;
  text-decoration: none;
}

.nav-link:hover {
  color: var(--accent);
}

.nav-link[aria-current="page"] {
  border-block-end-color: var(--accent);
  color: var(--accent);
}

.container {
  max-width: 960px;
  margin-inline: auto;
  padding: 56px 24px;
}

h1 {
  margin: 0 0 16px;
  font-size: clamp(2rem, 5vw, 3rem);
  line-height: 1.1;
  letter-spacing: -0.03em;
}

.lead {
  max-width: 65ch;
  margin: 0 0 40px;
  color: var(--muted);
  font-size: 1.15rem;
}

.section {
  margin-block-end: 16px;
  padding: 24px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--surface);
}

.section h2 {
  margin: 0 0 8px;
  font-size: 1.25rem;
}

.section p {
  margin: 0;
  color: var(--muted);
}

.section ul {
  margin: 12px 0 0;
  padding-inline-start: 20px;
  color: var(--muted);
}

.section li + li {
  margin-block-start: 4px;
}

.site-footer {
  padding: 24px;
  border-block-start: 1px solid var(--border);
  color: var(--muted);
  font-size: 0.9rem;
  text-align: center;
}

.site-footer p {
  margin: 0;
}

@media (max-width: 600px) {
  .header-inner {
    align-items: flex-start;
    flex-direction: column;
  }

  .container {
    padding-block: 36px;
  }

  .section {
    padding: 20px;
  }
}
`;
