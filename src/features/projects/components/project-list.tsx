"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/shared/i18n/navigation";
import { buttonClass } from "@/shared/ui/button";
import { Icon } from "@/shared/ui/icon";
import type { Project, ProjectsSite } from "../types";
import { ProjectForm } from "./project-form";
import { sendProjectRequest } from "./project-request";

type Editing = "new" | string | null;

function titleOf(project: Project, site: ProjectsSite): string {
  return project.title[site.defaultLocale] ?? project.title.en ?? project.title.ar ?? "";
}

function toInput(project: Project, showOnHome: boolean) {
  return {
    title: project.title,
    category: project.category,
    location: project.location,
    year: project.year,
    description: project.description,
    photos: project.photos,
    showOnHome,
  };
}

export function ProjectList({
  site,
  projects,
}: {
  site: ProjectsSite;
  projects: Project[];
}) {
  const t = useTranslations("projects");
  const errors = useTranslations("projects.errors");
  const router = useRouter();
  const [editing, setEditing] = useState<Editing>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function run(request: () => Promise<string | null>): Promise<boolean> {
    setBusy(true);
    setError("");

    const failure = await request();

    setBusy(false);

    if (failure) {
      setError(errors(failure));
      return false;
    }

    router.refresh();
    return true;
  }

  async function handleMove(index: number, step: -1 | 1): Promise<void> {
    const ids = projects.map((project) => project.id);
    [ids[index], ids[index + step]] = [ids[index + step], ids[index]];
    await run(() => sendProjectRequest("/api/projects/order", "PUT", { ids }));
  }

  async function handleToggleHome(project: Project): Promise<void> {
    await run(() =>
      sendProjectRequest(`/api/projects/${project.id}`, "PUT", toInput(project, !project.showOnHome)),
    );
  }

  async function handleDelete(project: Project): Promise<void> {
    if (await run(() => sendProjectRequest(`/api/projects/${project.id}`, "DELETE"))) {
      setDeletingId(null);
    }
  }

  function handleSaved(): void {
    setEditing(null);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      {error ? <p className="text-sm text-danger">{error}</p> : null}

      {projects.length === 0 && editing !== "new" ? (
        <p className="rounded-panel border border-line-soft px-5 py-8 text-center text-base text-muted">
          {t("empty")}
        </p>
      ) : null}

      <ul aria-label={t("list.aria")} data-tour="projects-list" className="space-y-3">
        {projects.map((project, index) =>
          editing === project.id ? (
            <li key={project.id}>
              <ProjectForm
                site={site}
                project={project}
                onSaved={handleSaved}
                onCancel={() => setEditing(null)}
              />
            </li>
          ) : (
            <li
              key={project.id}
              className="rounded-panel border border-line-soft bg-[linear-gradient(160deg,rgba(255,255,255,0.036),rgba(255,255,255,0.01))] p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="truncate text-base font-medium text-[#dededb]">
                    {titleOf(project, site)}
                  </h3>
                  <p className="mt-1 text-sm text-muted">
                    {t("list.photos", { count: project.photos.length })}
                  </p>
                  {project.photos.length === 0 ? (
                    <p className="mt-1 text-sm text-warn">{t("list.noPhotos")}</p>
                  ) : null}
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  <button
                    type="button"
                    disabled={busy || index === 0}
                    onClick={() => void handleMove(index, -1)}
                    aria-label={t("list.moveUp")}
                    title={t("list.moveUp")}
                    className={buttonClass("ghost", "sm", "w-9 px-0")}
                  >
                    <Icon name="chevron" className="h-4 w-4 rotate-180" />
                  </button>
                  <button
                    type="button"
                    disabled={busy || index === projects.length - 1}
                    onClick={() => void handleMove(index, 1)}
                    aria-label={t("list.moveDown")}
                    title={t("list.moveDown")}
                    className={buttonClass("ghost", "sm", "w-9 px-0")}
                  >
                    <Icon name="chevron" className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-line-soft pt-3">
                <label
                  data-tour={index === 0 ? "projects-home" : undefined}
                  className="flex items-center gap-2.5 text-sm text-ink"
                >
                  <input
                    type="checkbox"
                    checked={project.showOnHome}
                    disabled={busy}
                    onChange={() => void handleToggleHome(project)}
                    className="h-4 w-4 accent-[#5eead4]"
                  />
                  {t("list.showOnHome")}
                </label>

                <span className="ms-auto flex flex-wrap items-center gap-2">
                  {deletingId === project.id ? (
                    <>
                      <span className="text-sm text-muted">{t("list.deleteQuestion")}</span>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => void handleDelete(project)}
                        className={buttonClass("danger", "sm")}
                      >
                        {busy ? t("list.deleting") : t("list.deleteConfirm")}
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => setDeletingId(null)}
                        className={buttonClass("ghost", "sm")}
                      >
                        {t("list.cancel")}
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => setEditing(project.id)}
                        className={buttonClass("secondary", "sm", "gap-1.5")}
                      >
                        <Icon name="pen" className="h-3.5 w-3.5" />
                        {t("list.edit")}
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => setDeletingId(project.id)}
                        className={buttonClass("danger", "sm", "gap-1.5")}
                      >
                        <Icon name="trash" className="h-3.5 w-3.5" />
                        {t("list.delete")}
                      </button>
                    </>
                  )}
                </span>
              </div>
            </li>
          ),
        )}
      </ul>

      {editing === "new" ? (
        <ProjectForm site={site} onSaved={handleSaved} onCancel={() => setEditing(null)} />
      ) : (
        <button
          type="button"
          disabled={busy}
          onClick={() => setEditing("new")}
          data-tour="projects-add"
          className={buttonClass("primary", "md", "gap-2")}
        >
          <Icon name="plus" className="h-4 w-4" />
          {t("add")}
        </button>
      )}
    </div>
  );
}
