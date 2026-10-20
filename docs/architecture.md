# Architecture

## Shape of the application

```text
src/
  App.tsx                     shell, search, tool URLs, keyboard navigation
  components/
    tool-workbench.tsx        reusable editors and tool-specific presentations
    markdown-preview.tsx     lazy safe Markdown rendering
    toast.tsx                bounded, dismissible, focus/hover-aware notifications
    button.tsx, icon.tsx      shared UI primitives
    error-boundary.tsx        recovery from unexpected render errors
  hooks/use-workspace.ts     drafts, invalidation, validation, clipboard races
  tools/                      pure operations, metadata, unit tests, typed registry
  types.ts                    tool IDs, action contract, input limits
  clipboard.ts                clipboard capability and permission handling

e2e/                          production-browser and accessibility checks
deployment/security-headers.ts shared preview policy
public/fonts/                 self-hosted fonts and their licenses
```

The registry is the source of truth for the ten tools. `ToolId` is a literal union, and every tool must provide at least one action. Transformations remain pure functions so they can be tested without a DOM. React handles rendering; dynamic color CSS comes only from the validated numeric color model.

## State and interactions

Each workbench stays mounted to retain its own draft and result while hidden. Expensive color/text summaries render only in the active workspace. Markdown parsing is code-split, deferred, and active only when selected. No input is stored outside the React session.

Editing or loading an example increments a revision, clears validation feedback, and invalidates the old result. Clipboard completion checks that revision before changing feedback. An old pending copy therefore cannot claim that a newly edited result was copied. Notifications contain outcomes rather than private input, keep at most three visible items, clean up their timers, and pause removal on hover/focus.

Search is an AND match across normalized query terms, tool names, descriptions, categories, and keywords. Hash URLs contain only a validated tool ID. Unknown fragments, including the skip link and Markdown footnotes, do not reset the active workspace. Horizontal navigation keeps the active tool visible on small screens.

## Correctness and security decisions

- JSON is syntax-checked by the native parser, then formatted from its original tokens. Large integers, exponent notation, duplicate keys, and order are preserved. Pretty-print depth is bounded to avoid quadratic indentation expansion.
- Web Crypto supplies password and UUID randomness. Password selection uses rejection sampling and a Fisher–Yates shuffle; secure APIs have explicit availability errors.
- Epoch conversion uses integer millisecond arithmetic rather than floating-point multiplication. ISO components are checked before Date.parse can normalize an impossible calendar date.
- Markdown uses the maintained react-markdown/remark-gfm parser, with raw HTML disabled, an explicit URL allowlist, and image placeholders. No dangerouslySetInnerHTML is used.
- Fonts and all runtime code are served locally. Production CSP blocks outbound connections, raw scripts, objects, frames, and form navigation. Safe color swatches require inline style attributes; arbitrary CSS input is never applied.

Preview and deployment configs share the same intended policy. Browser tests assert production response headers and run under that policy. Changes to the policy should update all three locations and be verified on the target host after deployment.

## Extending a tool

Add its typed ID, pure operations and tests, metadata in the registry, and a local icon. Existing transformations reuse the workbench; introduce a custom presentation only for a task that needs one. Add real user-flow coverage and run `npm run check`, `npm run build`, and `npm run test:e2e` before committing.
