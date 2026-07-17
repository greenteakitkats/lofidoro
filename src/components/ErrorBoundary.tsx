import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  /** shown above the reload button; keep it short and blame-free */
  fallbackLabel?: string
}

interface State {
  error: Error | null
}

/**
 * Safety net against uncaught render errors. Without this, a single bad
 * value flowing into JSX (a malformed Spotify payload, for instance)
 * unmounts the whole tree and leaves a blank page with no way back except
 * a manual reload. Used both around risky, less-tested subtrees (Spotify)
 * so the core timer/room survive them misbehaving, and once at the app
 * root as the last line of defense.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: { componentStack?: string | null }) {
    console.error('lofidoro crashed:', error, info.componentStack)
  }

  render() {
    if (this.state.error) {
      return (
        <div className="crash-fallback">
          <p>{this.props.fallbackLabel ?? 'Something went sideways'} — sorry about that.</p>
          <button className="btn btn-primary" onClick={() => window.location.reload()}>
            reload
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
