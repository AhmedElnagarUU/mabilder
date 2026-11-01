import type { Facts } from "../../static-site-generator/blocks/facts";
import type { Image } from "../../static-site-generator/blocks/common";
import type { BlockType } from "../../static-site-generator/blocks/catalog";
import { getDesignByName } from "../../static-site-generator/designs/registry";
import type { Locale } from "../../static-site-generator/locale";
import { siteContentSchema, type SiteContent } from "../../static-site-generator/site-content";
import type { ThemeBlock } from "../../static-site-generator/themes/types";
import photosJson from "./photos.json";
import { photoSlots, type PhotoSlotKey } from "./photo-slots";

// The fixed demo content behind the public template gallery: one made-up architecture and
// interior design firm, written in natural English and Modern Standard Arabic. Photos come from
// photos.json (chosen once by the dev script); the gallery pages never call Pexels or the AI.

type PropsOf<T extends BlockType> = ThemeBlock<T>["props"];

const design = {
  heroFull: getDesignByName("hero", "full-image").id,
  heroPage: getDesignByName("hero", "page").id,
  introImages: getDesignByName("intro", "images").id,
  introQuote: getDesignByName("intro", "quote").id,
  servicesColumns: getDesignByName("services", "columns").id,
  servicesList: getDesignByName("services", "list").id,
  statsDark: getDesignByName("stats", "dark").id,
  projectsFeatured: getDesignByName("projects", "featured").id,
  projectsGrid: getDesignByName("projects", "grid").id,
  processDefault: getDesignByName("process", "default").id,
  testimonialsDefault: getDesignByName("testimonials", "default").id,
  ctaDark: getDesignByName("cta", "dark").id,
  ctaLight: getDesignByName("cta", "light").id,
  contactSplit: getDesignByName("contact", "split").id,
  faqDefault: getDesignByName("faq", "default").id,
};

// Props are checked against the theme block types here, so a wrong field is a compile error.
function block<T extends BlockType>(slug: string, type: T, designId: string, props: { en: PropsOf<T>; ar: PropsOf<T> }) {
  return { id: `block-${slug}-${type}`, type, design: designId, hidden: false, props };
}

type PhotoRecord = { src: string; credit: { name: string; url: string } };

// Indexable by slot key, so a slot without a photo in photos.json fails loudly here.
const photos: Record<PhotoSlotKey, PhotoRecord | undefined> = photosJson.photos;

function photo(slot: PhotoSlotKey): PhotoRecord {
  const found = photos[slot];

  if (!found) {
    throw new Error(`photos.json has no photo for slot "${slot}". Run npm run templates:demo-photos.`);
  }

  return found;
}

function image(slot: PhotoSlotKey, locale: Locale): Image {
  const found = photo(slot);
  const alt = photoSlots.find((candidate) => candidate.key === slot)?.alt[locale];

  if (!alt) {
    throw new Error(`photo slot "${slot}" has no alt text.`);
  }

  return { src: found.src, alt, credit: found.credit };
}

const facts = {
  businessName: "Masar Studio",
  industry: "Architecture, interior design and MEP engineering in Dubai",
  email: "hello@masar-studio.example",
  phone: "+971 4 000 0000",
  website: "masar-studio.example",
  address: "Bay Square, Building 13, Business Bay, Dubai",
  yearsInBusiness: 12,
  projectCount: 140,
  services: ["Architecture", "Interior design", "MEP engineering"],
  clients: ["Marina Gate Holdings", "Saray Developments", "Lamar Hospitality", "Oasis Retail Group"],
  awards: [
    { year: "2025", title: "Gulf Architecture Prize — hospitality" },
    { year: "2024", title: "Emirates Interior Design Award" },
    { year: "2023", title: "Dubai Design Circle Prize" },
    { year: "2021", title: "Residential Excellence Award, GCC" },
  ],
  projects: [
    {
      title: "Marina Gate Villa",
      category: "Residential",
      location: "Jumeirah Bay, Dubai",
      year: "2025",
      description:
        "A family villa on a marina plot, rebuilt around a shaded courtyard instead of the glass box the plot was sold with.",
      area: 980,
      duration: "18 months",
      client: "Yusuf Al Marri",
      scope: ["Architecture", "Interior design", "MEP coordination"],
      challenge:
        "The permitted design that came with the plot was a glass box that would have needed air-conditioning all year.",
      solution:
        "We rebuilt the plan around a shaded, cross-ventilated north-facing courtyard and moved the glass into two protected bays.",
      result: "Completed in summer 2025 on budget, with peak cooling load at roughly half of the permitted design.",
      images: [image("cover-marina", "en"), image("gallery-marina", "en")],
      showOnHome: true,
      translations: {
        ar: {
          title: "فيلا بوابة المارينا",
          category: "سكني",
          location: "جميرا باي، دبي",
          description:
            "فيلا عائلية على قطعة مطلّة على المارينا، أُعيد بناؤها حول فناء مظلّل بدل الصندوق الزجاجي الذي كانت مباعة معه.",
          duration: "18 شهرًا",
          client: "يوسف المري",
          challenge: "كان التصميم المرخّص المرفق بالقطعة صندوقًا زجاجيًا يحتاج إلى تبريد على مدار السنة.",
          solution: "أعدنا بناء المخطط حول فناء شمالي مظلّل بتهوية متقاطعة، ونقلنا الزجاج إلى بايئين محميين.",
          result: "أُنجز المشروع صيف 2025 داخل الميزانية، وبحمولة تبريد قصوى تعادل نحو نصف التصميم المرخّص.",
        },
      },
    },
    {
      title: "The Lighthouse Offices",
      category: "Workplace",
      location: "Bay Square, Dubai",
      year: "2024",
      description:
        "A mid-rise workplace with deep daylight on every floor and a public ground floor for its tenants' clients.",
      area: 3200,
      duration: "14 months",
      client: "Saray Developments",
      scope: ["Architecture", "MEP engineering"],
      challenge: "A 3,200 square metre programme on a fourteen-month schedule, with no budget for a curtain wall.",
      solution:
        "A precast frame with deep clerestory daylight, an open plan that divides without re-coring, and one shared plant room.",
      result: "Handed over in spring 2024 with every floor leased before completion.",
      images: [image("cover-offices", "en"), image("gallery-offices", "en")],
      showOnHome: true,
      translations: {
        ar: {
          title: "مكاتب المنارة",
          category: "مكاتب",
          location: "باي سكوير، دبي",
          description:
            "مبنى مكاتب متوسط الارتفاع بضوء طبيعي عميق في كل طابق وطابق أرضي عام يستقبل زبائن المستأجرين.",
          duration: "14 شهرًا",
          client: "سراي للتطوير",
          challenge: "برنامج بمساحة 3200 متر مربع خلال أربعة عشر شهرًا، دون ميزانية لواجهة زجاجية.",
          solution:
            "هيكل خرساني مسبق الصب بضوء عميق من النوافذ العلوية، ومخطط مفتوح قابل للتجزئة دون تغيير العروق، وغرفة واحدة مشتركة للأنظمة.",
          result: "سُلّم المبنى في ربيع 2024 وقد كُرّئ كل طابق قبل الاكتمال.",
        },
      },
    },
    {
      title: "Maraya Café",
      category: "Hospitality",
      location: "Al Fahidi, Dubai",
      year: "2023",
      description: "A café threaded through two protected 1950s houses, joined by one continuous counter.",
      area: 240,
      duration: "9 months",
      client: "Kamal Al Suwaidi",
      scope: ["Interior design", "Architecture"],
      challenge: "Both houses are protected, so nothing visible was allowed to change on the street.",
      solution:
        "We kept both facades and joined the volumes behind a single service spine, turning rooms into seating pockets.",
      result: "Opened in autumn 2023; the counter survives every future refit.",
      images: [image("cover-cafe", "en"), image("gallery-cafe", "en")],
      showOnHome: true,
      translations: {
        ar: {
          title: "مقهى مرايا",
          category: "ضيافة",
          location: "حي الفهيدي، دبي",
          description: "مقهى ينساب داخل بيتين محميين من خمسينيات القرن الماضي، يحفّظهما من الداخل.",
          duration: "9 أشهر",
          client: "كمال السويدي",
          challenge: "البيتان محميتان، فلا يجوز أن يظهر أي تغيير على الشارع.",
          solution: "حافظنا على الواجهتين وجمعنا الحجمين خلف مسار خدمات واحد، فتحولت الغرف إلى جيوب جلسة.",
          result: "افتُتح المقهى في خريف 2023، وما تزال طاولة الخدمة صامدة في كل تجديد لاحق.",
        },
      },
    },
  ],
  team: [],
  testimonials: [
    {
      quote: "They talked us out of a basement nobody would use and put that money into the courtyard.",
      author: "Yusuf Al Marri",
      company: "Marina Gate Holdings",
    },
    {
      quote: "Their drawing set settled a dispute between three fit-out contractors in one week.",
      author: "Farah Haddad",
      company: "The Lighthouse Offices",
    },
  ],
  reviews: [
    {
      name: "Yusuf Al Marri",
      rating: 5,
      comment: "They talked us out of a basement nobody would use and put that money into the courtyard.",
    },
    {
      name: "Farah Haddad",
      rating: 5,
      comment: "Their drawing set settled a dispute between three fit-out contractors in one week.",
    },
    {
      name: "Kamal Al Suwaidi",
      rating: 4,
      comment: "The café opened on time and survived every plan change the landlord demanded.",
    },
  ],
} satisfies Facts;

const pageMeta: Record<
  "index" | "about" | "services" | "projects" | "contact",
  { en: { title: string; description: string }; ar: { title: string; description: string } }
> = {
  index: {
    en: {
      title: "Masar Studio — Architecture and interior design in Dubai",
      description: "Architecture, interior design and MEP engineering in Dubai, delivered by one team.",
    },
    ar: {
      title: "مسار ستوديو — عمارة وتصميم داخلي في دبي",
      description: "عمارة وتصميم داخلي وهندسة كهروميكانيكية في دبي، بتنفيذ فريق واحد.",
    },
  },
  about: {
    en: { title: "About | Masar Studio", description: "The studio, its method and its promise on hand-over day." },
    ar: { title: "من نحن | مسار ستوديو", description: "المكتب وطريقته ووعده في يوم التسليم." },
  },
  services: {
    en: {
      title: "Services | Masar Studio",
      description: "Architecture, interior design and MEP engineering in one contract.",
    },
    ar: {
      title: "خدماتنا | مسار ستوديو",
      description: "عمارة وتصميم داخلي وهندسة كهروميكانيكية في عقد واحد.",
    },
  },
  projects: {
    en: {
      title: "Projects | Masar Studio",
      description: "Villas, workplaces and hospitality projects from the Masar Studio archive.",
    },
    ar: {
      title: "مشاريعنا | مسار ستوديو",
      description: "مشاريع فلل ومكاتب وضيافة من أرشيف مسار ستوديو.",
    },
  },
  contact: {
    en: {
      title: "Contact | Masar Studio",
      description: "Write to or call the Masar Studio team in Dubai.",
    },
    ar: {
      title: "تواصل | مسار ستوديو",
      description: "اكتب إلى فريق مسار ستوديو في دبي أو اتصل به.",
    },
  },
};

type ProjectsProps = PropsOf<"projects">;
type ServicesProps = PropsOf<"services">;

const servicesProps: { en: ServicesProps; ar: ServicesProps } = {
  en: {
    eyebrow: "What we do",
    title: "Three disciplines, one studio.",
    body: "Every project passes through the studio's own standards from concept drawings to the mechanical and electrical files, so nothing is lost between phases.",
    items: [
      {
        title: "Architecture",
        body: "Homes, workplaces and hospitality buildings, designed from the site study to the construction drawings.",
        icon: "building-2",
        image: image("svc-architecture", "en"),
      },
      {
        title: "Interior design",
        body: "Interior architecture, joinery and furniture that belong to the building, not to a showroom.",
        icon: "sofa",
        image: image("svc-interiors", "en"),
      },
      {
        title: "MEP engineering",
        body: "Mechanical, electrical and plumbing design inside our own drawings, so services never fight the architecture.",
        icon: "ruler",
        image: image("svc-engineering", "en"),
      },
    ],
  },
  ar: {
    eyebrow: "ما نفعله",
    title: "ثلاثة تخصصات في مكتب واحد.",
    body: "كل مشروع يمرّ بمعايير المكتب من الرسوم المبدئية إلى الملفات الكهروميكانيكية، فلا يضيع شيء بين المراحل.",
    items: [
      {
        title: "العمارة",
        body: "منازل ومبانٍ عمل ومساحات ضيافة، تُصمَّم من دراسة الموقع حتى الرسومات التنفيذية.",
        icon: "building-2",
        image: image("svc-architecture", "ar"),
      },
      {
        title: "تصميم الداخل",
        body: "عمارة داخلية وأثاث مصمّم بحيث ينتمي إلى المبنى نفسه، لا إلى صالة عرض.",
        icon: "sofa",
        image: image("svc-interiors", "ar"),
      },
      {
        title: "الهندسة الكهروميكانيكية",
        body: "تصميم ميكانيكي وكهربائي وصحي داخل رسوماتنا، حتى لا تتصارع الأنظمة مع العمارة أبدًا.",
        icon: "ruler",
        image: image("svc-engineering", "ar"),
      },
    ],
  },
};

const projectsProps: { en: ProjectsProps; ar: ProjectsProps } = {
  en: {
    eyebrow: "Archive",
    title: "Selected work.",
    body: "Three recent projects from the archive. The projects page carries every story we are allowed to tell.",
    items: [
      {
        title: "Marina Gate Villa",
        meta: "Jumeirah Bay, Dubai — 2025",
        category: "Residential",
        body: "A family villa around a shaded, cross-ventilated courtyard; cooling load cut to about half of the permitted design.",
        href: "projects/marina-gate-villa.html",
        image: image("cover-marina", "en"),
      },
      {
        title: "The Lighthouse Offices",
        meta: "Bay Square, Dubai — 2024",
        category: "Workplace",
        body: "Deep daylight on every floor and one shared plant room, in a frame that divides without re-coring.",
        href: "projects/the-lighthouse-offices.html",
        image: image("cover-offices", "en"),
      },
      {
        title: "Maraya Café",
        meta: "Al Fahidi, Dubai — 2023",
        category: "Hospitality",
        body: "Two protected houses joined behind the facades by one continuous service counter.",
        href: "projects/maraya-cafe.html",
        image: image("cover-cafe", "en"),
      },
    ],
    link: { label: "Open the archive", href: "projects.html" },
  },
  ar: {
    eyebrow: "الأرشيف",
    title: "أعمال مختارة.",
    body: "ثلاثة مشاريع حديثة من الأرشيف، وصفحة المشاريع تحمل كل قصة يحقّ لنا سردَها.",
    items: [
      {
        title: "فيلا بوابة المارينا",
        meta: "جميرا باي، دبي — 2025",
        category: "سكني",
        body: "فيلا عائلية حول فناء مظلّل بتهوية متقاطعة؛ انخفضت حمولة التبريد إلى نحو نصف التصميم المرخّص.",
        href: "projects/marina-gate-villa.html",
        image: image("cover-marina", "ar"),
      },
      {
        title: "مكاتب المنارة",
        meta: "باي سكوير، دبي — 2024",
        category: "مكاتب",
        body: "ضوء طبيعي عميق في كل طابق وغرفة أنظمة واحدة مشتركة، في هيكل قابل للتجزئة دون تغيير العروق.",
        href: "projects/the-lighthouse-offices.html",
        image: image("cover-offices", "ar"),
      },
      {
        title: "مقهى مرايا",
        meta: "حي الفهيدي، دبي — 2023",
        category: "ضيافة",
        body: "بيتان محميان جُمّعا خلف الواجهتين بطاولة خدمة واحدة ممتدة.",
        href: "projects/maraya-cafe.html",
        image: image("cover-cafe", "ar"),
      },
    ],
    link: { label: "افتح الأرشيف", href: "projects.html" },
  },
};

const content = {
  theme: "agenvo",
  locales: ["en", "ar"],
  defaultLocale: "en",
  facts,
  nav: {
    en: {
      items: [
        { label: "Home", href: "index.html" },
        { label: "About", href: "about.html" },
        { label: "Services", href: "services.html" },
        { label: "Projects", href: "projects.html" },
        { label: "Contact", href: "contact.html" },
      ],
      cta: { label: "Start a project", href: "contact.html" },
      menuLabel: "Menu",
      languageLabel: "العربية",
    },
    ar: {
      items: [
        { label: "الرئيسية", href: "index.html" },
        { label: "من نحن", href: "about.html" },
        { label: "خدماتنا", href: "services.html" },
        { label: "مشاريعنا", href: "projects.html" },
        { label: "تواصل", href: "contact.html" },
      ],
      cta: { label: "ابدأ مشروعك", href: "contact.html" },
      menuLabel: "القائمة",
      languageLabel: "English",
    },
  },
  footer: {
    en: {
      blurb: "An architecture and interior design practice in Dubai.",
      copyright: "© 2026 Masar Studio. All rights reserved.",
      photoCreditLabel: "Photo credits",
    },
    ar: {
      blurb: "مكتب معماري وتصميم داخلي في دبي.",
      copyright: "© 2026 مسار ستوديو. جميع الحقوق محفوظة.",
      photoCreditLabel: "حقوق الصور",
    },
  },
  pages: [
    {
      id: "home",
      slug: "index",
      meta: pageMeta.index,
      blocks: [
        block("home", "hero", design.heroFull, {
          en: {
            eyebrow: "Architecture · Interior design · MEP engineering",
            title: "Buildings that sit quietly in their context.",
            body: "Masar Studio is an architecture and interior design practice in Dubai. We design homes, workplaces and hospitality spaces around the people who use them every day.",
            image: image("hero", "en"),
            primary: { label: "View our projects", href: "projects.html" },
          },
          ar: {
            eyebrow: "معمارية · تصميم داخلي · هندسة كهروميكانيكية",
            title: "مبانٍ تجلس بهدوء في سياقها.",
            body: "مسار ستوديو مكتب معماري وتصميم داخلي في دبي. نصمّم منازل وأماكن عمل ومساحات ضيافة حول الأشخاص الذين يستخدمونها كل يوم.",
            image: image("hero", "ar"),
            primary: { label: "اطّلع على مشاريعنا", href: "projects.html" },
          },
        }),
        block("home", "intro", design.introImages, {
          en: {
            eyebrow: "The studio",
            title: "One team, from the first sketch to hand-over.",
            paragraphs: [
              "Masar Studio was founded in 2014 by six architects who wanted to hand over buildings exactly as drawn. Today the studio covers architecture, interiors and building services engineering under one roof.",
              "We treat every commission the same way: a small team stays with the project from the site walk to the last door handle, supported by structural and MEP partners we have trusted for years.",
            ],
            quote: "A building should still make sense in twenty years, not only on the day the camera visits.",
            images: [image("intro-studio", "en"), image("intro-model", "en"), image("intro-detail", "en")],
            link: { label: "More about the studio", href: "about.html" },
          },
          ar: {
            eyebrow: "المكتب",
            title: "فريق واحد من أول رسم حتى التسليم.",
            paragraphs: [
              "تأسست مسار ستوديو عام 2014 على يد ستة مهندسين معماريين أرادوا تسليم المباني كما رُسمت تمامًا. واليوم يغطي المكتب العمارة وتصميم الداخل وهندسة أنظمة المباني تحت سقف واحد.",
              "نشغّل كل تكليف بالطريقة نفسها: فريق صغير يبقى مع المشروع من جولة الموقع حتى آخر مقبض باب، مدعومًا بشركاء هندسة إنشائية وكهروميكانيكية نثق بهم منذ سنوات.",
            ],
            quote: "على المبنى أن يظل مقنعًا بعد عشرين عامًا، لا في يوم زيارة الكاميرا فحسب.",
            images: [image("intro-studio", "ar"), image("intro-model", "ar"), image("intro-detail", "ar")],
            link: { label: "المزيد عن المكتب", href: "about.html" },
          },
        }),
        block("home", "services", design.servicesColumns, servicesProps),
        block("home", "stats", design.statsDark, {
          en: {
            eyebrow: "By the numbers",
            title: "Twelve years of built work.",
            items: [
              { value: "12", label: "Years in business" },
              { value: "140", label: "Projects delivered" },
              { value: "4", label: "Design awards" },
              { value: "4.7", label: "Average client rating" },
            ],
          },
          ar: {
            eyebrow: "بالأرقام",
            title: "اثنا عشر عامًا من العمل المبني.",
            items: [
              { value: "12", label: "سنوات الخبرة" },
              { value: "140", label: "مشروعًا منجزًا" },
              { value: "4", label: "جوائز تصميم" },
              { value: "4.7", label: "متوسط تقييم العملاء" },
            ],
          },
        }),
      ],
    },
    {
      id: "about-page",
      slug: "about",
      meta: pageMeta.about,
      blocks: [
        block("about", "hero", design.heroPage, {
          en: {
            eyebrow: "The studio",
            title: "An architecture practice built around hand-over day.",
            body: "Thirty-one people who want the finished building to match the drawings, and who dislike cleverness that gets in the way of delivery.",
            image: image("intro-studio", "en"),
          },
          ar: {
            eyebrow: "المكتب",
            title: "مكتب معماري بُني حول يوم التسليم.",
            body: "إحدى وثلاثون شخصًا يريدون أن يطابق المبنى المُنجز الرسومات، ولا يحبون الحلول الذكية التي تعترض التسليم.",
            image: image("intro-studio", "ar"),
          },
        }),
        block("about", "intro", design.introQuote, {
          en: {
            eyebrow: "The promise",
            title: "Hand-over files, not fairy tales.",
            paragraphs: [
              "Since 2016 no Masar project has been handed over without a photographed, numbered file of what was actually built. Not because it looks good in the archive — because in ten years it is the only thing that will still matter.",
              "The studio runs a weekly walkthrough on every reachable site, and the client receives the same meeting notes we give the contractors.",
            ],
            quote: "A hand-over is a beginning, not a goodbye.",
            images: [image("intro-model", "en")],
            link: { label: "What the studio delivers", href: "services.html" },
          },
          ar: {
            eyebrow: "الوعد",
            title: "ملفات تسليم لا حكايات.",
            paragraphs: [
              "منذ عام 2016 لم يُسلَّم أي مشروع لمسار دون ملف مصوَّر ومرقَّم لما بُني فعلًا. لا لأن ذلك يبدو جميلًا في الأرشيف، بل لأنه بعد عشر سنوات سيكون الشيء الوحيد الذي يزال مهمًّا.",
              "يعقد المكتب جولة ميدانية أسبوعية في كل موقع يمكن الوصول إليه، ويستلم العميل ملاحظات الاجتماع نفسها التي نسلّمها للمقاولين.",
            ],
            quote: "التسليم بداية لا وداع.",
            images: [image("intro-model", "ar")],
            link: { label: "ما يقدّمه المكتب", href: "services.html" },
          },
        }),
        block("about", "process", design.processDefault, {
          en: {
            eyebrow: "How we work",
            title: "Four phases, one contract.",
            body: "The phases are the same whether the project is a café or a tower. What changes is the depth of each one.",
            steps: [
              {
                title: "Site and brief",
                body: "We measure the site ourselves, test the light, and write the brief with you, not for you.",
              },
              {
                title: "Concept",
                body: "Two directions, modelled quickly, then one is chosen and developed without re-litigating the other.",
              },
              {
                title: "Documents",
                body: "Construction drawings, MEP coordination and authority permits from one team, in one file.",
              },
              {
                title: "Site and hand-over",
                body: "Weekly visits until the last fixing, and a numbered hand-over file with everything photographed.",
              },
            ],
          },
          ar: {
            eyebrow: "طريقة عملنا",
            title: "أربع مراحل في عقد واحد.",
            body: "المراحل واحدة سواء كان المشروع مقهى أو برجًا، والمتغير هو عمق كل مرحلة.",
            steps: [
              {
                title: "الموقع والبرنامج",
                body: "نقيس الموقع بأنفسنا ونختبر الضوء، ونكتب البرنامج معك لا عنك.",
              },
              {
                title: "المفهوم",
                body: "اتجاهان بنموذجين سريعين، ثم يُختار أحدهما ويُطوَّر دون الخوض في الجدل من جديد.",
              },
              {
                title: "الوثائق",
                body: "رسومات تنفيذية وتنسيق كهروميكانيكي وتراخيص من فريق واحد في ملف واحد.",
              },
              {
                title: "الموقع والتسليم",
                body: "زيارات أسبوعية حتى آخر تثبيت، وملف تسليم مرقّم بكل شيء مصوَّرًا.",
              },
            ],
          },
        }),
        block("about", "testimonials", design.testimonialsDefault, {
          en: {
            eyebrow: "Client voices",
            title: "Trusted with the brief.",
            items: [
              {
                quote: "They talked us out of a basement nobody would use and put that money into the courtyard.",
                author: "Yusuf Al Marri",
                company: "Marina Gate Holdings",
                rating: 5,
              },
              {
                quote: "Their drawing set settled a dispute between three fit-out contractors in one week.",
                author: "Farah Haddad",
                company: "The Lighthouse Offices",
                rating: 5,
              },
            ],
            averageRating: 4.7,
            reviewCount: 3,
          },
          ar: {
            eyebrow: "آراء العملاء",
            title: "أمانة في التكليف.",
            items: [
              {
                quote: "أقنعونا بتصميم مرشدتنا بعدم بناء قبو لا يستخدمه أحد، وصرفت تلك الميزانية على الفناء.",
                author: "يوسف المري",
                company: "مجموعة بوابة المارينا",
                rating: 5,
              },
              {
                quote: "ملف رسوماتهم حسم خلافًا بين ثلاث شركات تشطيب في أسبوع واحد.",
                author: "فرح حداد",
                company: "مكاتب المنارة",
                rating: 5,
              },
            ],
            averageRating: 4.7,
            reviewCount: 3,
          },
        }),
        block("about", "cta", design.ctaLight, {
          en: {
            title: "The next project starts with one drawing.",
            body: "Send us the plot, the floor plan, or just the problem. A first conversation is free and usually an hour.",
            primary: { label: "Talk to the studio", href: "contact.html" },
          },
          ar: {
            title: "المشروع التالي يبدأ برسمة واحدة.",
            body: "أرسل إلينا القطعة أو المخطط أو المشكلة وحدها. المحادثة الأولى مجانية وتستغرق ساعة عادة.",
            primary: { label: "تحدّث إلى المكتب", href: "contact.html" },
          },
        }),
      ],
    },
    {
      id: "services-page",
      slug: "services",
      meta: pageMeta.services,
      blocks: [
        block("services", "hero", design.heroPage, {
          en: {
            eyebrow: "Services",
            title: "Three disciplines that share one office.",
            body: "Architecture, interior design and building services engineering under one contract — so responsibility never splits between three companies.",
          },
          ar: {
            eyebrow: "خدماتنا",
            title: "ثلاثة تخصصات في مكتب واحد.",
            body: "عمارة وتصميم داخلي وهندسة أنظمة المباني في عقد واحد، حتى لا تتفرق المسؤولية بين ثلاث شركات.",
          },
        }),
        block("services", "services", design.servicesList, servicesProps),
        block("services", "faq", design.faqDefault, {
          en: {
            eyebrow: "Common questions",
            title: "Before you write.",
            body: "A few things clients ask us most often. If your question is not here, ask it directly.",
            items: [
              {
                question: "Do you take on projects outside Dubai?",
                answer:
                  "Yes. Recent work includes projects in Sharjah, Muscat and Jeddah. For sites further away we usually partner with a local architect of record and retain design leadership.",
              },
              {
                question: "What is the smallest project you take on?",
                answer:
                  "Our minimum engagement is a full design phase, because a single room deserves the same rigour as a villa. We do not sell hourly consultations.",
              },
              {
                question: "Can you work with an engineer or contractor we already have?",
                answer:
                  "Often. We can join as the design team for drawings and site supervision while your contractor runs the build.",
              },
              {
                question: "How early should we contact the studio?",
                answer:
                  "Before you buy the land, if you can. A two-hour feasibility conversation has saved more than one client from the wrong plot.",
              },
            ],
          },
          ar: {
            eyebrow: "أسئلة شائعة",
            title: "قبل أن تكتب إلينا.",
            body: "أشياء يسألها العملاء كثيرًا. إن لم يكن سؤالك هنا فاسأله مباشرة.",
            items: [
              {
                question: "أتقبلون مشاريع خارج دبي؟",
                answer:
                  "نعم. شملت آخر أعمالنا مشاريع في الشارقة ومسقط وجدة. وللمواقع الأبعد نشارك عادة مهندسًا معماريًا محليًا مرخّصًا ونحتفظ بقيادة التصميم.",
              },
              {
                question: "ما أصغر مشروع تتقبلونه؟",
                answer:
                  "أقل التزام نبدأ به هو مرحلة تصميم كاملة، لأن غرفة واحدة تستحق الدقة نفسها التي تستحقها فيلا. ولا نبيع ساعات استشارية مفردة.",
              },
              {
                question: "هل يمكنكم العمل مع مهندس أو مقاول استأجرناه مسبقًا؟",
                answer:
                  "غالبًا. يمكننا الانضمام بصفتنا فريق التصميم للرسومات وإشراف الموقع بينما يدير مقاولكم البناء.",
              },
              {
                question: "متى ينبغي أن نتواصل معكم؟",
                answer:
                  "قبل شراء الأرض إن أمكن. محادثة جدوى من ساعتين أنقذت أكثر من عميل من قطعة خطأ.",
              },
            ],
          },
        }),
        block("services", "cta", design.ctaDark, {
          en: {
            eyebrow: "Next step",
            title: "Ready when the site is.",
            body: "Send the plot, the plan or the problem. We reply within two working days with an honest view of whether the project is ready for an architect.",
            primary: { label: "Start the conversation", href: "contact.html" },
            secondary: { label: "See the services in detail", href: "services.html" },
          },
          ar: {
            eyebrow: "الخطوة التالية",
            title: "جاهزون متى جاهز الموقع.",
            body: "أرسل القطعة أو المخطط أو المشكلة. نرد خلال يومي عمل برأي صريح حول مدى جاهزية المشروع لشغل مهندس معماري.",
            primary: { label: "ابدأ المحادثة", href: "contact.html" },
            secondary: { label: "الخدمات بالتفصيل", href: "services.html" },
          },
        }),
      ],
    },
    {
      id: "projects-page",
      slug: "projects",
      meta: pageMeta.projects,
      blocks: [
        block("projects", "hero", design.heroPage, {
          en: {
            eyebrow: "Archive",
            title: "Built work, 2019 to today.",
            body: "Villas, workplaces and hospitality projects across the Emirates and the wider Gulf. Every archive entry carries its own story page.",
          },
          ar: {
            eyebrow: "الأرشيف",
            title: "أعمال مبنية من 2019 إلى اليوم.",
            body: "مشاريع فلل ومكاتب وضيافة في الإمارات ودول الخليج. وكل مدخل في الأرشيف له صفحة قصته.",
          },
        }),
        block("projects", "projects", design.projectsGrid, projectsProps),
        block("projects", "cta", design.ctaLight, {
          en: {
            title: "Bring us the next site.",
            body: "The archive is a sample, not a limit. Tell us what the plot needs and we will tell you what it takes.",
            primary: { label: "Start a project", href: "contact.html" },
          },
          ar: {
            title: "أحضروا إلينا الموقع التالي.",
            body: "الأرشيف نموذج لا سقف. أخبرنا بما تحتاجه القطعة وسنخبركم بما يحتاجه المشروع.",
            primary: { label: "ابدأ مشروعك", href: "contact.html" },
          },
        }),
      ],
    },
    {
      id: "contact-page",
      slug: "contact",
      meta: pageMeta.contact,
      blocks: [
        block("contact", "hero", design.heroPage, {
          en: {
            eyebrow: "Contact",
            title: "Start the conversation.",
            body: "A phone call answers more than a page of writing. Send your site, your plot, or the question that keeps you awake.",
          },
          ar: {
            eyebrow: "تواصل",
            title: "ابدأ المحادثة.",
            body: "مكالمة هاتفية تجيب أكثر من صفحة من الكتابة. أرسل موقعك أو قطعتك أو السؤال الذي يطاردك.",
          },
        }),
        block("contact", "contact", design.contactSplit, {
          en: {
            eyebrow: "Get in touch",
            title: "Write to the studio.",
            body: "The form reaches the studio inbox directly. We reply within two working days — and a human writes the answer.",
            form: {
              namePlaceholder: "Full name",
              emailPlaceholder: "Email",
              messagePlaceholder: "Your site or your question",
              submitLabel: "Send inquiry",
              successMessage: "Thank you — the message reached the studio. We reply within two working days.",
              phonePlaceholder: "Phone number",
              privacyNote: "We use your details only to reply to you.",
              errorMessage: "Something went wrong. Check your details and try again.",
            },
          },
          ar: {
            eyebrow: "تواصل معنا",
            title: "اكتب إلى المكتب.",
            body: "يصل النموذج مباشرةً إلى بريد المكتب. نرد خلال يومي عمل — وتُكتب الإجابة إنسانًا لا آلة.",
            form: {
              namePlaceholder: "الاسم الكامل",
              emailPlaceholder: "البريد الإلكتروني",
              messagePlaceholder: "موقعك أو سؤالك",
              submitLabel: "أرسل الطلب",
              successMessage: "شكرًا — وصلت رسالتك إلى المكتب. نرد خلال يومي عمل.",
              phonePlaceholder: "رقم الهاتف",
              privacyNote: "نستخدم بياناتك للرد عليك فقط.",
              errorMessage: "حدث خطأ ما. تحقق من البيانات وجرّب مرة أخرى.",
            },
          },
        }),
        block("contact", "faq", design.faqDefault, {
          en: {
            title: "Good to know before we call.",
            body: "The first conversation is free. These are the questions that make it useful for both of us.",
            items: [
              {
                question: "What should we have ready for the first call?",
                answer:
                  "The plot number or address, the photos you have, and one sentence about what you want to build. That is genuinely enough.",
              },
              {
                question: "Do you charge for the first conversation?",
                answer:
                  "No. If the project is not ready for an architect, we tell you that, and what would make it ready.",
              },
              {
                question: "Who owns the drawings you produce?",
                answer:
                  "You do. We hand over the native files with the permit set at practical completion, not after.",
              },
            ],
          },
          ar: {
            title: "أسئلة تسهّل مكالمتنا الأولى.",
            body: "المحادثة الأولى مجانية، وهذه الأسئلة تجعلها مفيدة للطرفين.",
            items: [
              {
                question: "ماذا ينبغي أن نجهّز لأول مكالمة؟",
                answer:
                  "رقم القطعة أو عنوانها، والصور المتوفرة لديك، وجملة واحدة عمّا تريد بناءه. هذا كافٍ حقًا.",
              },
              {
                question: "هل تتقاضون أجرًا على المحادثة الأولى؟",
                answer: "لا. إن لم يكن المشروع جاهزًا لشغل مهندس معماري أخبرناك بذلك، وبما الذي يجعله جاهزًا.",
              },
              {
                question: "من يملك الرسومات التي تنتجونها؟",
                answer: "أنت. نسلّم الملفات الأصلية مع ملف الترخيص عند الإنجاز العملي، لا بعده.",
              },
            ],
          },
        }),
      ],
    },
  ],
};

// Validates on every import, so a typo in the demo content breaks the gallery at build time.
export const demoContent: SiteContent = siteContentSchema.parse(content);

export type DemoContent = typeof demoContent;

export function heroPreviewImage(locale: Locale): Image {
  const hero = demoContent.pages[0].blocks.find((candidate) => candidate.type === "hero");

  if (!hero || hero.type !== "hero") {
    throw new Error("The demo content has no hero.");
  }

  const found = hero.props[locale]?.image;

  if (!found) {
    throw new Error("The demo content has no hero image.");
  }

  return found;
}

export function heroTitleOf(locale: Locale): string {
  const hero = demoContent.pages[0].blocks.find((candidate) => candidate.type === "hero");

  if (!hero || hero.type !== "hero") {
    throw new Error("The demo content has no hero.");
  }

  const title = hero.props[locale]?.title;

  if (!title) {
    throw new Error(`The hero has no ${locale} title.`);
  }

  return title;
}
