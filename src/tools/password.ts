import type { Tool } from "../types.ts";
const groups = [
  "ABCDEFGHJKLMNPQRSTUVWXYZ",
  "abcdefghijkmnopqrstuvwxyz",
  "23456789",
  "!@#$%^&*()-_=+",
];
function random(max: number) {
  const limit = Math.floor(4294967296 / max) * max;
  let value: number;
  do {
    value = crypto.getRandomValues(new Uint32Array(1))[0];
  } while (value >= limit);
  return value % max;
}
export function generate(value: string) {
  const length = /^\d+$/.test(value.trim()) ? Number(value) : NaN;
  if (!Number.isInteger(length) || length < 8 || length > 128)
    throw new Error("Length must be a whole number between 8 and 128.");
  if (typeof globalThis.crypto?.getRandomValues !== "function")
    throw new Error(
      "Secure password generation is unavailable in this browser. Use a browser with Web Crypto.",
    );
  const all = groups.join("");
  const chars = groups.map((group) => group[random(group.length)]);
  while (chars.length < length) chars.push(all[random(all.length)]);
  for (let i = chars.length - 1; i > 0; i--) {
    const j = random(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join("");
}
export const passwordTool: Tool = {
  id: "password",
  name: "Password generator",
  category: "Security",
  description:
    "Enter a length from 8 to 128. Uses browser cryptography and includes all four character groups.",
  inputLabel: "Password length",
  inputType: "number",
  min: 8,
  max: 128,
  sample: "24",
  actions: [{ label: "Generate password", run: generate }],
};
