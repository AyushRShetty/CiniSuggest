import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Simple error boundary component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    console.error("React rendering error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          padding: '20px', 
          backgroundColor: '#f8d7da', 
          color: '#721c24',
          borderRadius: '5px',
          margin: '20px',
          fontFamily: 'sans-serif'
        }}>
          <h2>Something went wrong.</h2>
          <details style={{ whiteSpace: 'pre-wrap', marginTop: '10px' }}>
            <summary>Show Error Details</summary>
            <p>{this.state.error && this.state.error.toString()}</p>
            <p>Component Stack:</p>
            <pre>{this.state.errorInfo && this.state.errorInfo.componentStack}</pre>
          </details>
        </div>
      );
    }
    return this.props.children;
  }
}

// Fallback component in case App fails to mount
const FallbackApp = () => (
  <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
    <h1>CiniSuggest Emergency Fallback</h1>
    <p>The main application has encountered a critical error.</p>
    <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f8d7da', borderRadius: '5px' }}>
      <h3>Troubleshooting Steps:</h3>
      <ol style={{ marginLeft: '20px' }}>
        <li>Check the browser console for error messages (F12 &gt; Console tab)</li>
        <li>Verify that the environment variables are correctly set (.env.local file with VITE_ prefix)</li>
        <li>Make sure all dependencies are installed (run npm install)</li>
        <li>Try clearing browser cache and reloading</li>
      </ol>
      <button 
        onClick={() => window.location.reload()} 
        style={{ 
          marginTop: '10px', 
          padding: '8px 16px', 
          backgroundColor: '#dc3545', 
          color: 'white', 
          border: 'none', 
          borderRadius: '4px', 
          cursor: 'pointer' 
        }}
      >
        Reload Application
      </button>
    </div>
  </div>
);

// Try to render the main app, fall back to simple page if it fails completely
try {
  const root = ReactDOM.createRoot(document.getElementById('root'));
  
  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>,
  );
} catch (error) {
  console.error("Fatal error rendering App:", error);
  // If ReactDOM.createRoot fails or root.render fails, render a fallback directly
  document.getElementById('root').innerHTML = '';
  const fallbackRoot = document.getElementById('root');
  
  if (fallbackRoot) {
    const fallbackDiv = document.createElement('div');
    fallbackRoot.appendChild(fallbackDiv);
    
    // Render a simple fallback using plain React.render
    ReactDOM.render(<FallbackApp />, fallbackDiv);
  }
} 