
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  encode,
  decode,
  encodeForm,
  decodeForm,
} from "./url.ts";

test("URL codec handles valid and invalid inputs", () => {
  assert.equal(decode(encode("hello 世界 &?")), "hello 世界 &?");
  assert.throws(() => decode("%2"));
});

test("component decoding preserves literal plus signs", () => {
  assert.equal(decode("hello+world"), "hello+world");
  assert.equal(decode(encode("100% + #tag &?")), "100% + #tag &?");
  assert.throws(() => encode("\ud800"), /incomplete Unicode/);
});

test("form encoding converts spaces to plus signs", () => {
  assert.equal(encodeForm("hello world"), "hello+world");
  assert.equal(encodeForm("a+b"), "a%2Bb");
});

test("form codec round-trips Unicode and symbols", () => {
  const text = "hello 世界 + &?";
  assert.equal(decodeForm(encodeForm(text)), text);
});

test("form decoding handles spaces and malformed escapes", () => {
  assert.equal(decodeForm("first+last"), "first last");
  assert.equal(decodeForm("a%2Bb"), "a+b");
  assert.throws(() => decodeForm("%2"), /Invalid percent encoding/);
});
