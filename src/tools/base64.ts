
import type { Tool } from "../types.ts";

export function encode(value: string) {
  return btoa(
    Array.from(new TextEncoder().encode(value), (byte) =>
      String.fromCharCode(byte),
    ).join(""),
  );
}

export function decode(value: string) {
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(
      Uint8Array.from(atob(value), (char) => char.charCodeAt(0)),
    );
  } catch {
    throw new Error("Enter valid Base64 containing UTF-8 text.");
  }
}

export function encodeUrlSafe(value: string) {
  return encode(value)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export function decodeUrlSafe(value: string) {
  if (!/^[A-Za-z0-9_-]*$/.test(value) || value.length % 4 === 1) {
    throw new Error("Enter valid unpadded Base64URL text.");
  }

  const standard = value.replace(/-/g, "+").replace(/_/g, "/");
  return decode(standard.padEnd(Math.ceil(standard.length / 4) * 4, "="));
}

export const base64Tool: Tool = {
  id: "base64",
  name: "Base64 codec",
  category: "Encoding",
  description:
    "Encode and decode Unicode text using Base64 or URL-safe Base64.",
  sample: "Hello, 世界 👋",
  actions: [
    { label: "Encode", run: encode },
    { label: "Decode", run: decode },
    { label: "Encode URL-safe", run: encodeUrlSafe },
    { label: "Decode URL-safe", run: decodeUrlSafe },
  ],
};
