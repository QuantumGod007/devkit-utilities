import { test } from "node:test";
import assert from "node:assert/strict";
import { safeMarkdownUrl } from "./markdown.ts";
test("allows explicit safe protocols and in-page anchors", () => {
  assert.equal(
    safeMarkdownUrl("https://example.com/docs?q=hello"),
    "https://example.com/docs?q=hello",
  );
  assert.equal(
    safeMarkdownUrl("mailto:hello@example.com"),
    "mailto:hello@example.com",
  );
  assert.equal(safeMarkdownUrl("#notes"), "#notes");
});
test("blocks executable schemes, obfuscation, data and implicit network links", () => {
  for (const value of [
    "javascript:alert(1)",
    "java\nscript:alert(1)",
    "data:text/html,<script>x</script>",
    "vbscript:msgbox(1)",
    "//example.com",
    "/relative",
    "file:///etc/passwd",
    "https://",
  ])
    assert.equal(safeMarkdownUrl(value), "");
});
