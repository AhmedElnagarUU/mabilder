export type PageSection = {
  heading: string;
  body: string;
  items?: string[];
};

export type StaticPage = {
  slug: string;
  navLabel: string;
  title: string;
  description: string;
  intro: string;
  sections: PageSection[];
};
