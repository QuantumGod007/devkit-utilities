import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { safeMarkdownUrl } from "../tools/markdown";
import { Icon } from "./icon";
export default function MarkdownPreview({ source }: { source: string }) {
  if (!source.trim())
    return (
      <div className="preview-empty">
        <Icon name="markdown" size={30} />
        <h3>A blank page. A good start.</h3>
        <p>Add a heading, a list, or your next big idea.</p>
      </div>
    );
  return (
    <article className="markdown-body" aria-label="Rendered Markdown">
      <Markdown
        remarkPlugins={[remarkGfm]}
        skipHtml
        urlTransform={safeMarkdownUrl}
        components={{
          h1: ({ children, id }) => <h3 id={id}>{children}</h3>,
          h2: ({ children, id }) => <h4 id={id}>{children}</h4>,
          h3: ({ children, id }) => <h5 id={id}>{children}</h5>,
          h4: ({ children, id }) => <h6 id={id}>{children}</h6>,
          h5: ({ children, id }) => <h6 id={id}>{children}</h6>,
          h6: ({ children, id }) => <h6 id={id}>{children}</h6>,
          a: ({
            href,
            children,
            id,
            title,
            "aria-label": label,
            "aria-describedby": description,
          }) =>
            href ? (
              <a
                href={href}
                id={id}
                title={title}
                aria-label={label}
                aria-describedby={description}
                onClick={(event) => {
                  if (!href.startsWith("#")) return;
                  event.preventDefault();
                  try {
                    const target = document.getElementById(
                      decodeURIComponent(href.slice(1)),
                    );
                    if (target) {
                      target.tabIndex = -1;
                      target.scrollIntoView({
                        block: "nearest",
                        behavior: "instant",
                      });
                      target.focus({ preventScroll: true });
                    }
                  } catch {
                    /* A malformed fragment has no navigation target. */
                  }
                }}
                target={href.startsWith("#") ? undefined : "_blank"}
                rel="noopener noreferrer"
              >
                {children}
              </a>
            ) : (
              <span>{children}</span>
            ),
          img: ({ alt }) => (
            <span className="markdown-image-placeholder">
              <Icon name="shield" size={16} />
              Image: {alt || "untitled"}{" "}
              <small>External images are not loaded.</small>
            </span>
          ),
          input: ({ checked }) => (
            <input
              type="checkbox"
              disabled
              checked={checked}
              aria-label={checked ? "Completed task" : "Incomplete task"}
            />
          ),
          table: ({ children }) => (
            <div className="table-scroll">
              <table>{children}</table>
            </div>
          ),
        }}
      >
        {source}
      </Markdown>
    </article>
  );
}
