import { renderText } from "../../../content/html";
import type { BlockContext, ThemeBlock } from "../../types";
import { getToneStyle, renderSection } from "../parts";

export function renderMarquee(block: ThemeBlock<"marquee">, context: BlockContext): string {
  const style = getToneStyle(context.tone);
  const items = [...block.props.items, ...block.props.items];

  const inner = `
    <div class="flex marquee whitespace-nowrap">
      ${items
        .map(
          (item) =>
            `<span class="text-[11px] uppercase tracking-[0.4em] mx-10 opacity-60">${renderText(item)}</span>`,
        )
        .join("\n      ")}
    </div>`;

  return renderSection(
    block,
    `${style.section} py-5 overflow-hidden border-t ${style.border}`,
    inner,
  );
}
