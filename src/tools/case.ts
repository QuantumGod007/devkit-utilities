import type { Tool } from "../types.ts";
export function lower(value: string) {
  return value.toLowerCase();
}
export function upper(value: string) {
  return value.toUpperCase();
}
export function title(value: string) {
  return Array.from(
    new Intl.Segmenter(undefined, { granularity: "word" }).segment(
      value.toLowerCase(),
    ),
    (part) => {
      if (!part.isWordLike) return part.segment;
      const [first, ...rest] = Array.from(part.segment);
      return first.toUpperCase() + rest.join("");
    },
  ).join("");
}
function words(value: string) {
  return (
    value
      .replace(/(\p{Lu})(\p{Lu}\p{Ll})/gu, "$1 $2")
      .replace(/([\p{Ll}\p{N}])(\p{Lu})/gu, "$1 $2")
      .match(/[\p{L}\p{N}]+/gu) || []
  );
}
export function camel(value: string) {
  return words(value)
    .map((word, index) =>
      index
        ? Array.from(word)[0].toUpperCase() +
          Array.from(word).slice(1).join("").toLowerCase()
        : word.toLowerCase(),
    )
    .join("");
}
export function snake(value: string) {
  return words(value)
    .map((word) => word.toLowerCase())
    .join("_");
}
export const caseTool: Tool = {
  id: "case",
  name: "Text case",
  category: "Text",
  description:
    "Convert text to lowercase, uppercase, title case, camelCase, or snake_case.",
  sample: "hello developer world",
  actions: [
    { label: "lowercase", run: lower },
    { label: "UPPERCASE", run: upper },
    { label: "Title Case", run: title },
    { label: "camelCase", run: camel },
    { label: "snake_case", run: snake },
  ],
};
