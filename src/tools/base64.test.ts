import { test } from "node:test";
import assert from "node:assert/strict";
import { encode, decode } from "./base64.ts";
test("Base64 codec handles valid and invalid inputs", () => {
  assert.equal(decode(encode("Hello, 世界 👋")), "Hello, 世界 👋");
  assert.throws(() => decode("%%%"));
});

test("decodes formatted Base64, accepts empty text, and rejects invalid UTF-8", () => {
  assert.equal(decode(" SGVs\nbG8= "), "Hello");
  assert.equal(encode(""), "");
  assert.equal(decode(""), "");
  assert.throws(() => decode("/w=="), /UTF-8/);
});
