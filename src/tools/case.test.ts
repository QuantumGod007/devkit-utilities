import { test } from "node:test";
import assert from "node:assert/strict";
import { camel, snake, title } from "./case.ts";
test("Text case handles valid and invalid inputs", () => {
  assert.equal(camel("Hello world"), "helloWorld");
  assert.equal(snake("helloWorld"), "hello_world");
  assert.equal(title("élan vital"), "Élan Vital");
});

test("handles acronyms, Unicode word boundaries and contractions", () => {
  assert.equal(camel("XMLHttpRequest"), "xmlHttpRequest");
  assert.equal(snake("déjàVu"), "déjà_vu");
  assert.equal(title("don't stop"), "Don't Stop");
});
