import { isValidObjectId } from "mongoose";
import { connectToDatabase } from "../../shared/db/mongoose";
import { ProjectModel } from "./model";
import { projectInputSchema, type Project, type ProjectInput } from "./types";

type LeanProject = {
  _id: { toString(): string };
  order: number;
};

function toProject(document: LeanProject): Project {
  return {
    ...projectInputSchema.parse(document),
    id: document._id.toString(),
    order: document.order,
  };
}

export async function listProjects(ownerId: string, siteId: string): Promise<Project[]> {
  await connectToDatabase();

  const documents = (await ProjectModel.find({ ownerId, siteId })
    .sort({ order: 1 })
    .lean()) as unknown as LeanProject[];

  return documents.map(toProject);
}

export async function createProject(
  ownerId: string,
  siteId: string,
  input: ProjectInput,
): Promise<Project> {
  await connectToDatabase();

  const last = (await ProjectModel.findOne({ ownerId, siteId })
    .sort({ order: -1 })
    .lean()) as LeanProject | null;
  const created = await ProjectModel.create({
    ...input,
    ownerId,
    siteId,
    order: last ? last.order + 1 : 0,
  });

  return toProject(created.toObject() as unknown as LeanProject);
}

const optionalKeys = ["category", "location", "year", "description"] as const;

// An optional field the owner cleared must be removed from the stored project.
function unsetKeys(input: ProjectInput): Record<string, ""> {
  return Object.fromEntries(
    optionalKeys.filter((key) => input[key] === undefined).map((key) => [key, ""]),
  );
}

function definedFields(input: ProjectInput): Record<string, unknown> {
  return Object.fromEntries(Object.entries(input).filter(([, value]) => value !== undefined));
}

export async function updateProject(
  ownerId: string,
  projectId: string,
  input: ProjectInput,
): Promise<Project | null> {
  if (!isValidObjectId(projectId)) {
    return null;
  }

  await connectToDatabase();

  const updated = (await ProjectModel.findOneAndUpdate(
    { _id: projectId, ownerId },
    { $set: definedFields(input), $unset: unsetKeys(input) },
    { returnDocument: "after" },
  ).lean()) as LeanProject | null;

  return updated ? toProject(updated) : null;
}

export async function deleteProject(ownerId: string, projectId: string): Promise<Project | null> {
  if (!isValidObjectId(projectId)) {
    return null;
  }

  await connectToDatabase();

  const deleted = (await ProjectModel.findOneAndDelete({
    _id: projectId,
    ownerId,
  }).lean()) as LeanProject | null;

  return deleted ? toProject(deleted) : null;
}

// ids must be exactly the owner's projects, in the new order.
export async function reorderProjects(
  ownerId: string,
  siteId: string,
  ids: string[],
): Promise<boolean> {
  await connectToDatabase();

  const current = await listProjects(ownerId, siteId);
  const sameProjects =
    ids.length === current.length &&
    new Set(ids).size === ids.length &&
    current.every((project) => ids.includes(project.id));

  if (!sameProjects) {
    return false;
  }

  await ProjectModel.bulkWrite(
    ids.map((id, order) => ({
      updateOne: { filter: { _id: id, ownerId, siteId }, update: { $set: { order } } },
    })),
  );

  return true;
}
