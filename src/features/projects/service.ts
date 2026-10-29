import { z } from "zod";
import { recordActivity } from "../activity/service";
import type { ActivityType } from "../activity/types";
import { refreshFactBlocks } from "../site-creation/refresh-facts";
import { getSite, listSites, saveContent } from "../site-creation/service";
import type { SiteRecord } from "../site-creation/types";
import { toFactProjects } from "./facts";
import {
  createProject as createProjectRecord,
  deleteProject as deleteProjectRecord,
  listProjects as listProjectRecords,
  reorderProjects as reorderProjectRecords,
  updateProject as updateProjectRecord,
} from "./repository";
import {
  projectInputSchema,
  projectOrderSchema,
  type Project,
  type ProjectInput,
  type ProjectsSite,
} from "./types";

export type ProjectIssue = {
  path: string;
  message: string;
};

type InvalidResult = { ok: false; code: "invalid_request"; errors: ProjectIssue[] };

export type ProjectResult<Value> =
  | { ok: true; value: Value }
  | { ok: false; code: "site_not_found" | "project_not_found" }
  | InvalidResult;

export type ProjectsOverview = {
  site: ProjectsSite;
  projects: Project[];
};

const siteNotFound = { ok: false, code: "site_not_found" } as const;
const projectNotFound = { ok: false, code: "project_not_found" } as const;

// One website per account, so the owner's site is their first (only) site.
async function findOwnerSite(ownerId: string): Promise<SiteRecord | null> {
  const [summary] = await listSites(ownerId);
  return summary ? getSite(ownerId, summary.id) : null;
}

function toProjectsSite(site: SiteRecord): ProjectsSite {
  const locale = site.brief.locale ?? "en";

  return {
    siteId: site.id,
    locales: site.content?.locales ?? [locale],
    defaultLocale: site.content?.defaultLocale ?? locale,
  };
}

function toInvalid(issues: { path: string; message: string }[]): InvalidResult {
  return { ok: false, code: "invalid_request", errors: issues };
}

function toIssues(error: z.ZodError): ProjectIssue[] {
  return error.issues.map((issue) => ({
    path: issue.path.join(".") || "project",
    message: issue.message,
  }));
}

// The title is required in the site's first language; the second language is optional.
function parseInput(
  site: ProjectsSite,
  body: unknown,
): { ok: true; input: ProjectInput } | InvalidResult {
  const parsed = projectInputSchema.safeParse(body);

  if (!parsed.success) {
    return toInvalid(toIssues(parsed.error));
  }

  if (!parsed.data.title[site.defaultLocale]) {
    return toInvalid([{ path: `title.${site.defaultLocale}`, message: "The title is required." }]);
  }

  return { ok: true, input: parsed.data };
}

// Facts are rebuilt in code and the site is rendered again. No AI call.
async function publishProjects(ownerId: string, site: SiteRecord): Promise<void> {
  if (!site.content) {
    return;
  }

  const { locales, defaultLocale } = toProjectsSite(site);
  const projects = await listProjectRecords(ownerId, site.id);
  const content = refreshFactBlocks(
    site.content,
    site.brief,
    toFactProjects(projects, locales, defaultLocale),
  );
  const saved = await saveContent(ownerId, site.id, content);

  if (!saved?.ok) {
    throw new Error("Failed to update the website with the projects.");
  }
}

async function recordProjectActivity(
  ownerId: string,
  siteId: string,
  type: ActivityType,
): Promise<void> {
  await recordActivity({ userId: ownerId, actorId: ownerId, type, siteId });
}

export async function getProjectsOverview(ownerId: string): Promise<ProjectsOverview | null> {
  const site = await findOwnerSite(ownerId);

  if (!site) {
    return null;
  }

  return { site: toProjectsSite(site), projects: await listProjectRecords(ownerId, site.id) };
}

export async function createProject(
  ownerId: string,
  body: unknown,
): Promise<ProjectResult<Project>> {
  const site = await findOwnerSite(ownerId);

  if (!site) {
    return siteNotFound;
  }

  const parsed = parseInput(toProjectsSite(site), body);

  if (!parsed.ok) {
    return parsed;
  }

  const project = await createProjectRecord(ownerId, site.id, parsed.input);
  await publishProjects(ownerId, site);
  await recordProjectActivity(ownerId, site.id, "project_added");

  return { ok: true, value: project };
}

export async function updateProject(
  ownerId: string,
  projectId: string,
  body: unknown,
): Promise<ProjectResult<Project>> {
  const site = await findOwnerSite(ownerId);

  if (!site) {
    return siteNotFound;
  }

  const parsed = parseInput(toProjectsSite(site), body);

  if (!parsed.ok) {
    return parsed;
  }

  const project = await updateProjectRecord(ownerId, projectId, parsed.input);

  if (!project) {
    return projectNotFound;
  }

  await publishProjects(ownerId, site);
  await recordProjectActivity(ownerId, site.id, "project_updated");

  return { ok: true, value: project };
}

export async function deleteProject(
  ownerId: string,
  projectId: string,
): Promise<ProjectResult<true>> {
  const site = await findOwnerSite(ownerId);

  if (!site) {
    return siteNotFound;
  }

  if (!(await deleteProjectRecord(ownerId, projectId))) {
    return projectNotFound;
  }

  await publishProjects(ownerId, site);
  await recordProjectActivity(ownerId, site.id, "project_deleted");

  return { ok: true, value: true };
}

export async function reorderProjects(
  ownerId: string,
  body: unknown,
): Promise<ProjectResult<true>> {
  const site = await findOwnerSite(ownerId);

  if (!site) {
    return siteNotFound;
  }

  const parsed = projectOrderSchema.safeParse(body);

  if (!parsed.success) {
    return toInvalid(toIssues(parsed.error));
  }

  if (!(await reorderProjectRecords(ownerId, site.id, parsed.data.ids))) {
    return toInvalid([{ path: "ids", message: "ids must list every project once." }]);
  }

  await publishProjects(ownerId, site);

  return { ok: true, value: true };
}
