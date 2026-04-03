import { StrictMode, Component } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }
  componentDidCatch(error, info) {
    console.error('[VeloType] React crash:', error, info.componentStack)
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 40, textAlign: 'center', color: '#f87171', fontFamily: 'monospace' }}>
          <h2>Something went wrong</h2>
          <pre style={{ fontSize: 12, color: '#888', marginTop: 16, whiteSpace: 'pre-wrap', maxWidth: 600, margin: '16px auto' }}>
            {this.state.error?.message}
          </pre>
          <button onClick={() => { this.setState({ hasError: false, error: null }); window.location.reload() }}
            style={{ marginTop: 20, padding: '8px 20px', borderRadius: 8, border: '1px solid #f87171', color: '#f87171', background: 'transparent', cursor: 'pointer' }}>
            Reload
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
