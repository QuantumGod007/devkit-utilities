import type { Tool } from "../types.ts";
export function count(value: string) {
  const segments = new Intl.Segmenter(undefined, {
    granularity: "word",
  }).segment(value);
  return JSON.stringify(
    {
      words: Array.from(segments).filter((part) => part.isWordLike).length,
      characters: Array.from(
        new Intl.Segmenter(undefined, { granularity: "grapheme" }).segment(
          value,
        ),
      ).length,
      codePoints: Array.from(value).length,
      charactersWithoutWhitespace: Array.from(
        new Intl.Segmenter(undefined, { granularity: "grapheme" }).segment(
          value.replace(/\s/gu, ""),
        ),
      ).length,
      lines: value ? value.split(/\r\n|\r|\n/).length : 0,
      utf8Bytes: new TextEncoder().encode(value).length,
    },
    null,
    2,
  );
}
export const counterTool: Tool = {
  id: "counter",
  name: "Text inspector",
  category: "Text",
  description:
    "Count visible characters, Unicode code points, words, lines, and UTF-8 bytes. Spaces count as characters.",
  sample: "Small tools. More flow.",
  actions: [{ label: "Count text", run: count }],
};
