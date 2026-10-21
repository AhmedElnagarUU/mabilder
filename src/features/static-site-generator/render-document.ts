import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server.browser";
import { Page } from "./render-page";
import type { StaticPage } from "./types";

export function renderPage(page: StaticPage, pages: StaticPage[]): string {
  const markup = renderToStaticMarkup(createElement(Page, { page, pages }));
  return `<!DOCTYPE html>\n${markup}\n`;
}
