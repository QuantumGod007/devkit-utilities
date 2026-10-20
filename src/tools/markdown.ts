import type { Tool } from "../types.ts";
export function safeMarkdownUrl(value: string) {
  const url = Array.from(value.trim())
    .filter(
      (character) =>
        character.charCodeAt(0) > 31 && character.charCodeAt(0) !== 127,
    )
    .join("");
  if (url.startsWith("#")) return url;
  try {
    const parsed = new URL(url);
    return ["http:", "https:", "mailto:"].includes(parsed.protocol)
      ? parsed.href
      : "";
  } catch {
    return "";
  }
}
export const markdownTool: Tool = {
  id: "markdown",
  name: "Markdown preview",
  category: "Writing",
  kind: "markdown",
  description:
    "Write Markdown and see it take shape. HTML and external images stay disabled for a private, safe preview.",
  keywords: ["md", "previewer", "writing", "readme", "gfm"],
  inputLabel: "Markdown source",
  sample:
    "# A little less friction.\n\nYour next good idea starts here. **Make it happen.**\n\n## The plan\n\n- [x] Find the right tools\n- [ ] Build something useful\n- [ ] Share it with the world\n\n```ts\nconst idea = { ready: true };\n```\n\n| Principle | Practice |\n| --- | --- |\n| Keep it simple | Solve one thing well |\n| Stay curious | Make room for the unexpected |\n\n> Good tools get out of your way.\n",
  actions: [{ label: "Preview Markdown", run: (value) => value }],
};
