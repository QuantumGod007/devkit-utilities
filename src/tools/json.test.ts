import { test } from "node:test";
import assert from "node:assert/strict";
import { format, minify, validate } from "./json.ts";
test("formats nested JSON, arrays, empty objects and primitives", () => {
  assert.equal(
    format('{"a":[1,{},[]],"b":true}'),
    '{\n  "a": [\n    1,\n    {},\n    []\n  ],\n  "b": true\n}',
  );
  for (const value of ["null", "false", "42", '"hello"', "{}", "[]"])
    assert.equal(format(value), value);
});
test("preserves numbers, duplicate keys, escapes and whitespace within strings", () => {
  const input =
    '{ "id": 9007199254740993, "large": 1e400, "id": -0, "text": "a b \\"c\\"" }';
  assert.equal(
    minify(input),
    '{"id":9007199254740993,"large":1e400,"id":-0,"text":"a b \\"c\\""}',
  );
  assert.match(format('{"id":9007199254740993}'), /9007199254740993/);
  assert.equal(JSON.parse(format('{"text":"a, b: [x]"}')).text, "a, b: [x]");
});
test("reports empty, incomplete and malformed JSON helpfully", () => {
  assert.throws(() => format(" "), /Enter JSON/);
  for (const value of ['{"a":}', "{a:1}", "[1,]", "{", "NaN"])
    assert.throws(() => validate(value), /Invalid JSON/);
  assert.match(validate('{"ok":true}'), /Valid JSON/);
});

test("rejects excessive pretty-print nesting without limiting validation or minification", () => {
  const value = "[".repeat(102) + "0" + "]".repeat(102);
  assert.throws(() => format(value), /100 nested/);
  assert.equal(minify(value), value);
  assert.match(validate(value), /Valid JSON/);
});
