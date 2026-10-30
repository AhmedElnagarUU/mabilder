import { isValidObjectId } from "mongoose";
import { connectToDatabase } from "../../shared/db/mongoose";
import { CreditUseModel } from "./model";

export type WindowUsage = {
  used: number;
  oldestAt: Date | null;
};

export async function readWindowUsage(ownerId: string, since: Date): Promise<WindowUsage> {
  await connectToDatabase();

  const uses = await CreditUseModel.find({ ownerId, createdAt: { $gt: since } })
    .select({ cost: 1, createdAt: 1 })
    .lean();

  return {
    used: uses.reduce((sum, use) => sum + use.cost, 0),
    oldestAt: uses.reduce<Date | null>(
      (oldest, use) => (oldest === null || use.createdAt < oldest ? use.createdAt : oldest),
      null,
    ),
  };
}

export async function insertCreditUse(use: {
  ownerId: string;
  cost: number;
  reason: string;
  siteId?: string;
}): Promise<string> {
  await connectToDatabase();

  const created = await CreditUseModel.create(use);
  return created._id.toString();
}

export async function deleteCreditUse(useId: string): Promise<void> {
  if (!isValidObjectId(useId)) {
    return;
  }

  await connectToDatabase();
  await CreditUseModel.deleteOne({ _id: useId });
}
