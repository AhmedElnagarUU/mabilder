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

const wideHero: ImageSlot[] = [{ path: "image", aspectRatio: "16/9" }];
const tallHero: ImageSlot[] = [{ path: "image", aspectRatio: "3/4" }];
const splitImage: ImageSlot[] = [{ path: "image", aspectRatio: "4/3" }];
const servicePanels: ImageSlot[] = [{ path: "items[].image", aspectRatio: "3/4" }];
const gridProjects: ImageSlot[] = [{ path: "items[].image", aspectRatio: "4/3" }];
const rowProjects: ImageSlot[] = [{ path: "items[].image", aspectRatio: "1/1" }];
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
    id: `arhitect/${category}-${name}`,
    pack: "arhitect",
    category,
    name,
    label,
    imageSlots,
    render: render as unknown as BlockRenderer<BlockType>,
  };
}

export const arhitectPack: DesignPack = {
  id: "arhitect",
  name: "Arhitect",
  designs: [
    design("hero", "full", "Full-bleed", wideHero, renderHero),
    design("hero", "split", "Split black-white", tallHero, renderHero),
    design("intro", "invert", "White band", introPhotos, renderIntro),
    design("feature-split", "default", "Split", splitImage, renderFeatureSplit),
    design("services", "panels", "Expanding panels", servicePanels, renderServices),
    design("services", "rows", "Numbered rows", [], renderServices),
    design("process", "rows", "Table rows", [], renderProcess),
    design("cta", "band", "Sand bar", [], renderCta),
    design("contact", "split", "Split black-white", [], renderContact),
    design("stats", "divided", "Divided numbers", [], renderStats),
    design("stats", "giant", "Giant number", [], renderStats),
    design("faq", "default", "Questions", [], renderFaq),
    design("projects", "grid", "Big grid", gridProjects, renderProjects),
    design("projects", "rows", "List rows", rowProjects, renderProjects),
    design("testimonials", "invert", "White band quote", [], renderTestimonials),
    design("testimonials", "list", "Quote list", [], renderTestimonials),
    design("marquee", "default", "Ticker", [], renderMarquee),
    design("values", "columns", "Divided columns", [], renderValues),
    design("clients", "default", "Clients", [], renderClients),
    design("awards", "rows", "Awards", [], renderAwards),
    design("timeline", "rows", "Timeline", [], renderTimeline),
    design("team", "grid", "Team grid", teamPortraits, renderTeam),
    design("location", "box", "Location", [], renderLocation),
  ],
};
