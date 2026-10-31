const EGYPT_LOCAL = /^01[0125]\d{8}$/;
const EGYPT_WITH_CODE = /^201[0125]\d{8}$/;
const INTERNATIONAL = /^\d{8,15}$/;

// Returns "+<digits>" for a phone we accept, or null. Raw formatting (spaces, dashes) is dropped.
export function normalizePhone(input: string): string | null {
  const cleaned = input.replace(/[\s().-]/g, "");

  if (!/^\+?\d+$/.test(cleaned)) {
    return null;
  }

  if (cleaned.startsWith("+")) {
    return INTERNATIONAL.test(cleaned.slice(1)) ? cleaned : null;
  }

  if (cleaned.startsWith("00")) {
    return INTERNATIONAL.test(cleaned.slice(2)) ? `+${cleaned.slice(2)}` : null;
  }

  if (EGYPT_LOCAL.test(cleaned)) {
    return `+20${cleaned.slice(1)}`;
  }

  return EGYPT_WITH_CODE.test(cleaned) ? `+${cleaned}` : null;
}
