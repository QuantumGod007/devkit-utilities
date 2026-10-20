import { test } from "node:test";
import assert from "node:assert/strict";
import { fromUnix, toUnix, toMilliseconds } from "./timestamp.ts";
test("Unix timestamp handles valid and invalid inputs", () => {
  assert.equal(fromUnix("0"), "1970-01-01T00:00:00.000Z");
  assert.equal(toUnix("1970-01-01T00:00:00Z"), "0");
  assert.throws(() => fromUnix("hello"));
  assert.throws(() => toUnix("tomorrow"));
});

test("rejects calendar rollover and invalid clock components", () => {
  for (const input of [
    "2025-02-29T00:00:00Z",
    "2024-02-30T00:00:00Z",
    "2024-04-31T00:00:00Z",
    "2024-01-01T24:00:00Z",
    "2024-00-01T00:00:00Z",
    "2024-01-00T00:00:00Z",
    "2024-01-01T00:60:00Z",
  ])
    assert.throws(() => toUnix(input), /valid calendar/);
});
test("supports leap years, timezone offsets, negative epochs and milliseconds", () => {
  assert.equal(toUnix("2024-02-29T00:00:00Z"), "1709164800");
  assert.equal(toUnix("1970-01-01T05:30:00+05:30"), "0");
  assert.equal(toUnix("1969-12-31T23:59:59.999Z"), "-1");
  assert.equal(fromUnix("1700000000000", 1), fromUnix("1700000000"));
  assert.throws(() => fromUnix("9007199254740992"), /range/);
});

test("converts fractional seconds exactly and emits milliseconds", () => {
  assert.equal(fromUnix("1.001"), "1970-01-01T00:00:01.001Z");
  assert.equal(fromUnix("-0.001"), "1969-12-31T23:59:59.999Z");
  assert.equal(toMilliseconds("1970-01-01T00:00:01.001Z"), "1001");
  assert.throws(() => fromUnix("1.0001"));
  assert.throws(() => fromUnix("1.5", 1));
});

test("allows zero-padded epochs without changing their value", () => {
  assert.equal(fromUnix("00000000000000000.001"), "1970-01-01T00:00:00.001Z");
});
