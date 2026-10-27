import type { SiteContent } from "../content/types";
import { renderAboutPage } from "./about";
import { renderContactPage } from "./contact";
import { renderHomePage } from "./home";
import { renderProfilePage } from "./profile";
import { renderServicesPage } from "./services";
import { renderWorkPage } from "./work";

export type PageTemplate = {
  fileName: string;
  render: (content: SiteContent) => string;
};

export const pageTemplates: PageTemplate[] = [
  { fileName: "index.html", render: renderHomePage },
  { fileName: "about.html", render: renderAboutPage },
  { fileName: "services.html", render: renderServicesPage },
  { fileName: "our-work.html", render: renderWorkPage },
  { fileName: "profile.html", render: renderProfilePage },
  { fileName: "contact.html", render: renderContactPage },
];
