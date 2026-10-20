import type { Tool } from "../types.ts";
export function textStats(value: string) {
  let words = 0;
  for (const part of new Intl.Segmenter(undefined, {
    granularity: "word",
  }).segment(value))
    if (part.isWordLike) words++;
  const graphemes = new Intl.Segmenter(undefined, { granularity: "grapheme" });
  let characters = 0;
  let charactersWithoutWhitespace = 0;
  for (const part of graphemes.segment(value)) if (part.segment) characters++;
  for (const part of graphemes.segment(value.replace(/\s/gu, "")))
    if (part.segment) charactersWithoutWhitespace++;
  return {
    words,
    characters,
    codePoints: Array.from(value).length,
    charactersWithoutWhitespace,
    lines: value ? value.split(/\r\n|\r|\n/).length : 0,
    utf8Bytes: new TextEncoder().encode(value).length,
    readingTimeSeconds: Math.ceil((words / 200) * 60),
  };
}
export function count(value: string) {
  return JSON.stringify(textStats(value), null, 2);
}
export const counterTool: Tool = {
  id: "counter",
  name: "Text inspector",
  category: "Text",
  description:
    "Count words, visible characters, lines, and bytes. Estimate reading time at 200 words per minute.",
  sample: "Small tools. More flow.",
  actions: [{ label: "Count text", run: count }],
};
