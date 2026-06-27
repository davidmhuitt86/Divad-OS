import { Component, type ReactNode } from 'react'

interface Props { children: ReactNode; page: string }
interface State { error: Error | null }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 12, padding: 24 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#ef4444' }}>Page error — {this.props.page}</div>
          <div style={{ fontSize: 11, color: '#475569', fontFamily: 'monospace', background: '#13161e', border: '1px solid #1a1e28', borderRadius: 6, padding: '10px 14px', maxWidth: 600, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
            {this.state.error.message}
          </div>
          <button
            onClick={() => this.setState({ error: null })}
            style={{ fontSize: 11, color: '#3b82f6', background: 'none', border: '1px solid #3b82f666', borderRadius: 5, padding: '5px 12px', cursor: 'pointer' }}
          >
            Retry
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
