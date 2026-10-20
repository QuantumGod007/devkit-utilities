import { test } from "node:test";
import assert from "node:assert/strict";
import { tools, searchTools } from "./registry.ts";
import { toolIds } from "../types.ts";
test("every registered tool has a unique ID and valid default action", () => {
  assert.deepEqual(
    tools.map((tool) => tool.id),
    [...toolIds],
  );
  assert.equal(new Set(tools.map((tool) => tool.id)).size, 10);
  for (const tool of tools)
    assert.equal(typeof tool.actions[0].run(tool.sample), "string");
});
test("search matches names, categories and keywords without case sensitivity", () => {
  assert.equal(searchTools(" HEX ")[0].id, "color");
  assert.equal(searchTools("pretty print")[0].id, "json");
  assert.equal(searchTools("READme")[0].id, "markdown");
  assert.equal(searchTools("impossible-tool").length, 0);
  assert.equal(searchTools(" ").length, 10);
});
