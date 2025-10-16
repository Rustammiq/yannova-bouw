// Global Error Handler for Yannovabouw
class ErrorHandler {
  constructor() {
    this.init();
  }

  init() {
    // Global error handler
    window.addEventListener('error', (event) => {
      this.handleError(event.error, 'JavaScript Error');
    });

    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      this.handleError(event.reason, 'Unhandled Promise Rejection');
    });

    // Fetch error handler
    this.interceptFetch();
  }

  handleError(error, type) {
    console.error(`${type}:`, error);

    // Send to analytics if available
    if (typeof gtag !== 'undefined') {
      gtag('event', 'exception', {
        'description': error.message || error,
        'fatal': false
      });
    }

    // Show user-friendly message for critical errors
    if (this.isCriticalError(error)) {
      this.showUserError();
    }
  }

  isCriticalError(error) {
    // Define what constitutes a critical error
    const criticalPatterns = [
      'NetworkError',
      'Failed to fetch',
      'ChunkLoadError',
      'Loading chunk'
    ];

    return criticalPatterns.some(pattern =>
      error.message && error.message.includes(pattern)
    );
  }

  showUserError() {
    // Create error notification
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-notification';
    errorDiv.innerHTML = `
            <div class="error-content">
                <i class="fas fa-exclamation-triangle"></i>
                <span>Er is een probleem opgetreden. De pagina wordt opnieuw geladen.</span>
                <button onclick="window.location.reload()" class="retry-btn">Opnieuw laden</button>
            </div>
        `;

    // Add styles
    const style = document.createElement('style');
    style.textContent = `
            .error-notification {
                position: fixed;
                top: 20px;
                right: 20px;
                background: #ff4444;
                color: white;
                padding: 1rem;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                z-index: 10000;
                max-width: 400px;
                animation: slideIn 0.3s ease;
            }

            .error-content {
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }

            .retry-btn {
                background: rgba(255,255,255,0.2);
                border: 1px solid rgba(255,255,255,0.3);
                color: white;
                padding: 0.25rem 0.5rem;
                border-radius: 4px;
                cursor: pointer;
                font-size: 0.8rem;
            }

            .retry-btn:hover {
                background: rgba(255,255,255,0.3);
            }

            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;

    document.head.appendChild(style);
    document.body.appendChild(errorDiv);

    // Auto-remove after 10 seconds
    setTimeout(() => {
      if (errorDiv.parentNode) {
        errorDiv.parentNode.removeChild(errorDiv);
      }
    }, 10000);
  }

  interceptFetch() {
    const originalFetch = window.fetch;
    window.fetch = async(...args) => {
      try {
        const response = await originalFetch(...args);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return response;
      } catch (error) {
        this.handleError(error, 'Fetch Error');
        throw error;
      }
    };
  }
}

// Initialize error handler
document.addEventListener('DOMContentLoaded', () => {
  new ErrorHandler();
});
