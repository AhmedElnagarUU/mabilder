"use client";

import { useEffect, useRef, useState } from "react";

// The gallery card cover: the template's real rendered demo home page in a sandboxed, scaled-down,
// non-interactive iframe (same approach as the editor's DesignPreviewFrame). The HTML is rendered
// on the server (findPreviewPage, no Pexels/AI/db call), the iframe mounts lazily and keeps
// pointer events off, so the card keeps its own "Preview" link.
const FRAME_WIDTH = 1440;
const FRAME_HEIGHT = 900;

export function TemplateCover({ html, title }: { html: string; title: string }) {
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

  const scale = width / FRAME_WIDTH;

  return (
    <div
      ref={boxRef}
      dir="ltr"
      className="relative w-full overflow-hidden"
      style={{ height: Math.max(180, Math.round(FRAME_HEIGHT * scale)) }}
    >
      {html && visible ? (
        <iframe
          title={title}
          sandbox=""
          srcDoc={html}
          aria-hidden
          tabIndex={-1}
          scrolling="no"
          loading="lazy"
          className="pointer-events-none absolute start-0 top-0 origin-top-left border-0"
          style={{
            width: FRAME_WIDTH,
            height: FRAME_HEIGHT,
            transform: `scale(${scale})`,
          }}
        />
      ) : null}
    </div>
  );
}
