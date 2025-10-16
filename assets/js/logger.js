/**
 * Simple logging utility for frontend
 * Replaces console statements with proper logging
 */

class Logger {
  constructor() {
    this.isDevelopment = process.env.NODE_ENV !== 'production';
  }

  info(message, data = {}) {
    if (this.isDevelopment) {

    }
    // In production, send to logging service
  }

  warn(message, data = {}) {
    if (this.isDevelopment) {

    }
    // In production, send to logging service
  }

  error(message, data = {}) {
    if (this.isDevelopment) {
      console.error('[ERROR]', message, data);
    }
    // In production, send to logging service
  }

  debug(message, data = {}) {
    if (this.isDevelopment) {

    }
  }
}

// Create global logger instance
window.logger = new Logger();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Logger;
}
