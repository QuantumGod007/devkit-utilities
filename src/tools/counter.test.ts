import { test } from "node:test";
import assert from "node:assert/strict";
import { count } from "./counter.ts";
test("Text inspector handles valid and invalid inputs", () => {
  const value = JSON.parse(count("hello world 👋"));
  assert.equal(value.words, 2);
  assert.equal(value.characters, 13);
  assert.equal(JSON.parse(count("")).lines, 0);
});

test("counts composed accents and emoji sequences as visible characters", () => {
  const result = JSON.parse(count("e\u0301👨‍👩‍👧‍👦"));
  assert.equal(result.characters, 2);
  assert.equal(result.codePoints, 9);
  assert.equal(JSON.parse(count("one\r\ntwo")).lines, 2);
});

test("estimates reading time at 200 words per minute, with an empty state", () => {
  assert.equal(JSON.parse(count("")).readingTimeSeconds, 0);
  assert.equal(
    JSON.parse(count(Array(200).fill("word").join(" "))).readingTimeSeconds,
    60,
  );
  assert.equal(JSON.parse(count("hello")).readingTimeSeconds, 1);
});
