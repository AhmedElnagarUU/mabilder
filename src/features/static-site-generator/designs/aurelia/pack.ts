import type { BlockType } from "../../blocks/catalog";
import type { BlockRenderer } from "../../themes/types";
import type { BlockDesign, DesignPack, ImageSlot } from "../types";
import { renderContact } from "./contact";
import { renderCta } from "./cta";
import { renderFaq } from "./faq";
import { renderFeatureSplit } from "./feature-split";
import { renderHero } from "./hero";
import { renderIntro } from "./intro";
import { renderProcess } from "./process";
import { renderProjects } from "./projects";
import { renderServices } from "./services";
import { renderStats } from "./stats";
import {
  renderAwards,
  renderClients,
  renderLocation,
  renderMarquee,
  renderTeam,
  renderTimeline,
  renderValues,
} from "./supporting";
import { renderTestimonials } from "./testimonials";

const wide: ImageSlot[] = [{ path: "image", aspectRatio: "16/9" }];
const split: ImageSlot[] = [{ path: "image", aspectRatio: "4/3" }];
const serviceCards: ImageSlot[] = [{ path: "items[].image", aspectRatio: "4/5" }];
const tallProjects: ImageSlot[] = [{ path: "items[].image", aspectRatio: "4/5" }];
const wideProjects: ImageSlot[] = [{ path: "items[].image", aspectRatio: "3/2" }];
const introPhotos: ImageSlot[] = [{ path: "images", aspectRatio: "4/5" }];
const teamPortraits: ImageSlot[] = [{ path: "items[].image", aspectRatio: "4/5" }];

function design<T extends BlockType>(
  category: T,
  name: string,
  label: string,
  imageSlots: readonly ImageSlot[],
  render: BlockRenderer<T>,
): BlockDesign {
  return {
    id: `aurelia/${category}-${name}`,
    pack: "aurelia",
    category,
    name,
    label,
    imageSlots,
    render: render as unknown as BlockRenderer<BlockType>,
  };
}

export const aureliaPack: DesignPack = {
  id: "aurelia",
  name: "Aurelia",
  designs: [
    design("hero", "centered", "Centered", wide, renderHero),
    design("hero", "page", "Page header", wide, renderHero),
    design("intro", "default", "Editorial", introPhotos, renderIntro),
    design("feature-split", "default", "Split", split, renderFeatureSplit),
    design("services", "columns", "Columns", [], renderServices),
    design("services", "circles", "Circle icons", [], renderServices),
    design("services", "panels", "Photo panels", serviceCards, renderServices),
    design("process", "default", "Steps", [], renderProcess),
    design("cta", "default", "Panel", [], renderCta),
    design("contact", "default", "Split", [], renderContact),
    design("stats", "band", "Number band", [], renderStats),
    design("stats", "big-number", "Big number", [], renderStats),
    design("faq", "default", "Questions", [], renderFaq),
    design("projects", "tall", "Tall cards", tallProjects, renderProjects),
    design("projects", "specs", "Cards with facts", wideProjects, renderProjects),
    design("testimonials", "quote", "Quote", [], renderTestimonials),
    design("marquee", "default", "Ticker", [], renderMarquee),
    design("values", "default", "Values", [], renderValues),
    design("clients", "default", "Clients", [], renderClients),
    design("awards", "default", "Awards", [], renderAwards),
    design("timeline", "default", "Timeline", [], renderTimeline),
    design("team", "default", "Team", teamPortraits, renderTeam),
    design("location", "default", "Location", [], renderLocation),
  ],
};
