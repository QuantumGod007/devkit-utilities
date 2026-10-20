import type { Tool } from "../types.ts";
function tokens(value: string) {
  if (!value.trim())
    throw new Error(
      "Enter JSON to format or validate. Try the example to get started.",
    );
  try {
    JSON.parse(value);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Check the JSON syntax.";
    throw new Error(
      `Invalid JSON. ${message} Check quotes, commas, and closing brackets.`,
      { cause: error },
    );
  }
  // Validate with the native parser, but format the original lexemes. Serializing
  // the parsed object would silently round large integers and discard duplicate keys.
  return (
    value.match(
      /"(?:\\.|[^"\\])*"|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?|true|false|null|[{}[\]:,]/g,
    ) || []
  );
}
export function format(value: string) {
  const parts = tokens(value);
  let depth = 0;
  let result = "";
  const newline = () => "\n" + "  ".repeat(depth);
  parts.forEach((token, index) => {
    if (token === "{" || token === "[") {
      result += token;
      if (parts[index + 1] !== "}" && parts[index + 1] !== "]") {
        depth++;
        if (depth > 100)
          throw new Error(
            "This JSON exceeds 100 nested levels. Use Minify or Validate instead.",
          );
        result += newline();
      }
    } else if (token === "}" || token === "]") {
      if (parts[index - 1] !== "{" && parts[index - 1] !== "[") {
        depth--;
        result += newline();
      }
      result += token;
    } else if (token === ",") result += "," + newline();
    else if (token === ":") result += ": ";
    else result += token;
  });
  return result;
}
export function minify(value: string) {
  return tokens(value).join("");
}
export function validate(value: string) {
  tokens(value);
  return "Valid JSON. No syntax errors found.";
}
export const jsonTool: Tool = {
  id: "json",
  name: "JSON formatter",
  category: "Data",
  description:
    "Make JSON readable, minify it, or find syntax errors. Numbers and key order are preserved.",
  keywords: ["pretty print", "minify", "validate", "data"],
  sample: '{"project":"Devkit","ready":true,"tools":["format","build","ship"]}',
  actions: [
    { label: "Format JSON", run: format },
    { label: "Minify", run: minify },
    { label: "Validate", run: validate },
  ],
};
