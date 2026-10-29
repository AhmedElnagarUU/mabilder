import type { EmailProvider } from "./provider";

export const consoleEmailProvider: EmailProvider = {
  async send({ to, subject, text }) {
    console.log(`[email] to: ${to}\n[email] subject: ${subject}\n${text}`);
  },
};
