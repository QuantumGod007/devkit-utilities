export const toolIds = [
  "json",
  "base64",
  "password",
  "uuid",
  "timestamp",
  "url",
  "case",
  "counter",
  "color",
  "markdown",
] as const;
export type ToolId = (typeof toolIds)[number];
export interface ToolAction {
  label: string;
  run: (input: string) => string;
}
export interface Tool {
  id: ToolId;
  name: string;
  category:
    | "Data"
    | "Encoding"
    | "Security"
    | "Identifiers"
    | "Date & time"
    | "Text"
    | "Design"
    | "Writing";
  description: string;
  sample: string;
  keywords?: readonly string[];
  kind?: "color" | "markdown";
  inputLabel?: string;
  inputType?: "number";
  min?: number;
  max?: number;
  actions: readonly [ToolAction, ...ToolAction[]];
}
export const MAX_INPUT_LENGTH = 200_000;
export const MAX_MARKDOWN_LENGTH = 50_000;
