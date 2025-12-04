import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Suppress null/undefined errors - don't trigger error UI
    if (!error) {
      return { hasError: false };
    }

    // Suppress generic script errors
    if (error.message === 'Script error.' || error === 'Script error.') {
      return { hasError: false };
    }

    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Suppress null/undefined errors silently
    if (!error) {
      // Don't log anything for null/undefined errors
      return;
    }

    // Suppress generic "Script error" messages
    if (error.message === 'Script error.' || error === 'Script error.') {
      // Don't log generic cross-origin errors
      return;
    }

    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          width: '100vw',
          height: '100vh',
          backgroundColor: '#000',
          color: '#ff4444',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          fontFamily: 'monospace',
          padding: '20px'
        }}>
          <div style={{
            maxWidth: '800px',
            width: '100%',
            textAlign: 'left'
          }}>
            <h1 style={{
              fontSize: '32px',
              marginBottom: '20px',
              textAlign: 'center',
              color: '#ff4444',
              textShadow: '0 0 10px #ff4444'
            }}>
              ⚠️ SYSTEM ERROR ⚠️
            </h1>

            <div style={{
              backgroundColor: 'rgba(255, 68, 68, 0.1)',
              border: '2px solid #ff4444',
              borderRadius: '8px',
              padding: '20px',
              marginBottom: '20px'
            }}>
              <h2 style={{
                fontSize: '18px',
                marginBottom: '10px',
                color: '#ffaa44'
              }}>
                Error Message:
              </h2>
              <pre style={{
                fontSize: '14px',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                color: '#fff',
                marginBottom: '20px'
              }}>
                {this.state.error && this.state.error.toString()}
              </pre>

              {this.state.errorInfo && (
                <>
                  <h2 style={{
                    fontSize: '18px',
                    marginBottom: '10px',
                    color: '#ffaa44'
                  }}>
                    Component Stack:
                  </h2>
                  <pre style={{
                    fontSize: '12px',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    color: '#cccccc',
                    maxHeight: '300px',
                    overflow: 'auto'
                  }}>
                    {this.state.errorInfo.componentStack}
                  </pre>
                </>
              )}
            </div>

            <button
              onClick={() => window.location.reload()}
              style={{
                width: '100%',
                padding: '15px',
                fontSize: '16px',
                backgroundColor: '#336699',
                color: '#fff',
                border: '2px solid #4488ff',
                borderRadius: '4px',
                cursor: 'pointer',
                fontFamily: 'monospace',
                fontWeight: 'bold'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#4488ff'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#336699'}
            >
              ⟳ RELOAD APPLICATION
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
