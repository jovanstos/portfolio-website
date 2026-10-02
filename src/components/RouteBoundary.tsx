import { Component, type ReactNode } from "react";
import { Link } from "react-router-dom";
export default class RouteBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <main className="error-boundary">
        <h1>Seems something hit a snag.</h1>
        <p>Try reloading, or try soemthing else.</p>
        <button
          className="primary-button"
          onClick={() => window.location.reload()}
        >
          Reload page
        </button>{" "}
        <Link className="secondary-button button-link" to="/">
          Back to the Home Page
        </Link>
      </main>
    ) : (
      this.props.children
    );
  }
}
