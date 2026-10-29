export type AuthErrorKey =
  | "invalid_credentials"
  | "email_taken"
  | "invalid_email"
  | "password_too_short"
  | "password_too_long"
  | "too_many_requests"
  | "account_inactive"
  | "default";

const errorKeysByCode: Record<string, AuthErrorKey> = {
  INVALID_EMAIL_OR_PASSWORD: "invalid_credentials",
  USER_ALREADY_EXISTS: "email_taken",
  USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL: "email_taken",
  INVALID_EMAIL: "invalid_email",
  PASSWORD_TOO_SHORT: "password_too_short",
  PASSWORD_TOO_LONG: "password_too_long",
  account_inactive: "account_inactive",
};

const TOO_MANY_REQUESTS = 429;

export function authErrorKey(error: {
  code?: string;
  status?: number;
}): AuthErrorKey {
  if (error.status === TOO_MANY_REQUESTS) {
    return "too_many_requests";
  }

  return (error.code && errorKeysByCode[error.code]) || "default";
}
