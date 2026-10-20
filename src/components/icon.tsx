import type { ReactNode } from "react";
import type { ToolId } from "../types";
export type IconName =
  | ToolId
  | "search"
  | "copy"
  | "arrow"
  | "check"
  | "close"
  | "shield"
  | "github"
  | "menu"
  | "spark"
  | "reset";
const drawings: Record<IconName, ReactNode> = {
  json: (
    <>
      <path d="M8 4H6v6l-2 2 2 2v6h2M16 4h2v6l2 2-2 2v6h-2" />
      <path d="M11 9h2m-2 6h2" />
    </>
  ),
  base64: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="3" />
      <path d="m7 9 2-1v8m5-7h3v6h-3z" />
    </>
  ),
  password: (
    <>
      <rect x="5" y="10" width="14" height="11" rx="3" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3m-4 5v2" />
    </>
  ),
  uuid: (
    <>
      <path d="M9 3 7 21M17 3l-2 18M3 8h18M2 16h18" />
    </>
  ),
  timestamp: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  url: (
    <>
      <path d="m10 13 4-4m-6 7-1 1a4 4 0 0 1-6-6l4-4a4 4 0 0 1 6 0m2 1 1-1a4 4 0 0 1 6 6l-4 4a4 4 0 0 1-6 0" />
    </>
  ),
  case: (
    <>
      <path d="m3 19 5-14 5 14M5 14h6m4-4h6m-3 0v9" />
    </>
  ),
  counter: (
    <>
      <path d="M8 6h13M8 12h13M8 18h13" />
      <circle cx="3" cy="6" r=".5" />
      <circle cx="3" cy="12" r=".5" />
      <circle cx="3" cy="18" r=".5" />
    </>
  ),
  color: (
    <>
      <path d="M12 3a9 9 0 1 0 0 18h1a2 2 0 0 0 1-4c-1-1 0-2 1-2h2a4 4 0 0 0 4-4 9 9 0 0 0-9-8Z" />
      <path d="M7 10h.01M10 6h.01M15 7h.01M17 11h.01" strokeWidth="3" />
    </>
  ),
  markdown: (
    <>
      <rect x="2" y="5" width="20" height="14" rx="3" />
      <path d="M6 15V9l3 3 3-3v6m5-6v6m-2-2 2 2 2-2" />
    </>
  ),
  search: (
    <>
      <circle cx="10" cy="10" r="6" />
      <path d="m15 15 5 5" />
    </>
  ),
  copy: (
    <>
      <rect x="8" y="8" width="12" height="13" rx="2" />
      <path d="M15 8V3H3v12h5" />
    </>
  ),
  arrow: <path d="M5 12h14m-5-5 5 5-5 5" />,
  check: <path d="m5 12 4 4L19 6" />,
  close: <path d="m6 6 12 12M6 18 18 6" />,
  shield: (
    <>
      <path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6z" />
      <path d="m8 12 3 3 5-6" />
    </>
  ),
  github: (
    <>
      <path
        d="M9 19c-4 1-4-2-6-2m12 5v-4c0-1-.3-1.7-1-2 3-.3 6-1.5 6-6a5 5 0 0 0-1.5-3.5A4.5 4.5 0 0 0 18 3s-1.5-.5-4 1a13 13 0 0 0-7 0C4.5 2.5 3 3 3 3a4.5 4.5 0 0 0-.5 3.5A5 5 0 0 0 1 10c0 4.5 3 5.7 6 6-.7.3-1 1-1 2v4"
        transform="translate(2 0) scale(.9 1)"
      />
    </>
  ),
  menu: <path d="M4 6h16M4 12h16M4 18h16" />,
  spark: <path d="m12 2 2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5Z" />,
  reset: (
    <>
      <path d="M3 10a9 9 0 1 1 1 7M3 4v6h6" />
    </>
  ),
};
export function Icon({
  name,
  size = 18,
  className = "",
}: {
  name: IconName;
  size?: number;
  className?: string;
}) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {drawings[name]}
    </svg>
  );
}
