const MIN_SECRET_LENGTH = 16;

export type AdminConfig = {
  email: string;
  password: string;
  secret: string;
};

export const ADMIN_LOGIN_DISABLED_MESSAGE =
  "Admin login is disabled. Set ADMIN_EMAIL, ADMIN_PASSWORD and ADMIN_SESSION_SECRET (at least 16 characters) in the environment.";

// No default credentials: a missing or weak setting disables the admin login.
export function readAdminConfig(): AdminConfig | null {
  const email = process.env.ADMIN_EMAIL?.trim();
  const password = process.env.ADMIN_PASSWORD;
  const secret = process.env.ADMIN_SESSION_SECRET;

  if (!email || !password || !secret || secret.length < MIN_SECRET_LENGTH) {
    return null;
  }

  return { email, password, secret };
}
