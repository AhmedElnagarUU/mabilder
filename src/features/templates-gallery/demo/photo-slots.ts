import type { Locale } from "../../static-site-generator/locale";

// The demo's image needs. The dev script `npm run templates:demo-photos` searches Pexels once for
// each of these and writes src + credit into photos.json; the gallery itself never calls Pexels.
export type PhotoSlot = {
  key: string;
  query: string;
  // Hero and project covers are shown big, so they take the wider Pexels size.
  size: "large" | "large2x";
  alt: Record<Locale, string>;
};

export const photoSlots: PhotoSlot[] = [
  {
    key: "hero",
    query: "modern luxury villa exterior",
    size: "large2x",
    alt: { en: "Recent villa by Masar Studio", ar: "فيلا حديثة من تصميم مكتب مسار" },
  },
  {
    key: "intro-studio",
    query: "architects working on drawings office",
    size: "large",
    alt: { en: "Masar Studio architects at work", ar: "مهندسو مسار ستوديو أثناء العمل على الرسومات" },
  },
  {
    key: "intro-model",
    query: "architectural scale model building",
    size: "large",
    alt: { en: "A working scale model of a building", ar: "نموذج معماري لمبنى" },
  },
  {
    key: "intro-detail",
    query: "modern interior design living room",
    size: "large",
    alt: { en: "Interior detail in a Masar project", ar: "تفصيل داخلي من مشروع مسار" },
  },
  {
    key: "svc-architecture",
    query: "modern building facade concrete",
    size: "large",
    alt: { en: "A building facade designed by Masar Studio", ar: "واجهة مبنى من تصميم مسار ستوديو" },
  },
  {
    key: "svc-interiors",
    query: "luxury interior design bedroom",
    size: "large",
    alt: { en: "An interior designed by Masar Studio", ar: "مساحة داخلية من تصميم مسار ستوديو" },
  },
  {
    key: "svc-engineering",
    query: "construction engineer site helmet",
    size: "large",
    alt: { en: "An engineer inspecting a Masar site", ar: "مهندس يتفقد موقعًا من مواقع مسار" },
  },
  {
    key: "cover-marina",
    query: "waterfront villa evening lights",
    size: "large2x",
    alt: { en: "Marina Gate Villa at dusk", ar: "فيلا بوابة المارينا وقت الغروب" },
  },
  {
    key: "gallery-marina",
    query: "villa pool night view",
    size: "large",
    alt: { en: "The pool of Marina Gate Villa", ar: "بركة فيلا بوابة المارينا" },
  },
  {
    key: "cover-offices",
    query: "modern glass office building",
    size: "large2x",
    alt: { en: "The Lighthouse Offices tower", ar: "برج مكاتب المنارة" },
  },
  {
    key: "gallery-offices",
    query: "modern office interior workspace",
    size: "large",
    alt: { en: "Inside The Lighthouse Offices", ar: "داخل مكاتب المنارة" },
  },
  {
    key: "cover-cafe",
    query: "boutique cafe interior",
    size: "large2x",
    alt: { en: "Maraya Café main room", ar: "قاعة مقهى مرايا" },
  },
  {
    key: "gallery-cafe",
    query: "coffee shop counter barista",
    size: "large",
    alt: { en: "The counter at Maraya Café", ar: "طاولة الخدمة في مقهى مرايا" },
  },
];

export type PhotoSlotKey = (typeof photoSlots)[number]["key"];
