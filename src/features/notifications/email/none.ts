import type { EmailProvider } from "./provider";

export const noEmailProvider: EmailProvider = {
  async send() {},
};
