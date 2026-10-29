import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { buildSiteContent } from "../../src/features/site-creation/build-content";
import { businessBriefSchema } from "../../src/features/site-creation/types";
import { disconnectFromDatabase } from "../../src/shared/db/mongoose";
import { deleteAllSites, request, signUp } from "./client";

const brief = {
  businessName: "Projects Studio",
  industry: "Interior design",
  description: "A small interior design studio.",
  locale: "en",
};

type ApiProject = {
  id: string;
  order: number;
  title: { en?: string };
  showOnHome: boolean;
  photos: { url: string }[];
};

let cookieA = "";
let cookieB = "";
let siteIdA = "";

function projectBody(title: string, overrides: Record<string, unknown> = {}) {
  return {
    title: { en: title },
    category: { en: "Residential" },
    year: "2024",
    photos: [{ url: `https://example.com/${encodeURIComponent(title)}.jpg`, alt: title }],
    showOnHome: true,
    ...overrides,
  };
}

async function createSiteFor(cookie: string): Promise<string> {
  const created = await request("/api/sites", { method: "POST", cookie, body: brief });
  assert.equal(created.status, 201);
  const siteId = ((await created.json()) as { site: { id: string } }).site.id;

  const saved = await request(`/api/sites/${siteId}/content`, {
    method: "PUT",
    cookie,
    body: buildSiteContent(businessBriefSchema.parse(brief)),
  });
  assert.equal(saved.status, 200, await saved.clone().text());

  return siteId;
}

async function addProject(cookie: string, title: string, overrides = {}): Promise<ApiProject> {
  const response = await request("/api/projects", {
    method: "POST",
    cookie,
    body: projectBody(title, overrides),
  });
  assert.equal(response.status, 201, await response.clone().text());
  return ((await response.json()) as { project: ApiProject }).project;
}

async function listProjects(cookie: string): Promise<ApiProject[]> {
  const response = await request("/api/projects", { cookie });
  assert.equal(response.status, 200);
  return ((await response.json()) as { projects: ApiProject[] }).projects;
}

async function readPage(page: string): Promise<string> {
  const response = await request(`/preview/${siteIdA}/${page}`, { cookie: cookieA });
  assert.equal(response.status, 200, `${page} is not previewable`);
  return response.text();
}

before(async () => {
  cookieA = await signUp("P1 Owner A");
  cookieB = await signUp("P1 Owner B");
  siteIdA = await createSiteFor(cookieA);
  await createSiteFor(cookieB);
});

after(async () => {
  await deleteAllSites(cookieA);
  await deleteAllSites(cookieB);
  await disconnectFromDatabase();
});

test("every projects route answers 401 when signed out", async () => {
  const calls = [
    request("/api/projects"),
    request("/api/projects", { method: "POST", body: projectBody("Nope") }),
    request("/api/projects/000000000000000000000000", { method: "PUT", body: projectBody("Nope") }),
    request("/api/projects/000000000000000000000000", { method: "DELETE" }),
    request("/api/projects/order", { method: "PUT", body: { ids: [] } }),
  ];

  for (const response of await Promise.all(calls)) {
    assert.equal(response.status, 401);
  }
});

test("a new project is saved, listed and shown on the website", async () => {
  const created = await addProject(cookieA, "Harbour House");

  assert.equal(created.title.en, "Harbour House");
  assert.deepEqual(
    (await listProjects(cookieA)).map((project) => project.title.en),
    ["Harbour House"],
  );

  assert.ok((await readPage("index.html")).includes("Harbour House"));
  assert.ok((await readPage("projects.html")).includes("Harbour House"));
});

test("an edited project is saved and the website shows the new title", async () => {
  const [project] = await listProjects(cookieA);

  const updated = await request(`/api/projects/${project.id}`, {
    method: "PUT",
    cookie: cookieA,
    body: projectBody("Harbour Villa"),
  });
  assert.equal(updated.status, 200);

  assert.equal((await listProjects(cookieA))[0].title.en, "Harbour Villa");
  const html = await readPage("index.html");
  assert.ok(html.includes("Harbour Villa"));
  assert.ok(!html.includes("Harbour House"));
});

test("projects can be reordered and the order is kept", async () => {
  await addProject(cookieA, "Second Tower");
  await addProject(cookieA, "Third Tower");
  const [first, second, third] = await listProjects(cookieA);

  const reordered = await request("/api/projects/order", {
    method: "PUT",
    cookie: cookieA,
    body: { ids: [third.id, first.id, second.id] },
  });
  assert.equal(reordered.status, 200);

  assert.deepEqual(
    (await listProjects(cookieA)).map((project) => project.id),
    [third.id, first.id, second.id],
  );

  const html = await readPage("projects.html");
  assert.ok(html.indexOf("Third Tower") < html.indexOf("Harbour Villa"));
  assert.ok(html.indexOf("Harbour Villa") < html.indexOf("Second Tower"));
});

test("a reorder that misses a project is rejected", async () => {
  const [first] = await listProjects(cookieA);
  const response = await request("/api/projects/order", {
    method: "PUT",
    cookie: cookieA,
    body: { ids: [first.id] },
  });

  assert.equal(response.status, 400);
});

test("turning off Show on home page removes the project from the home page only", async () => {
  const hidden = await addProject(cookieA, "Quiet Annex", { showOnHome: false });

  assert.equal(hidden.showOnHome, false);
  assert.ok(!(await readPage("index.html")).includes("Quiet Annex"));
  assert.ok((await readPage("projects.html")).includes("Quiet Annex"));
});

test("bad photo links and too many photos are rejected", async () => {
  const badLink = await request("/api/projects", {
    method: "POST",
    cookie: cookieA,
    body: projectBody("Bad Link", { photos: [{ url: "javascript:alert(1)" }] }),
  });
  assert.equal(badLink.status, 400);

  const photos = Array.from({ length: 11 }, (_unused, index) => ({
    url: `https://example.com/${index}.jpg`,
  }));
  const tooMany = await request("/api/projects", {
    method: "POST",
    cookie: cookieA,
    body: projectBody("Too Many", { photos }),
  });
  assert.equal(tooMany.status, 400);

  const noTitle = await request("/api/projects", {
    method: "POST",
    cookie: cookieA,
    body: projectBody("", { title: { en: "" } }),
  });
  assert.equal(noTitle.status, 400);
});

test("user B cannot see, change, delete or reorder user A's projects", async () => {
  const [mine] = await listProjects(cookieA);
  const before = await listProjects(cookieA);

  assert.deepEqual(await listProjects(cookieB), []);

  const update = await request(`/api/projects/${mine.id}`, {
    method: "PUT",
    cookie: cookieB,
    body: projectBody("Stolen"),
  });
  assert.equal(update.status, 404);

  const remove = await request(`/api/projects/${mine.id}`, { method: "DELETE", cookie: cookieB });
  assert.equal(remove.status, 404);

  const reorder = await request("/api/projects/order", {
    method: "PUT",
    cookie: cookieB,
    body: { ids: before.map((project) => project.id) },
  });
  assert.equal(reorder.status, 400);

  assert.deepEqual(await listProjects(cookieA), before);
});

test("deleting projects removes them from the website and the last one removes the Projects page", async () => {
  for (const project of await listProjects(cookieA)) {
    const response = await request(`/api/projects/${project.id}`, {
      method: "DELETE",
      cookie: cookieA,
    });
    assert.equal(response.status, 200);
  }

  assert.deepEqual(await listProjects(cookieA), []);
  assert.ok(!(await readPage("index.html")).includes("Harbour Villa"));

  const projectsPage = await request(`/preview/${siteIdA}/projects.html`, { cookie: cookieA });
  assert.equal(projectsPage.status, 404);
});
