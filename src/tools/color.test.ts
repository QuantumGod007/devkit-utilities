import { test } from "node:test";
import assert from "node:assert/strict";
import { parseColor, colorFormats } from "./color.ts";
test("converts HEX, RGB, HSL, shorthand and CSS percentages", () => {
  for (const input of [
    "#ff0000",
    "#f00",
    "rgb(255, 0, 0)",
    "rgb(100% 0% 0%)",
    "hsl(0, 100%, 50%)",
    "hsl(1turn 100% 50%)",
    "hsl(-360 100% 50%)",
  ]) {
    assert.equal(colorFormats(parseColor(input)).hex, "#ff0000");
    assert.equal(colorFormats(parseColor(input)).hsl, "hsl(0, 100%, 50%)");
  }
  assert.equal(colorFormats(parseColor("#000")).hsl, "hsl(0, 0%, 0%)");
  assert.equal(colorFormats(parseColor("#fff")).hsl, "hsl(0, 0%, 100%)");
  assert.equal(
    colorFormats(parseColor("hsl(120 100% 50%)")).rgb,
    "rgb(0, 255, 0)",
  );
});
test("preserves alpha across color formats", () => {
  assert.equal(colorFormats(parseColor("#1238")).hex, "#11223388");
  assert.equal(colorFormats(parseColor("rgba(255,0,0,0.5)")).hex, "#ff000080");
  assert.equal(
    colorFormats(parseColor("hsl(0 100% 50% / 50%)")).rgb,
    "rgba(255, 0, 0, 0.5)",
  );
  assert.equal(colorFormats(parseColor("rgb(0 0 0 / 0)")).hex, "#00000000");
});
test("rejects malformed colors, mixed syntax, out-of-range values and injection", () => {
  for (const value of [
    "",
    "#12",
    "#gggggg",
    "red",
    "rgb(256,0,0)",
    "rgb(-1,0,0)",
    "rgb(1,2,3 / .5)",
    "rgb(1 2)",
    "rgb(1 2 3 /)",
    "rgb(1 2 3 / 2)",
    "hsl(20 30 40)",
    "hsl(0 101% 50%)",
    "url(https://example.com)",
    "#fff; color:red",
  ])
    assert.throws(() => parseColor(value));
});
test("round-trips representative RGB colors through HSL within one byte", () => {
  for (const source of [
    "#c9ef8a",
    "#1a2b3c",
    "#757575",
    "#ff00aa",
    "#000001",
  ]) {
    const color = parseColor(source);
    const restored = parseColor(colorFormats(color).hsl);
    for (const key of ["r", "g", "b"] as const)
      assert.ok(Math.abs(color[key] - restored[key]) <= 1);
  }
});
