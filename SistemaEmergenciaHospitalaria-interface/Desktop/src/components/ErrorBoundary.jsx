import { Component } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo })
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }
    if (import.meta.env.DEV) {
      console.error('[ErrorBoundary]', error, errorInfo)
    }
  }

  handleReset() {
    this.setState({ hasError: false, error: null, errorInfo: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '3rem 2rem',
          margin: '2rem auto',
          maxWidth: '500px',
          background: 'white',
          borderRadius: '12px',
          border: '1px solid #fecaca',
          textAlign: 'center',
        }}>
          <AlertTriangle size={48} style={{ color: '#ef4444', marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#991b1b', marginBottom: '0.5rem' }}>
            Ocurrió un error inesperado
          </h3>
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.5rem' }}>
            {this.state.error?.message || 'Error desconocido'}
          </p>
          <details style={{ marginBottom: '1.5rem', fontSize: '0.75rem', color: '#94a3b8', maxWidth: '100%', overflow: 'auto' }}>
            <summary style={{ cursor: 'pointer' }}>Detalles técnicos</summary>
            <pre style={{ marginTop: '0.5rem', whiteSpace: 'pre-wrap', textAlign: 'left' }}>
              {this.state.errorInfo?.componentStack || 'Sin información adicional'}
            </pre>
          </details>
          <button
            onClick={() => this.handleReset()}
            style={{
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              padding: '10px 24px',
              borderRadius: '8px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '0.85rem',
            }}
          >
            <RefreshCw size={16} />
            Reintentar
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
