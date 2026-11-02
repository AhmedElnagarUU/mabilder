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

const heroPhoto: ImageSlot[] = [{ path: "image", aspectRatio: "4/5" }];
const heroWide: ImageSlot[] = [{ path: "image", aspectRatio: "16/9" }];
const split: ImageSlot[] = [{ path: "image", aspectRatio: "4/3" }];
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
    id: `atelier/${category}-${name}`,
    pack: "atelier",
    category,
    name,
    label,
    imageSlots,
    render: render as unknown as BlockRenderer<BlockType>,
  };
}

export const atelierPack: DesignPack = {
  id: "atelier",
  name: "Atelier",
  designs: [
    design("hero", "split", "Split with cut photo", heroPhoto, renderHero),
    design("hero", "centered", "Centered over photo", heroWide, renderHero),
    design("intro", "default", "Editorial", introPhotos, renderIntro),
    design("feature-split", "default", "Split", split, renderFeatureSplit),
    design("services", "columns", "Columns with icons", [], renderServices),
    design("services", "list", "Dash list", [], renderServices),
    design("process", "default", "Hairline steps", [], renderProcess),
    design("cta", "default", "Quiet line", [], renderCta),
    design("contact", "default", "Three columns", [], renderContact),
    design("stats", "row", "Hairline row", [], renderStats),
    design("stats", "aside", "Title beside numbers", [], renderStats),
    design("faq", "default", "Questions", [], renderFaq),
    design("projects", "columns", "Title column and cards", tallProjects, renderProjects),
    design("projects", "carousel", "Carousel with tags", wideProjects, renderProjects),
    design("testimonials", "band", "Dark quote band", [], renderTestimonials),
    design("testimonials", "rating", "Rating summary", [], renderTestimonials),
    design("marquee", "default", "Ticker", [], renderMarquee),
    design("values", "default", "Values", [], renderValues),
    design("clients", "default", "Clients", [], renderClients),
    design("awards", "default", "Awards", [], renderAwards),
    design("timeline", "default", "Timeline", [], renderTimeline),
    design("team", "default", "Team", teamPortraits, renderTeam),
    design("location", "default", "Location", [], renderLocation),
  ],
};
