import type { Locale } from "../../static-site-generator/locale";

// The demo's image needs. The dev script `npm run templates:demo-photos` searches Pexels once for
// each template set below and writes src + credit into photos.json; the gallery itself never calls
// Pexels. Slot keys and alt texts are shared by every template, so only the photo changes per set.
export type PhotoSlot = {
  key: string;
  // Hero and project covers are shown big, so they take the wider Pexels size.
  size: "large" | "large2x";
  alt: Record<Locale, string>;
};

export const photoSlots: PhotoSlot[] = [
  {
    key: "hero",
    size: "large2x",
    alt: { en: "Recent villa by Masar Studio", ar: "فيلا حديثة من تصميم مكتب مسار" },
  },
  {
    key: "intro-studio",
    size: "large",
    alt: { en: "Masar Studio architects at work", ar: "مهندسو مسار ستوديو أثناء العمل على الرسومات" },
  },
  {
    key: "intro-model",
    size: "large",
    alt: { en: "A working scale model of a building", ar: "نموذج معماري لمبنى" },
  },
  {
    key: "intro-detail",
    size: "large",
    alt: { en: "Interior detail in a Masar project", ar: "تفصيل داخلي من مشروع مسار" },
  },
  {
    key: "svc-architecture",
    size: "large",
    alt: { en: "A building facade designed by Masar Studio", ar: "واجهة مبنى من تصميم مسار ستوديو" },
  },
  {
    key: "svc-interiors",
    size: "large",
    alt: { en: "An interior designed by Masar Studio", ar: "مساحة داخلية من تصميم مسار ستوديو" },
  },
  {
    key: "svc-engineering",
    size: "large",
    alt: { en: "An engineer inspecting a Masar site", ar: "مهندس يتفقد موقعًا من مواقع مسار" },
  },
  {
    key: "cover-marina",
    size: "large2x",
    alt: { en: "Marina Gate Villa at dusk", ar: "فيلا بوابة المارينا وقت الغروب" },
  },
  {
    key: "gallery-marina",
    size: "large",
    alt: { en: "The pool of Marina Gate Villa", ar: "بركة فيلا بوابة المارينا" },
  },
  {
    key: "cover-offices",
    size: "large2x",
    alt: { en: "The Lighthouse Offices tower", ar: "برج مكاتب المنارة" },
  },
  {
    key: "gallery-offices",
    size: "large",
    alt: { en: "Inside The Lighthouse Offices", ar: "داخل مكاتب المنارة" },
  },
  {
    key: "cover-cafe",
    size: "large2x",
    alt: { en: "Maraya Café main room", ar: "قاعة مقهى مرايا" },
  },
  {
    key: "gallery-cafe",
    size: "large",
    alt: { en: "The counter at Maraya Café", ar: "طاولة الخدمة في مقهى مرايا" },
  },
];

export type PhotoSlotKey = (typeof photoSlots)[number]["key"];

// One set per template, present even for a template that is not in the registry yet: later
// template milestones only add the template and its set is already here. agenvo is also the
// fallback set for any unknown id.
export const photoSetIds = [
  "agenvo",
  "aurelia",
  "arhitect",
  "atelier",
  "dar",
  "nova",
  "riwaq",
] as const;

export type PhotoSetId = (typeof photoSetIds)[number];

export const fallbackPhotoSetId: PhotoSetId = "agenvo";

// Own query per slot, matched to each template's mood (docs/templates-plan.md, Template directions).
export const photoQueries: Record<PhotoSetId, Record<PhotoSlotKey, string>> = {
  agenvo: {
    hero: "modern luxury villa exterior",
    "intro-studio": "architects working on drawings office",
    "intro-model": "architectural scale model building",
    "intro-detail": "modern interior design living room",
    "svc-architecture": "modern building facade concrete",
    "svc-interiors": "luxury interior design bedroom",
    "svc-engineering": "construction engineer site helmet",
    "cover-marina": "waterfront villa evening lights",
    "gallery-marina": "villa pool night view",
    "cover-offices": "modern glass office building",
    "gallery-offices": "modern office interior workspace",
    "cover-cafe": "boutique cafe interior",
    "gallery-cafe": "coffee shop counter barista",
  },
  aurelia: {
    hero: "luxury villa night facade",
    "intro-studio": "dark luxury interior architecture",
    "intro-model": "luxury marble interior detail",
    "intro-detail": "moody dark living room interior",
    "svc-architecture": "modern architecture lit at night",
    "svc-interiors": "dark luxury bedroom interior",
    "svc-engineering": "architect desk lamp night work",
    "cover-marina": "waterfront mansion night reflection",
    "gallery-marina": "villa pool night glow",
    "cover-offices": "modern tower night skyline",
    "gallery-offices": "luxury hotel lobby dark",
    "cover-cafe": "upscale restaurant lounge dark",
    "gallery-cafe": "moody restaurant candlelight",
  },
  arhitect: {
    hero: "brutalist concrete architecture",
    "intro-studio": "architect drafting desk black and white",
    "intro-model": "concrete architectural model",
    "intro-detail": "minimal concrete interior",
    "svc-architecture": "concrete building shadow",
    "svc-interiors": "minimal concrete staircase",
    "svc-engineering": "building skeleton construction black and white",
    "cover-marina": "minimal concrete house exterior",
    "gallery-marina": "brutalist courtyard",
    "cover-offices": "dark tower low angle",
    "gallery-offices": "empty concrete office interior",
    "cover-cafe": "minimal concrete cafe",
    "gallery-cafe": "concrete stairs light and shadow",
  },
  atelier: {
    hero: "white minimalist house daylight",
    "intro-studio": "bright architecture studio daylight",
    "intro-model": "white architectural model bright",
    "intro-detail": "bright white living room natural light",
    "svc-architecture": "white facade daylight",
    "svc-interiors": "minimalist white bedroom sunlight",
    "svc-engineering": "construction site visit daylight",
    "cover-marina": "white coastal villa",
    "gallery-marina": "minimalist house pool daylight",
    "cover-offices": "bright white office building",
    "gallery-offices": "bright office interior plants",
    "cover-cafe": "bright minimalist cafe",
    "gallery-cafe": "cafe counter natural light",
  },
  dar: {
    hero: "warm beige living room interior",
    "intro-studio": "interior designer studio wood",
    "intro-model": "wooden architectural model",
    "intro-detail": "beige living room wood furniture",
    "svc-architecture": "warm wood facade building",
    "svc-interiors": "cozy bedroom beige linen",
    "svc-engineering": "craftsman workshop wood",
    "cover-marina": "warm beach house exterior",
    "gallery-marina": "cozy terrace evening",
    "cover-offices": "warm wood office interior",
    "gallery-offices": "warm coworking lounge",
    "cover-cafe": "warm cafe interior beige",
    "gallery-cafe": "ceramic pottery workshop",
  },
  nova: {
    hero: "modern building construction crane",
    "intro-studio": "construction team meeting site",
    "intro-model": "building blueprint model",
    "intro-detail": "modern office lobby bright",
    "svc-architecture": "bold modern building exterior",
    "svc-interiors": "modern office interior colorful",
    "svc-engineering": "construction worker helmet site",
    "cover-marina": "modern villa construction site",
    "gallery-marina": "crane silhouette sunset",
    "cover-offices": "modern office tower daytime",
    "gallery-offices": "open plan modern office",
    "cover-cafe": "modern cafe bright interior",
    "gallery-cafe": "construction crane city daytime",
  },
  riwaq: {
    hero: "islamic architecture arches courtyard",
    "intro-studio": "majlis interior seating",
    "intro-model": "middle eastern palace courtyard",
    "intro-detail": "mosaic tiles moroccan",
    "svc-architecture": "mosque arch facade",
    "svc-interiors": "riad moroccan interior",
    "svc-engineering": "artisan craftsman tiles work",
    "cover-marina": "riad courtyard fountain",
    "gallery-marina": "arabesque courtyard arch",
    "cover-offices": "middle eastern palace hall",
    "gallery-offices": "moroccan riad lounge",
    "cover-cafe": "arabian tea house cafe",
    "gallery-cafe": "moroccan tea glasses",
  },
};
