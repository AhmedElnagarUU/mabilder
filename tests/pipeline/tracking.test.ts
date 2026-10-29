import assert from "node:assert/strict";
import { test } from "node:test";
import { renderSite } from "../../src/features/static-site-generator/render-site";
import { escapeJsString, renderTags } from "../../src/features/tracking/render-tags";
import {
  trackingSettingsSchema,
  type TrackingSettings,
} from "../../src/features/tracking/types";
import { composeFor, thinBrief } from "./samples";

const validIds = {
  metaPixelId: "123456789012345",
  ga4Id: "G-ABC123XYZ9",
  tiktokPixelId: "ABCDEFGHIJ0123456789",
  snapPixelId: "12345678-1234-1234-1234-123456789abc",
  clarityId: "abcd1234ef",
};

const snippetMarkers: Record<keyof typeof validIds, string> = {
  metaPixelId: "fbevents.js",
  ga4Id: "googletagmanager.com/gtag/js?id=G-ABC123XYZ9",
  tiktokPixelId: "analytics.tiktok.com",
  snapPixelId: "sc-static.net/scevent.min.js",
  clarityId: "clarity.ms/tag/",
};

test("each valid ID passes the schema and produces its snippet with the ID", () => {
  for (const [field, id] of Object.entries(validIds)) {
    const settings = trackingSettingsSchema.parse({ [field]: id });
    const tags = renderTags(settings);

    assert.ok(tags.includes(snippetMarkers[field as keyof typeof validIds]), `${field} snippet missing`);
    assert.ok(tags.includes(id), `${field} id missing`);
  }
});

test("all five services render together", () => {
  const tags = renderTags(trackingSettingsSchema.parse(validIds));

  for (const marker of Object.values(snippetMarkers)) {
    assert.ok(tags.includes(marker), `${marker} missing`);
  }
});

test("invalid IDs are rejected by the schema", () => {
  const invalid = [
    { metaPixelId: "12345" },
    { metaPixelId: "123456789012345678" },
    { ga4Id: "UA-12345" },
    { ga4Id: "g-abc123xyz9" },
    { tiktokPixelId: "short" },
    { snapPixelId: "not-a-uuid" },
    { clarityId: "ABCD1234EF" },
  ];

  for (const settings of invalid) {
    assert.equal(trackingSettingsSchema.safeParse(settings).success, false, JSON.stringify(settings));
  }
});

test("an ID cannot break out of the attribute or the JS string", () => {
  const attacks = [
    `G-ABC123"><script>alert(1)</script>`,
    `G-ABC123');alert(1);//`,
    `G-ABC123</script><script>alert(1)</script>`,
    `G-ABC123\n</script>`,
    `G-ABC123\n`,
    `G-ABC123'`,
  ];

  for (const attack of attacks) {
    for (const field of Object.keys(validIds)) {
      assert.equal(trackingSettingsSchema.safeParse({ [field]: attack }).success, false, `${field}: ${attack}`);
    }
  }
});

test("renderTags ignores an unvalidated ID that bypassed the schema", () => {
  const forged = { ga4Id: `G-ABC123"></script><script>alert(1)</script>` } as TrackingSettings;
  assert.equal(renderTags(forged), "");
});

test("escapeJsString keeps quotes, </script>, newlines and line separators inside the string", () => {
  const escaped = escapeJsString(`a"b'c</script>\n &`);

  assert.ok(!escaped.includes("</script>"));
  assert.ok(!escaped.includes("<"));
  assert.ok(!escaped.includes("\n"));
  assert.ok(!escaped.includes(" "));
  assert.equal(JSON.parse(escaped), `a"b'c</script>\n &`);
});

test("empty settings and empty strings render nothing", () => {
  assert.equal(renderTags({}), "");
  assert.equal(renderTags(trackingSettingsSchema.parse({ ga4Id: "", metaPixelId: "" })), "");
});

test("renderSite puts the tags in every page head, and nothing when empty", () => {
  const content = composeFor(thinBrief, [], ["en", "ar"]);
  const tags = renderTags({ ga4Id: validIds.ga4Id });

  for (const file of renderSite(content, tags)) {
    if (file.fileName === "index.html") {
      continue;
    }

    const head = file.html.slice(0, file.html.indexOf("</head>"));
    assert.ok(head.includes("googletagmanager.com"), `${file.fileName} head has no tag`);
  }

  for (const file of renderSite(content, renderTags({}))) {
    assert.ok(!file.html.includes("googletagmanager"), `${file.fileName} has a tracking script`);
    assert.ok(!file.html.includes("fbevents"), `${file.fileName} has a tracking script`);
  }
});
