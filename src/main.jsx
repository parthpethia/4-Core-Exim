import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import './index.css'
import App from './App.jsx'

// Catch and display global Javascript errors on the screen for easy debugging
window.addEventListener('error', (event) => {
  const root = document.getElementById('root');
  if (root) {
    root.innerHTML = `
      <div style="padding: 24px; max-width: 800px; margin: 40px auto; color: #C62828; font-family: system-ui, sans-serif; background: #FFEBEE; border: 1px solid #FFCDD2; border-radius: 12px; shadow: 0 4px 12px rgba(0,0,0,0.1);">
        <h2 style="margin-top: 0; font-size: 20px; font-weight: 800;">4Core Exim - Application Error Detected</h2>
        <p style="font-weight: 600; font-size: 14px; margin-bottom: 8px;">Error: ${event.message}</p>
        <div style="font-size: 11px; color: #374151; margin-bottom: 12px;">
          <strong>Source:</strong> ${event.filename}:${event.lineno}:${event.colno}
        </div>
        <pre style="background: #ffffff; padding: 16px; border: 1px solid #E5E7EB; border-radius: 8px; font-size: 12px; overflow: auto; max-height: 400px; white-space: pre-wrap; font-family: monospace;">${event.error ? event.error.stack : 'No stack trace details available.'}</pre>
        <p style="font-size: 11px; color: #4B5563; margin-top: 16px; border-t: 1px solid #FFCDD2; padding-top: 12px;">
          This diagnostic box intercepts runtime crashes. If you see this, please report the trace text above.
        </p>
      </div>
    `;
  }
});

window.addEventListener('unhandledrejection', (event) => {
  const root = document.getElementById('root');
  if (root) {
    root.innerHTML = `
      <div style="padding: 24px; max-width: 800px; margin: 40px auto; color: #C62828; font-family: system-ui, sans-serif; background: #FFEBEE; border: 1px solid #FFCDD2; border-radius: 12px; shadow: 0 4px 12px rgba(0,0,0,0.1);">
        <h2 style="margin-top: 0; font-size: 20px; font-weight: 800;">4Core Exim - Promise Rejection Detected</h2>
        <p style="font-weight: 600; font-size: 14px; margin-bottom: 8px;">Rejection Reason: ${event.reason}</p>
        <pre style="background: #ffffff; padding: 16px; border: 1px solid #E5E7EB; border-radius: 8px; font-size: 12px; overflow: auto; max-height: 400px; white-space: pre-wrap; font-family: monospace;">${event.reason && event.reason.stack ? event.reason.stack : 'No stack trace details available.'}</pre>
        <p style="font-size: 11px; color: #4B5563; margin-top: 16px; border-t: 1px solid #FFCDD2; padding-top: 12px;">
          This diagnostic box intercepts unhandled async exceptions. If you see this, please report the trace text above.
        </p>
      </div>
    `;
  }
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </StrictMode>,
)
