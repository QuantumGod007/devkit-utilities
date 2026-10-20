import type { Tool } from "../types.ts";
export function generate(value: string) {
  const count = /^\d+$/.test(value.trim()) ? Number(value) : NaN;
  if (!Number.isInteger(count) || count < 1 || count > 100)
    throw new Error("Enter a whole number from 1 to 100.");
  if (typeof globalThis.crypto?.randomUUID !== "function")
    throw new Error(
      "UUID generation requires HTTPS or localhost and a browser with Web Crypto.",
    );
  return Array.from({ length: count }, () => crypto.randomUUID()).join("\n");
}
export const uuidTool: Tool = {
  id: "uuid",
  name: "UUID generator",
  category: "Identifiers",
  description:
    "Generate 1\u2013100 random UUID v4 identifiers using browser cryptography.",
  inputLabel: "Number of UUIDs",
  inputType: "number",
  min: 1,
  max: 100,
  sample: "5",
  actions: [{ label: "Generate UUIDs", run: generate }],
};
