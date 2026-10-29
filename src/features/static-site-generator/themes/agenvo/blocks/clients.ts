import { renderText } from "../../../content/html";
import type { BlockContext, ThemeBlock } from "../../types";
import { getToneStyle, renderHeader, renderSection, sectionPadding } from "../parts";

export function renderClients(block: ThemeBlock<"clients">, context: BlockContext): string {
  const { props } = block;
  const style = getToneStyle(context.tone);

  const inner = `
    <div class="max-w-7xl mx-auto">${renderHeader(props.eyebrow, props.title, props.body, style)}
      <div class="grid grid-cols-2 md:grid-cols-4 border-t border-s ${style.border}">
        ${props.names
          .map(
            (name) =>
              `<div class="border-e border-b ${style.border} p-8 flex items-center justify-center text-center reveal"><span class="font-display text-xl opacity-60">${renderText(name)}</span></div>`,
          )
          .join("\n        ")}
      </div>
    </div>`;

  return renderSection(block, `${style.section} ${sectionPadding}`, inner);
}
