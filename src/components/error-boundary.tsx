import { Component, type ReactNode } from "react";
import { Button } from "./button";
export class ErrorBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <main className="fatal-error">
        <h1>Let’s give that another try.</h1>
        <p>
          The workspace couldn’t load. Reload to start a fresh session. Unsaved
          drafts will be cleared.
        </p>
        <Button variant="primary" onClick={() => window.location.reload()}>
          Reload workspace
        </Button>
      </main>
    ) : (
      this.props.children
    );
  }
}
