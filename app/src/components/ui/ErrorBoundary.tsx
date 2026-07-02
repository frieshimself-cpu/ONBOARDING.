import { Component, type ReactNode } from 'react'

interface State {
  error: Error | null
}

export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  render() {
    if (this.state.error) {
      return (
        <div className="mx-auto max-w-lg px-4 py-32 text-center">
          <div className="font-mono text-xs uppercase tracking-[0.3em] text-flare">
            runtime error
          </div>
          <h1 className="display mt-3 text-3xl">Something broke.</h1>
          <p className="mx-auto mt-3 max-w-sm text-sm text-muted">
            {this.state.error.message}
          </p>
          <button
            onClick={() => {
              this.setState({ error: null })
              window.location.href = '/'
            }}
            className="mt-8 rounded-full bg-brand px-6 py-2.5 text-sm font-bold text-ink"
          >
            Back to safety
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
