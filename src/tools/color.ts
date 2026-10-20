import type { Tool } from "../types.ts";
export interface Color {
  r: number;
  g: number;
  b: number;
  a: number;
}
const syntaxError =
  "Enter a HEX, RGB, or HSL color, such as #c9ef8a, rgb(201, 239, 138), or hsl(83, 76%, 74%).";
function number(value: string, max: number, label: string) {
  if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i.test(value))
    throw new Error(`Enter a valid ${label}.`);
  const result = Number(value);
  if (!Number.isFinite(result) || result < 0 || result > max)
    throw new Error(`${label} must be between 0 and ${max}.`);
  return result;
}
function channel(value: string) {
  return value.endsWith("%")
    ? (number(value.slice(0, -1), 100, "RGB percentage") * 255) / 100
    : number(value, 255, "RGB channel");
}
function alpha(value = "1") {
  return value.endsWith("%")
    ? number(value.slice(0, -1), 100, "Opacity percentage") / 100
    : number(value, 1, "Opacity");
}
function hue(value: string) {
  const match = /^([+-]?(?:\d+(?:\.\d*)?|\.\d+))(deg|turn|grad|rad)?$/i.exec(
    value,
  );
  if (!match)
    throw new Error("Enter a valid hue in degrees, turns, radians, or grads.");
  const multiplier = { deg: 1, turn: 360, grad: 0.9, rad: 180 / Math.PI }[
    match[2]?.toLowerCase() || "deg"
  ];
  const degrees = Number(match[1]) * (multiplier ?? 1);
  if (!Number.isFinite(degrees)) throw new Error("Enter a finite hue.");
  return ((degrees % 360) + 360) % 360;
}
export function parseColor(value: string): Color {
  const input = value.trim();
  if (/^#[\da-f]{3,4}$/i.test(input))
    return parseColor(
      "#" + Array.from(input.slice(1), (char) => char + char).join(""),
    );
  if (/^#(?:[\da-f]{6}|[\da-f]{8})$/i.test(input))
    return {
      r: parseInt(input.slice(1, 3), 16),
      g: parseInt(input.slice(3, 5), 16),
      b: parseInt(input.slice(5, 7), 16),
      a: input.length === 9 ? parseInt(input.slice(7, 9), 16) / 255 : 1,
    };
  const match = /^(rgb|rgba|hsl|hsla)\(([^()]*)\)$/i.exec(input);
  if (!match) throw new Error(syntaxError);
  const body = match[2].trim();
  let parts: string[];
  let opacity: string | undefined;
  if (body.includes(",")) {
    if (body.includes("/"))
      throw new Error(
        "Use either comma-separated or space-separated color syntax.",
      );
    parts = body.split(",").map((part) => part.trim());
    if (parts.length === 4) opacity = parts.pop();
  } else {
    const slash = body.split("/");
    if (slash.length > 2 || slash.some((part) => !part.trim()))
      throw new Error(syntaxError);
    parts = slash[0].trim().split(/\s+/);
    opacity = slash[1]?.trim();
  }
  if (parts.length !== 3 || parts.some((part) => !part))
    throw new Error(syntaxError);
  const a = alpha(opacity);
  if (match[1].toLowerCase().startsWith("rgb"))
    return {
      r: channel(parts[0]),
      g: channel(parts[1]),
      b: channel(parts[2]),
      a,
    };
  if (!parts[1].endsWith("%") || !parts[2].endsWith("%"))
    throw new Error("HSL saturation and lightness must use percentages.");
  const h = hue(parts[0]);
  const s = number(parts[1].slice(0, -1), 100, "Saturation") / 100;
  const l = number(parts[2].slice(0, -1), 100, "Lightness") / 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  const [r, g, b] =
    h < 60
      ? [c, x, 0]
      : h < 120
        ? [x, c, 0]
        : h < 180
          ? [0, c, x]
          : h < 240
            ? [0, x, c]
            : h < 300
              ? [x, 0, c]
              : [c, 0, x];
  return { r: (r + m) * 255, g: (g + m) * 255, b: (b + m) * 255, a };
}
const rounded = (value: number, precision = 2) =>
  String(Number(value.toFixed(precision)));
export function colorFormats(color: Color) {
  const bytes = [color.r, color.g, color.b].map((value) => Math.round(value));
  const hex =
    "#" +
    [...bytes, ...(color.a < 1 ? [Math.round(color.a * 255)] : [])]
      .map((value) => value.toString(16).padStart(2, "0"))
      .join("");
  const [r, g, b] = [color.r, color.g, color.b].map((value) => value / 255);
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b),
    delta = max - min;
  const l = (max + min) / 2;
  const s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
  let h =
    delta === 0
      ? 0
      : max === r
        ? ((g - b) / delta) % 6
        : max === g
          ? (b - r) / delta + 2
          : (r - g) / delta + 4;
  h = (h * 60 + 360) % 360;
  const rgb =
    color.a < 1
      ? `rgba(${bytes.join(", ")}, ${rounded(color.a, 3)})`
      : `rgb(${bytes.join(", ")})`;
  const hslParts = `${rounded(h)}, ${rounded(s * 100)}%, ${rounded(l * 100)}%`;
  const hsl =
    color.a < 1
      ? `hsla(${hslParts}, ${rounded(color.a, 3)})`
      : `hsl(${hslParts})`;
  return { hex, rgb, hsl };
}
export const colorTool: Tool = {
  id: "color",
  name: "Color converter",
  category: "Design",
  kind: "color",
  description:
    "Move between HEX, RGB, and HSL. Supports short HEX, transparency, and modern CSS color syntax.",
  keywords: ["hex", "rgb", "hsl", "rgba", "hsla", "picker", "design"],
  inputLabel: "Color value",
  sample: "#c9ef8a",
  actions: [
    { label: "To HEX", run: (value) => colorFormats(parseColor(value)).hex },
    { label: "To RGB", run: (value) => colorFormats(parseColor(value)).rgb },
    { label: "To HSL", run: (value) => colorFormats(parseColor(value)).hsl },
  ],
};
