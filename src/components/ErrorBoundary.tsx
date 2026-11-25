import { Component, type ReactNode } from 'react';
import { CONTACT } from '../data/content';

interface State {
  failed: boolean;
}

/** Branded fallback if a page crashes, so visitors still get a way to reach the team. */
export class ErrorBoundary extends Component<{ children: ReactNode; resetKey?: string }, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    console.error('Page error:', error);
  }

  componentDidUpdate(prev: { resetKey?: string }) {
    // navigating to another page clears the error
    if (prev.resetKey !== this.props.resetKey && this.state.failed) this.setState({ failed: false });
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <section className="status-page" role="alert">
        <div className="hero__sky" aria-hidden="true" />
        <div className="container status-page__inner">
          <p className="status-page__code" aria-hidden="true">
            Oops
          </p>
          <h1 className="page-hero__title">Something went wrong on this page.</h1>
          <p className="page-hero__lead">
            Please reload the page. If it keeps happening, reach us on <a href={CONTACT.phoneHref}>{CONTACT.phoneDisplay}</a> or{' '}
            <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>.
          </p>
          <div className="page-hero__actions">
            <button type="button" className="btn btn--light" onClick={() => location.reload()}>
              Reload page
            </button>
            <a href="/" className="btn btn--ghost">
              Back to home
            </a>
          </div>
        </div>
      </section>
    );
  }
}
