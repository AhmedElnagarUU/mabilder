"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import type { Locale } from "../../static-site-generator/locale";
import type { SiteContent } from "../../static-site-generator/site-content";
import {
  buildDesignPreviewDocument,
  DESIGN_PREVIEW_HEIGHT,
  DESIGN_PREVIEW_WIDTH,
} from "../design-preview";

type DesignPreviewFrameProps = {
  content: SiteContent;
  siteId: string;
  pageId: string;
  blockId: string;
  designId: string;
  locale: Locale;
  title: string;
};

export function DesignPreviewFrame({
  content,
  siteId,
  pageId,
  blockId,
  designId,
  locale,
  title,
}: DesignPreviewFrameProps) {
  const t = useTranslations("editor.designs");
  const boxRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const box = boxRef.current;

    if (!box) {
      return;
    }

    const resize = new ResizeObserver(() => setWidth(box.clientWidth));
    const intersect = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        setVisible(true);
        intersect.disconnect();
      }
    });

    resize.observe(box);
    intersect.observe(box);

    return () => {
      resize.disconnect();
      intersect.disconnect();
    };
  }, []);

  const srcDoc = useMemo(
    () =>
      visible
        ? buildDesignPreviewDocument(content, siteId, pageId, blockId, designId, locale)
        : "",
    [visible, content, siteId, pageId, blockId, designId, locale],
  );

  const scale = width / DESIGN_PREVIEW_WIDTH;

  return (
    <div
      ref={boxRef}
      dir="ltr"
      className="relative w-full overflow-hidden rounded-lg border border-line bg-white"
      style={{ height: Math.max(120, DESIGN_PREVIEW_HEIGHT * scale) }}
    >
      {srcDoc ? (
        <iframe
          title={title}
          sandbox=""
          srcDoc={srcDoc}
          tabIndex={-1}
          className="pointer-events-none absolute start-0 top-0 origin-top-left border-0"
          style={{
            width: DESIGN_PREVIEW_WIDTH,
            height: DESIGN_PREVIEW_HEIGHT,
            transform: `scale(${scale})`,
          }}
        />
      ) : (
        <p className="grid h-full place-items-center text-sm text-muted">{t("loading")}</p>
      )}
    </div>
  );
}
