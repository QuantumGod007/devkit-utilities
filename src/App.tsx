import { useRef, useState } from "react";
import { copyText } from "./clipboard";
import { tools } from "./tools/registry";
import type { Tool } from "./types";

type Action = Tool["actions"][number];

function ToolPanel({ tool, active }: { tool: Tool; active: boolean }) {
  const [input, setInput] = useState(tool.sample);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [copying, setCopying] = useState(false);
  const revision = useRef(0);
  const inputId = `${tool.id}-input`;
  const outputId = `${tool.id}-output`;
  const errorId = `${tool.id}-error`;

  function updateInput(value: string) {
    revision.current++;
    setInput(value);
    setOutput("");
    setError("");
    setStatus("");
    setCopying(false);
  }

  function run(action: Action) {
    revision.current++;
    setCopying(false);
    setStatus("");
    try {
      setOutput(action.run(input));
      setError("");
      setStatus(`${action.label} complete. Output is ready.`);
    } catch (failure) {
      setOutput("");
      setError(
        failure instanceof Error
          ? failure.message
          : "Please check your input and try again.",
      );
    }
  }

  async function copy() {
    const version = revision.current;
    setCopying(true);
    setStatus("");
    try {
      await copyText(output);
      if (version === revision.current) setStatus("Copied to clipboard.");
    } catch (failure) {
      if (version === revision.current)
        setStatus(
          failure instanceof Error
            ? failure.message
            : "Copy failed. Select the output and copy it manually.",
        );
    } finally {
      if (version === revision.current) setCopying(false);
    }
  }

  return (
    <section
      className="workbench"
      id={`panel-${tool.id}`}
      hidden={!active}
      aria-labelledby={`title-${tool.id}`}
    >
      <div className="panel-heading">
        <div>
          <span className="eyebrow">{tool.category}</span>
          <h2 id={`title-${tool.id}`}>{tool.name}</h2>
          <p id={`description-${tool.id}`}>{tool.description}</p>
        </div>
        <span className="local-badge">● Runs locally</span>
      </div>
      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          run(tool.actions[0]);
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
            event.preventDefault();
            event.currentTarget.requestSubmit();
          }
        }}
      >
        <div className="editor-grid">
          <div className="editor">
            <div className="editor-label">
              <label htmlFor={inputId}>{tool.inputLabel || "Input"}</label>
              <button type="button" onClick={() => updateInput(tool.sample)}>
                Load example
              </button>
            </div>
            {tool.inputType === "number" ? (
              <div className="generator-input">
                <input
                  id={inputId}
                  type="number"
                  min={tool.min}
                  max={tool.max}
                  step={1}
                  inputMode="numeric"
                  value={input}
                  onChange={(event) => updateInput(event.target.value)}
                  aria-invalid={!!error}
                  aria-describedby={error ? errorId : `description-${tool.id}`}
                />
                <p>
                  Choose a whole number from {tool.min} to {tool.max}.
                </p>
              </div>
            ) : (
              <textarea
                id={inputId}
                value={input}
                onChange={(event) => updateInput(event.target.value)}
                spellCheck={false}
                autoCapitalize="off"
                autoCorrect="off"
                aria-invalid={!!error}
                aria-describedby={error ? errorId : `description-${tool.id}`}
              />
            )}
          </div>
          <div className="editor">
            <div className="editor-label">
              <label htmlFor={outputId}>Output</label>
              <button
                type="button"
                disabled={!output || copying}
                onClick={() => void copy()}
              >
                {copying ? "Copying…" : "Copy output"}
              </button>
            </div>
            <textarea
              id={outputId}
              value={output}
              readOnly
              placeholder="Your result will appear here."
              spellCheck={false}
              aria-describedby={`status-${tool.id}`}
            />
          </div>
        </div>
        <div className="actions">
          {tool.actions.map((action, index) => (
            <button
              className="primary"
              type={index === 0 ? "submit" : "button"}
              key={action.label}
              onClick={index === 0 ? undefined : () => run(action)}
            >
              {action.label}
              <span aria-hidden="true">↗</span>
            </button>
          ))}
        </div>
      </form>
      <p
        className="copy-status"
        id={`status-${tool.id}`}
        role="status"
        aria-live="polite"
      >
        {status}
      </p>
      {error && (
        <p id={errorId} className="error" role="alert">
          {error}
        </p>
      )}
      <div className="panel-footer">
        <span>PRIVATE BY DESIGN</span>
        <p>Your input stays on this device. No uploads. No accounts.</p>
      </div>
    </section>
  );
}

export function App() {
  const [selected, setSelected] = useState("json");
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Skip to workspace
      </a>
      <aside className="sidebar">
        <a className="brand" href="/" aria-label="Devkit home">
          <span className="brand-mark" aria-hidden="true">
            ⌘
          </span>
          devkit<span className="brand-dot">.</span>
        </a>
        <p className="sidebar-caption">LESS FRICTION. MORE FLOW.</p>
        <nav aria-label="Developer utilities">
          <span className="nav-label">YOUR TOOLBOX</span>
          {tools.map((tool, index) => (
            <button
              key={tool.id}
              type="button"
              aria-pressed={selected === tool.id}
              aria-controls={`panel-${tool.id}`}
              onClick={() => setSelected(tool.id)}
            >
              <span className="tool-number" aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
              {tool.name}
              <span className="nav-arrow" aria-hidden="true">
                ↗
              </span>
            </button>
          ))}
        </nav>
        <div className="sidebar-note">
          <span className="status-dot" />
          Built for your browser.<p>Small tools. A little more headspace.</p>
        </div>
      </aside>
      <main id="main-content" tabIndex={-1}>
        <header className="topbar">
          <span>THE DEVELOPER’S EVERYDAY CARRY</span>
          <span className="version">V 1.0 / WEB</span>
        </header>
        <div className="page-content">
          <div className="intro">
            <span className="eyebrow">
              <span className="tiny-star" aria-hidden="true">
                ✳
              </span>{" "}
              A LITTLE UTILITY GOES A LONG WAY
            </span>
            <h1>
              Good tools.
              <br />
              <em>Clear head.</em>
            </h1>
            <p>
              The small things that keep your work moving.
              <br />
              Fast, focused, and right here when you need them.
            </p>
            <div className="intro-meta">
              <span>⌘ {tools.length} focused utilities</span>
              <span>○ Zero server processing</span>
            </div>
          </div>
          {tools.map((tool) => (
            <ToolPanel
              key={tool.id}
              tool={tool}
              active={selected === tool.id}
            />
          ))}
          <footer className="page-footer">
            <span>Made for the details.</span>
            <span>DEVKIT / THINK LESS. BUILD MORE.</span>
          </footer>
        </div>
      </main>
    </div>
  );
}
