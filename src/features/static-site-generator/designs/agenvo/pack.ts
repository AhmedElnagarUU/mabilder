import type { BlockType } from "../../blocks/catalog";
import type { BlockRenderer } from "../../themes/types";
import { renderAwards } from "../../themes/agenvo/blocks/awards";
import { renderClients } from "../../themes/agenvo/blocks/clients";
import { renderContact } from "../../themes/agenvo/blocks/contact";
import { renderCta } from "../../themes/agenvo/blocks/cta";
import { renderFaq } from "../../themes/agenvo/blocks/faq";
import { renderFeatureSplit } from "../../themes/agenvo/blocks/feature-split";
import { renderHero } from "../../themes/agenvo/blocks/hero";
import { renderIntro } from "../../themes/agenvo/blocks/intro";
import { renderLocation } from "../../themes/agenvo/blocks/location";
import { renderMarquee } from "../../themes/agenvo/blocks/marquee";
import { renderProcess } from "../../themes/agenvo/blocks/process";
import { renderProjects } from "../../themes/agenvo/blocks/projects";
import { renderServices } from "../../themes/agenvo/blocks/services";
import { renderStats } from "../../themes/agenvo/blocks/stats";
import { renderTeam } from "../../themes/agenvo/blocks/team";
import { renderTestimonials } from "../../themes/agenvo/blocks/testimonials";
import { renderTimeline } from "../../themes/agenvo/blocks/timeline";
import { renderValues } from "../../themes/agenvo/blocks/values";
import type { BlockDesign, DesignPack, ImageSlot } from "../types";

const wide: ImageSlot[] = [{ path: "image", aspectRatio: "16/9" }];
const split: ImageSlot[] = [{ path: "image", aspectRatio: "3/2" }];
const projectCards: ImageSlot[] = [{ path: "items[].image", aspectRatio: "4/3" }];
const teamPortraits: ImageSlot[] = [{ path: "items[].image", aspectRatio: "4/5" }];
const introCollage: ImageSlot[] = [{ path: "images", aspectRatio: "4/3" }];
const introPortrait: ImageSlot[] = [{ path: "images", aspectRatio: "4/5" }];

function design<T extends BlockType>(
  category: T,
  name: string,
  label: string,
  imageSlots: readonly ImageSlot[],
  render: BlockRenderer<T>,
): BlockDesign {
  return {
    id: `agenvo/${category}-${name}`,
    pack: "agenvo",
    category,
    name,
    label,
    imageSlots,
    render: render as unknown as BlockRenderer<BlockType>,
  };
}

export const agenvoPack: DesignPack = {
  id: "agenvo",
  name: "Agenvo",
  designs: [
    design("hero", "full-image", "Full image", wide, renderHero),
    design("hero", "page", "Page header", wide, renderHero),
    design("hero", "text-only", "Text only", [], renderHero),
    design("marquee", "default", "Marquee", [], renderMarquee),
    design("intro", "images", "Images", introCollage, renderIntro),
    design("intro", "quote", "Quote", introPortrait, renderIntro),
    design("feature-split", "image-right", "Image right", split, renderFeatureSplit),
    design("feature-split", "image-left", "Image left", split, renderFeatureSplit),
    design("services", "columns", "Columns", [], renderServices),
    design("services", "list", "List", [], renderServices),
    design("values", "default", "Values", [], renderValues),
    design("process", "default", "Process", [], renderProcess),
    design("faq", "default", "FAQ", [], renderFaq),
    design("cta", "dark", "Dark panel", [], renderCta),
    design("cta", "light", "Light panel", [], renderCta),
    design("contact", "split", "Split", [], renderContact),
    design("contact", "form-only", "Form only", [], renderContact),
    design("stats", "dark", "Band", [], renderStats),
    design("stats", "light", "Split", [], renderStats),
    design("clients", "default", "Clients", [], renderClients),
    design("awards", "default", "Awards", [], renderAwards),
    design("timeline", "default", "Timeline", [], renderTimeline),
    design("projects", "featured", "Featured", projectCards, renderProjects),
    design("projects", "grid", "Grid", projectCards, renderProjects),
    design("team", "default", "Team", teamPortraits, renderTeam),
    design("testimonials", "default", "Testimonials", [], renderTestimonials),
    design("location", "default", "Location", [], renderLocation),
  ],
};
