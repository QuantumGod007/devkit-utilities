import { useEffect, useRef, useState } from "react";
import { tools, searchTools } from "./tools/registry";
import { toolIds, type ToolId } from "./types";
import { ToolWorkbench } from "./components/tool-workbench";
import { ToastProvider } from "./components/toast";
import { Icon } from "./components/icon";
import { ErrorBoundary } from "./components/error-boundary";
function selectedFromUrl(): ToolId {
  const id = window.location.hash.slice(1);
  return toolIds.find((value) => value === id) || "json";
}
function WorkspaceApp() {
  const [selected, setSelected] = useState<ToolId>(selectedFromUrl);
  const [query, setQuery] = useState("");
  const search = useRef<HTMLInputElement>(null);
  const navigation = useRef<HTMLElement>(null);
  const filtered = searchTools(query);
  const active = tools.find((tool) => tool.id === selected)!;
  useEffect(() => {
    const sync = () => {
      const id = toolIds.find(
        (value) => value === window.location.hash.slice(1),
      );
      if (id) setSelected(id);
    };
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);
  useEffect(() => {
    document.title = `${active.name} — Devkit`;
  }, [active.name]);
  useEffect(() => {
    const shortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        search.current?.focus();
        search.current?.select();
      }
    };
    window.addEventListener("keydown", shortcut);
    return () => window.removeEventListener("keydown", shortcut);
  }, []);
  useEffect(() => {
    const keepSelectionVisible = () => {
      const nav = navigation.current;
      const button = nav?.querySelector<HTMLButtonElement>(
        '[aria-pressed="true"]',
      );
      if (!nav || !button || nav.scrollWidth <= nav.clientWidth) return;
      const left =
        button.getBoundingClientRect().left -
        nav.getBoundingClientRect().left +
        nav.scrollLeft;
      if (
        left < nav.scrollLeft ||
        left + button.offsetWidth > nav.scrollLeft + nav.clientWidth
      )
        nav.scrollTo({ left: Math.max(0, left - 4), behavior: "instant" });
    };
    keepSelectionVisible();
    window.addEventListener("resize", keepSelectionVisible);
    return () => window.removeEventListener("resize", keepSelectionVisible);
  }, [selected, query]);
  function select(id: ToolId) {
    setSelected(id);
    window.location.hash = id;
  }
  return (
    <div className="app-shell">
      <a
        className="skip-link"
        href="#main-content"
        onClick={(event) => {
          event.preventDefault();
          document.getElementById("main-content")?.focus();
        }}
      >
        Skip to workspace
      </a>
      <aside className="sidebar">
        <a
          className="brand"
          href="#json"
          title="Devkit home"
          onClick={() => setSelected("json")}
        >
          <span className="brand-mark" aria-hidden="true">
            ⌘
          </span>
          devkit<span className="brand-dot">.</span>
          <span className="brand-version">TOOLBOX / 01</span>
        </a>
        <p className="sidebar-caption">SMALL TOOLS. BETTER FLOW.</p>
        <div className="tool-search">
          <Icon name="search" size={16} />
          <label className="sr-only" htmlFor="tool-search">
            Search tools
          </label>
          <input
            ref={search}
            id="tool-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Find a tool…"
            autoComplete="off"
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                setQuery("");
                search.current?.focus();
              }
              if (event.key === "ArrowDown") {
                event.preventDefault();
                navigation.current
                  ?.querySelector<HTMLButtonElement>("button")
                  ?.focus();
              }
              if (event.key === "Enter" && filtered[0]) {
                event.preventDefault();
                select(filtered[0].id);
                document.getElementById("main-content")?.focus();
              }
            }}
          />
          {query ? (
            <button
              type="button"
              className="icon-button"
              aria-label="Clear tool search"
              onClick={() => {
                setQuery("");
                search.current?.focus();
              }}
            >
              <Icon name="close" size={13} />
            </button>
          ) : (
            <kbd>⌘K</kbd>
          )}
        </div>
        <div className="nav-heading">
          <span>THE ESSENTIALS</span>
          <span>{filtered.length.toString().padStart(2, "0")}</span>
        </div>
        <p className="sr-only" aria-live="polite">
          {query ? `${filtered.length} tools match your search.` : ""}
        </p>
        <nav
          ref={navigation}
          aria-label="Developer utilities"
          onKeyDown={(event) => {
            if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key))
              return;
            const buttons = Array.from(
              event.currentTarget.querySelectorAll<HTMLButtonElement>("button"),
            );
            const index = buttons.indexOf(
              document.activeElement as HTMLButtonElement,
            );
            if (index === -1 || !buttons.length) return;
            event.preventDefault();
            buttons[
              event.key === "Home"
                ? 0
                : event.key === "End"
                  ? buttons.length - 1
                  : (index +
                      (event.key === "ArrowDown" ? 1 : -1) +
                      buttons.length) %
                    buttons.length
            ]?.focus();
          }}
        >
          {filtered.map((tool) => (
            <button
              key={tool.id}
              type="button"
              aria-pressed={selected === tool.id}
              aria-controls={`panel-${tool.id}`}
              onClick={() => select(tool.id)}
            >
              <Icon name={tool.id} size={17} />
              <span>{tool.name}</span>
              <span className="nav-indicator" aria-hidden="true">
                ↗
              </span>
            </button>
          ))}
        </nav>
        {!filtered.length && (
          <div className="search-empty">
            <Icon name="search" size={24} />
            <h2>No tools by that name.</h2>
            <p>Try “JSON”, “color”, or “writing”.</p>
            <button
              type="button"
              onClick={() => {
                setQuery("");
                search.current?.focus();
              }}
            >
              Clear search <span aria-hidden="true">↗</span>
            </button>
          </div>
        )}
        <div className="sidebar-note">
          <span className="privacy-symbol">
            <Icon name="shield" size={20} />
          </span>
          <strong>A private little workspace.</strong>
          <p>
            Your work stays in your browser.
            <br />
            No accounts. No trips to a server.
          </p>
          <span className="online-label">
            <span className="status-dot" />
            ALL SYSTEMS LOCAL
          </span>
        </div>
        <a
          className="source-link"
          href="https://github.com/QuantumGod007/devkit-utilities"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Icon name="github" size={16} />
          View source on GitHub<span aria-hidden="true">↗</span>
        </a>
      </aside>
      <main id="main-content" tabIndex={-1}>
        <header className="topbar">
          <div className="breadcrumb">
            <span>Workspace</span>
            <span aria-hidden="true">/</span>
            <strong>{active.name}</strong>
          </div>
          <span className="topbar-note">
            <span className="status-dot" />A little less friction.
          </span>
        </header>
        <div className="page-content">
          <div className="intro">
            <div>
              <span className="eyebrow">
                <Icon name="spark" size={14} />
                THE DEVELOPER’S EVERYDAY CARRY
              </span>
              <h1>
                Good tools. <em>Clear head.</em>
              </h1>
              <p>Ten small ways to keep a good idea moving.</p>
            </div>
            <div className="intro-counter">
              <strong>{tools.length.toString().padStart(2, "0")}</strong>
              <span>
                FOCUSED TOOLS.
                <br />
                ZERO DISTRACTIONS.
              </span>
            </div>
          </div>
          {tools.map((tool) => (
            <ToolWorkbench
              key={tool.id}
              tool={tool}
              active={selected === tool.id}
            />
          ))}
          <div className="workspace-note">
            <Icon name="spark" size={16} />
            <p>Built for the little things between the big things.</p>
            <span>INPUT → POSSIBILITY</span>
          </div>
          <footer className="page-footer">
            <span>Devkit. Thoughtfully small.</span>
            <span>Local processing. Public source. Yours to explore.</span>
          </footer>
        </div>
      </main>
    </div>
  );
}
export function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <WorkspaceApp />
      </ToastProvider>
    </ErrorBoundary>
  );
}
