import { connectToDatabase } from "../../shared/db/mongoose";

export const ACCOUNT_INACTIVE_CODE = "account_inactive";

// The `user` collection belongs to better-auth, so it is read without a mongoose model.
export async function isEmailInactive(email: string): Promise<boolean> {
  const mongo = await connectToDatabase();
  const user = await mongo.connection
    .collection("user")
    .findOne({ email: email.trim().toLowerCase() }, { projection: { inactive: 1 } });

  return user?.inactive === true;
}
