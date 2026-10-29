import { consoleEmailProvider } from "./console";
import { noEmailProvider } from "./none";
import type { EmailProvider } from "./provider";

function defaultProviderName(): string {
  return process.env.NODE_ENV === "production" ? "none" : "console";
}

export function getEmailProvider(): EmailProvider {
  const name = process.env.EMAIL_PROVIDER || defaultProviderName();

  if (name === "console") {
    return consoleEmailProvider;
  }

  if (name === "none") {
    return noEmailProvider;
  }

  throw new Error(`Unknown EMAIL_PROVIDER "${name}". Use "console" or "none".`);
}
