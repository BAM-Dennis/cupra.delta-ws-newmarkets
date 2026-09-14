/** Kurzcodes für Gruppen-QRs: 6 Zeichen ohne verwechselbare Zeichen (0/O, 1/I/L). */
const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

export function randomCode(length = 6): string {
  let out = "";
  for (let i = 0; i < length; i++) out += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  return out;
}

export function normalizeCode(code: string): string {
  return code.trim().toUpperCase();
}
