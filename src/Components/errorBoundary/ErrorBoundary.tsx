import { Component } from "react";
import type { ReactNode } from "react";
import { isChunkLoadError } from "./isChunkLoadError";
import "./ErrorBoundary.css";

type ErrorBoundaryProps = {
  children: ReactNode;
  /** When this value changes (for example the URL path), the boundary clears its error. */
  resetKey?: string;
};

type ErrorBoundaryState = {
  error: Error | null;
};

// Catches render errors below it and shows a recovery screen instead of a blank page.
// Plain <a> and <button> only (no router hooks), so it also works outside the router.
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
    return { error: error instanceof Error ? error : new Error(String(error)) };
  }

  componentDidUpdate(prev: ErrorBoundaryProps) {
    if (this.state.error && prev.resetKey !== this.props.resetKey) {
      this.setState({ error: null });
    }
  }

  // A failed file never recovers by re-rendering (React remembers the failure),
  // so for those the button reloads the page. Anything else just tries again.
  handleRetry = () => {
    if (isChunkLoadError(this.state.error)) {
      window.location.reload();
    } else {
      this.setState({ error: null });
    }
  };

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    const loadFailed = isChunkLoadError(error);
    return (
      <div className="errorboundary_wrap" role="alert">
        <h1 className="errorboundary_title">
          {loadFailed ? "This page did not load" : "Something went wrong"}
        </h1>
        <p className="errorboundary_text">
          {loadFailed
            ? "Check your connection and try again."
            : "Please try again. If it keeps happening, go back to the home page."}
        </p>
        <div className="errorboundary_actions">
          <button
            type="button"
            className="errorboundary_button errorboundary_button_primary"
            onClick={this.handleRetry}
          >
            {loadFailed ? "Reload page" : "Try again"}
          </button>
          <a className="errorboundary_button" href="/">
            Go to home
          </a>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
