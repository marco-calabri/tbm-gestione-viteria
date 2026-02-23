
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('App crash:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f8fafc',
          padding: '2rem'
        }}>
          <div style={{
            background: 'white',
            border: '1px solid #fee2e2',
            borderRadius: '1rem',
            padding: '2rem',
            maxWidth: '600px',
            width: '100%',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,.1)'
          }}>
            <h1 style={{ color: '#dc2626', marginBottom: '1rem', fontSize: '1.25rem', fontWeight: 700 }}>
              ⚠️ Errore di avvio
            </h1>
            <pre style={{
              background: '#fef2f2',
              padding: '1rem',
              borderRadius: '0.5rem',
              fontSize: '0.75rem',
              overflow: 'auto',
              color: '#991b1b',
              whiteSpace: 'pre-wrap'
            }}>
              {this.state.error?.message}
            </pre>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>
  );
}
