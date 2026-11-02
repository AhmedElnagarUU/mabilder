import type { TemplateChoice } from "../site-editor/template-choice";
import type { Locale } from "../static-site-generator/locale";
import { listTemplates } from "../static-site-generator/site-templates/registry";
import { TemplateCover } from "./components/template-cover";
import { findPreviewPage } from "./preview";

// The chooser cards (name, mood, gallery cover) in the visitor's language, for the pick page and
// the editor's "Change template" dialog. The cover is the template's demo home with its own photos.
export function buildTemplateChoices(locale: Locale): TemplateChoice[] {
  return listTemplates().map((template) => ({
    id: template.id,
    name: template.name,
    mood: template.mood[locale],
    cover: (
      <TemplateCover
        html={findPreviewPage(template.id, locale, undefined)?.html ?? ""}
        title={template.name}
      />
    ),
  }));
}
