import { lazy, Suspense, useDeferredValue, useMemo } from "react";
import { type Tool } from "../types";
import { useWorkspace, type Workspace } from "../hooks/use-workspace";
import { parseColor, colorFormats } from "../tools/color";
import { textStats } from "../tools/counter";
import { Button } from "./button";
import { Icon } from "./icon";
const MarkdownPreview = lazy(() => import("./markdown-preview"));

function ColorPalette({
  input,
  updateInput,
}: Pick<Workspace, "input" | "updateInput">) {
  const color = useMemo(() => {
    try {
      return colorFormats(parseColor(input));
    } catch {
      return null;
    }
  }, [input]);
  return (
    <div className="color-palette">
      <div className="color-swatch">
        <div style={{ backgroundColor: color?.rgb || "transparent" }} />
        <label className="color-picker-label">
          Pick a color
          <input
            type="color"
            aria-label="Pick a color"
            value={color?.hex.slice(0, 7) || "#c9ef8a"}
            onChange={(event) => updateInput(event.target.value)}
          />
        </label>
      </div>
      <div className="color-values">
        {color ? (
          <>
            {Object.entries(color).map(([format, value]) => (
              <div key={format}>
                <span>{format.toUpperCase()}</span>
                <code>{value}</code>
              </div>
            ))}
          </>
        ) : (
          <p>HEX, RGB, or HSL. A whole spectrum of possibilities.</p>
        )}
      </div>
      <div className="color-samples" aria-label="Example colors">
        {["#c9ef8a", "#a5b4fc", "#ffb4a2", "#67d5d0", "#f5cd7a"].map(
          (value) => (
            <button
              type="button"
              key={value}
              style={{ backgroundColor: value }}
              aria-label={`Use color ${value}`}
              onClick={() => updateInput(value)}
            />
          ),
        )}
      </div>
    </div>
  );
}
function TextMetrics({ input }: { input: string }) {
  const deferred = useDeferredValue(input);
  const stats = useMemo(() => textStats(deferred), [deferred]);
  const seconds = stats.readingTimeSeconds;
  return (
    <dl className="metrics-grid" aria-label="Live text statistics">
      {[
        ["Words", stats.words.toLocaleString()],
        ["Characters", stats.characters.toLocaleString()],
        ["Lines", stats.lines.toLocaleString()],
        [
          "Reading time",
          seconds === 0
            ? "0 sec"
            : seconds < 60
              ? `${seconds} sec`
              : `${Math.ceil(seconds / 60)} min`,
        ],
      ].map(([label, value]) => (
        <div key={label}>
          <dt>{label}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  );
}
function InputEditor({ tool, state }: { tool: Tool; state: Workspace }) {
  const inputId = `${tool.id}-input`;
  return (
    <div className="editor input-editor">
      <div className="editor-label">
        <label htmlFor={inputId}>{tool.inputLabel || "Input"}</label>
        <div className="editor-toolbar">
          <button
            type="button"
            disabled={!state.input}
            onClick={() => state.updateInput("")}
          >
            Clear
          </button>
          <span />
          <button type="button" onClick={() => state.updateInput(tool.sample)}>
            Load example
          </button>
        </div>
      </div>
      {tool.inputType === "number" ? (
        <div className="generator-input">
          <span className="generator-symbol" aria-hidden="true">
            <Icon name={tool.id} size={30} />
          </span>
          <input
            id={inputId}
            type="number"
            min={tool.min}
            max={tool.max}
            step={1}
            inputMode="numeric"
            value={state.input}
            onChange={(event) => state.updateInput(event.target.value)}
            aria-invalid={!!state.error}
            aria-describedby={
              state.error ? `${tool.id}-error` : `description-${tool.id}`
            }
          />
          <p>
            Choose a whole number from {tool.min} to {tool.max}.
          </p>
          <span className="generator-note">
            <Icon name="shield" size={13} />
            Powered by Web Crypto
          </span>
        </div>
      ) : (
        <textarea
          id={inputId}
          value={state.input}
          maxLength={state.limit}
          onChange={(event) => state.updateInput(event.target.value)}
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          placeholder={
            tool.kind === "markdown"
              ? "# Start something good…"
              : "Paste or type your input here…"
          }
          aria-invalid={!!state.error}
          aria-describedby={
            state.error ? `${tool.id}-error` : `description-${tool.id}`
          }
        />
      )}
      <div className="editor-meta">
        <span>
          {tool.inputType === "number"
            ? "Secure random generation"
            : `${state.input.length.toLocaleString()} characters`}
        </span>
        <span>
          {tool.kind === "markdown"
            ? "Markdown / GFM"
            : tool.id === "json"
              ? "JSON"
              : tool.inputType === "number"
                ? "Web Crypto API"
                : "UTF-8"}
        </span>
      </div>
    </div>
  );
}
export function ToolWorkbench({
  tool,
  active,
}: {
  tool: Tool;
  active: boolean;
}) {
  const state = useWorkspace(tool);
  const deferred = useDeferredValue(state.input);
  const markdown = tool.kind === "markdown";
  return (
    <section
      className="workbench"
      id={`panel-${tool.id}`}
      hidden={!active}
      aria-labelledby={`title-${tool.id}`}
    >
      <div className="panel-heading">
        <div className="tool-title-row">
          <span className="tool-badge">
            <Icon name={tool.id} size={23} />
          </span>
          <div>
            <span className="eyebrow">{tool.category}</span>
            <h2 id={`title-${tool.id}`}>{tool.name}</h2>
          </div>
        </div>
        <span className="local-badge">
          <span className="status-dot" />
          Runs locally
        </span>
        <p id={`description-${tool.id}`}>{tool.description}</p>
      </div>
      {active && tool.id === "counter" && <TextMetrics input={state.input} />}
      {active && tool.kind === "color" && (
        <ColorPalette input={state.input} updateInput={state.updateInput} />
      )}
      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          state.run(tool.actions[0]);
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
            event.preventDefault();
            if (!markdown) event.currentTarget.requestSubmit();
          }
        }}
      >
        <div className={`editor-grid ${markdown ? "markdown-editors" : ""}`}>
          <InputEditor tool={tool} state={state} />
          <div className="editor output-editor">
            <div className="editor-label">
              {markdown ? (
                <span id="markdown-preview-label">Live preview</span>
              ) : (
                <label htmlFor={`${tool.id}-output`}>Output</label>
              )}
              <button
                type="button"
                className="copy-button"
                disabled={
                  !(markdown ? state.input : state.output) || state.copying
                }
                onClick={() =>
                  void state.copy(markdown ? state.input : undefined)
                }
              >
                <Icon name="copy" size={13} />
                {state.copying
                  ? "Copying…"
                  : markdown
                    ? "Copy Markdown"
                    : "Copy output"}
              </button>
            </div>
            {markdown ? (
              <div
                className="markdown-preview"
                role="region"
                aria-labelledby="markdown-preview-label"
              >
                {active && (
                  <Suspense
                    fallback={
                      <div className="preview-empty" role="status">
                        Loading your preview…
                      </div>
                    }
                  >
                    <MarkdownPreview source={deferred} />
                  </Suspense>
                )}
              </div>
            ) : (
              <div className="output-content">
                <textarea
                  id={`${tool.id}-output`}
                  value={state.output}
                  readOnly
                  placeholder="Your result will appear here."
                  spellCheck={false}
                  aria-describedby={`status-${tool.id}`}
                />
                {!state.output && (
                  <div className="output-empty" aria-hidden="true">
                    <span>
                      <Icon name={tool.id} size={25} />
                    </span>
                    <p>
                      A little input.
                      <br />A useful result.
                    </p>
                  </div>
                )}
              </div>
            )}
            <div className="editor-meta">
              <span>
                {markdown
                  ? "Updates as you type"
                  : state.output
                    ? `${state.output.length.toLocaleString()} characters`
                    : "Ready when you are"}
              </span>
              <span>{markdown ? "HTML disabled" : "Read only"}</span>
            </div>
          </div>
        </div>
        <div className="actions">
          {!markdown &&
            tool.actions.map((action, index) => (
              <Button
                variant={index === 0 ? "primary" : "secondary"}
                type={index === 0 ? "submit" : "button"}
                key={action.label}
                onClick={index === 0 ? undefined : () => state.run(action)}
              >
                {action.label}
                {index === 0 && <Icon name="arrow" size={15} />}
              </Button>
            ))}
          {markdown && (
            <span className="markdown-safety">
              <Icon name="shield" size={15} />
              Links are checked. External images and HTML are disabled.
            </span>
          )}
          <span className="keyboard-hint">
            {markdown ? (
              "Write. Preview. Repeat."
            ) : (
              <>
                <kbd>⌘</kbd> / <kbd>Ctrl</kbd> + <kbd>Enter</kbd> to run
              </>
            )}
          </span>
        </div>
      </form>
      <p
        className="copy-status"
        id={`status-${tool.id}`}
        role="status"
        aria-live="polite"
      >
        {state.status}
      </p>
      {state.error && (
        <p id={`${tool.id}-error`} className="error" role="alert">
          <Icon name="close" size={16} />
          {state.error}
        </p>
      )}
      <div className="panel-footer">
        <Icon name="shield" size={14} />
        <span>Your input stays on this device.</span>
        <span>No uploads. No accounts. Just your browser.</span>
        <span className="input-limit">
          {tool.inputType === "number"
            ? `${tool.min}–${tool.max} ${tool.id === "password" ? "characters" : "identifiers"}`
            : `${state.limit.toLocaleString()} character limit`}
        </span>
      </div>
    </section>
  );
}
