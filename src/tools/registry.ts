import type { Tool } from "../types.ts";
import { jsonTool } from "./json.ts";
import { base64Tool } from "./base64.ts";
import { passwordTool } from "./password.ts";
import { uuidTool } from "./uuid.ts";
import { timestampTool } from "./timestamp.ts";
import { urlTool } from "./url.ts";
import { caseTool } from "./case.ts";
import { counterTool } from "./counter.ts";
import { colorTool } from "./color.ts";
import { markdownTool } from "./markdown.ts";
export const tools: readonly Tool[] = [
  jsonTool,
  base64Tool,
  passwordTool,
  uuidTool,
  timestampTool,
  urlTool,
  caseTool,
  counterTool,
  colorTool,
  markdownTool,
];
export function searchTools(query: string) {
  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  return tools.filter((tool) =>
    terms.every((term) =>
      `${tool.name} ${tool.description} ${tool.category} ${(tool.keywords || []).join(" ")}`
        .toLowerCase()
        .includes(term),
    ),
  );
}
