import { test } from "node:test";
import assert from "node:assert/strict";
import { copyText } from "../clipboard.ts";

test("clipboard handles empty output, unsupported browsers, success and denial", async () => {
  const original = Object.getOwnPropertyDescriptor(globalThis, "navigator");
  try {
    await assert.rejects(copyText(""), /Generate/);
    Object.defineProperty(globalThis, "navigator", {
      configurable: true,
      value: {},
    });
    await assert.rejects(copyText("hello"), /HTTPS/);
    let copied = "";
    Object.defineProperty(globalThis, "navigator", {
      configurable: true,
      value: {
        clipboard: {
          writeText: async (text: string) => {
            copied = text;
          },
        },
      },
    });
    await copyText("hello 世界");
    assert.equal(copied, "hello 世界");
    Object.defineProperty(globalThis, "navigator", {
      configurable: true,
      value: {
        clipboard: {
          writeText: async () => {
            throw new Error("Denied");
          },
        },
      },
    });
    await assert.rejects(copyText("hello"), /permission denied/);
  } finally {
    if (original) Object.defineProperty(globalThis, "navigator", original);
    else Reflect.deleteProperty(globalThis, "navigator");
  }
});
