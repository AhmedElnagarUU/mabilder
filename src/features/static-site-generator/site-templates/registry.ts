import type { BlockType } from "../blocks/catalog";
import { getDefaultDesign, getDesign } from "../designs/registry";
import { classicTemplate } from "./agenvo/template";
import { arhitectTemplate } from "./arhitect/template";
import { aureliaTemplate } from "./aurelia/template";
import type { SiteTemplate } from "./types";

// The base template: unknown ids render as it, and it supplies the design of any section a template lacks.
export const baseTemplate: SiteTemplate = classicTemplate;

const templates: SiteTemplate[] = [classicTemplate, aureliaTemplate, arhitectTemplate];

export function listTemplates(): SiteTemplate[] {
  return [...templates];
}

export function isTemplateId(id: string): boolean {
  return templates.some((template) => template.id === id);
}

export function getTemplate(id: string): SiteTemplate {
  return templates.find((template) => template.id === id) ?? baseTemplate;
}

// The template's own design for the section type, else the base design.
export function getTemplateDesign(template: SiteTemplate, type: BlockType): string {
  const own = template.designs[type];

  if (own !== undefined && getDesign(own)?.category === type) {
    return own;
  }

  return baseTemplate.designs[type] ?? getDefaultDesign(type).id;
}
