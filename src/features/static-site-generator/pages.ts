import type { StaticPage } from "./types.js";

export const siteName = "Demo Site";

export const pages: StaticPage[] = [
  {
    slug: "index",
    navLabel: "Home",
    title: "A simple static site",
    description:
      "A five-page demo site generated with React server-side rendering.",
    intro:
      "This site is generated from React components and saved as plain HTML and CSS. It does not need React or Next.js to run.",
    sections: [
      {
        heading: "What is included",
        body: "Five linked pages share one stylesheet and a responsive layout.",
        items: [
          "A home page with a short introduction",
          "About, services, projects, and contact pages",
          "One shared CSS file for every page",
        ],
      },
      {
        heading: "How it is built",
        body: "React components are rendered to static markup ahead of time. The result is ordinary HTML that can be hosted anywhere.",
      },
      {
        heading: "Where to go next",
        body: "Use the navigation above to visit each page. The site also works when opened directly from disk.",
      },
    ],
  },
  {
    slug: "about",
    navLabel: "About",
    title: "About us",
    description: "A short introduction to the team behind this demo site.",
    intro:
      "We are a small studio focused on clear, useful websites. This page shows how a simple story can fit into the shared layout.",
    sections: [
      {
        heading: "Our story",
        body: "The studio started with a simple idea: a website should be easy to read, quick to load, and simple to maintain.",
      },
      {
        heading: "What we value",
        body: "These principles guide every project we take on.",
        items: [
          "Clear communication",
          "Practical design",
          "Work that lasts",
        ],
      },
      {
        heading: "How we work",
        body: "Every project starts with a short conversation, followed by a simple plan and regular updates.",
      },
    ],
  },
  {
    slug: "services",
    navLabel: "Services",
    title: "Our services",
    description: "The three services offered by this demo studio.",
    intro:
      "A focused set of services keeps the work clear. Each one is available on its own or as part of a full project.",
    sections: [
      {
        heading: "Website planning",
        body: "We define the pages, content, and goals before design begins.",
      },
      {
        heading: "Design and build",
        body: "We create a responsive layout and turn it into clean, accessible pages.",
      },
      {
        heading: "Launch support",
        body: "We help with hosting, final checks, and the handover of the finished site.",
      },
    ],
  },
  {
    slug: "projects",
    navLabel: "Projects",
    title: "Selected projects",
    description: "A few example projects from this demo studio.",
    intro:
      "These short examples show the range of the studio. Each project starts with a clear goal and ends with a site that is easy to use.",
    sections: [
      {
        heading: "Harbor Coffee",
        body: "A five-page site for a neighborhood coffee shop, with menus and opening hours.",
      },
      {
        heading: "Field Notes",
        body: "A simple journal for a small research team, focused on readable articles.",
      },
      {
        heading: "Cedar House",
        body: "A compact site for a guest house, built around location and booking details.",
      },
    ],
  },
  {
    slug: "contact",
    navLabel: "Contact",
    title: "Contact",
    description: "Contact details for the demo studio.",
    intro:
      "Have a question or a project in mind? Get in touch. This page is static, so the details below are examples only.",
    sections: [
      {
        heading: "Email",
        body: "hello@example.com",
      },
      {
        heading: "Phone",
        body: "+1 (555) 010-2030",
      },
      {
        heading: "Hours",
        body: "Monday to Friday, 9:00 to 17:00",
      },
      {
        heading: "Location",
        body: "123 Example Street, Demo City",
      },
    ],
  },
];
