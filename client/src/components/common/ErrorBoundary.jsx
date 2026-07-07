import { Component } from 'react'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary:', error, errorInfo)
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null })
    window.location.reload()
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '2rem',
          fontFamily: 'system-ui, sans-serif',
          textAlign: 'center',
          backgroundColor: '#f8f9fa',
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '2rem',
            maxWidth: '500px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          }}>
            <h1 style={{ fontSize: '1.5rem', color: '#dc3545', marginBottom: '1rem' }}>
              Algo salió mal
            </h1>
            <p style={{ color: '#6c757d', marginBottom: '1.5rem' }}>
              Ha ocurrido un error inesperado. Puedes intentar recargar la página o volver al inicio.
            </p>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <pre style={{
                textAlign: 'left',
                background: '#f1f3f5',
                padding: '1rem',
                borderRadius: '8px',
                fontSize: '0.85rem',
                color: '#495057',
                overflow: 'auto',
                maxHeight: '200px',
                marginBottom: '1.5rem',
              }}>
                {this.state.error.message}
              </pre>
            )}
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button
                onClick={this.handleReset}
                style={{
                  padding: '0.5rem 1.5rem',
                  border: '1px solid #dee2e6',
                  borderRadius: '8px',
                  background: 'white',
                  cursor: 'pointer',
                  fontSize: '0.95rem',
                }}
              >
                Volver
              </button>
              <button
                onClick={this.handleReload}
                style={{
                  padding: '0.5rem 1.5rem',
                  border: 'none',
                  borderRadius: '8px',
                  background: '#0d6efd',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '0.95rem',
                }}
              >
                Recargar página
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
