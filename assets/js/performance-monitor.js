// Performance Monitoring for Yannovabouw
class PerformanceMonitor {
  constructor() {
    this.metrics = {};
    this.init();
  }

  init() {
    // Wait for page load
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () =>
        this.startMonitoring()
      );
    } else {
      this.startMonitoring();
    }
  }

  startMonitoring() {
    this.measurePageLoad();
    this.measureResourceTiming();
    this.measureUserInteractions();
    this.setupPerformanceObserver();
  }

  measurePageLoad() {
    // Core Web Vitals
    this.measureLCP(); // Largest Contentful Paint
    this.measureFID(); // First Input Delay
    this.measureCLS(); // Cumulative Layout Shift
    this.measureFCP(); // First Contentful Paint
  }

  measureLCP() {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.metrics.lcp = lastEntry.startTime;
        this.logMetric('LCP', lastEntry.startTime);
      });
      observer.observe({ entryTypes: ['largest-contentful-paint'] });
    }
  }

  measureFID() {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          this.metrics.fid = entry.processingStart - entry.startTime;
          this.logMetric('FID', this.metrics.fid);
        });
      });
      observer.observe({ entryTypes: ['first-input'] });
    }
  }

  measureCLS() {
    if ('PerformanceObserver' in window) {
      let clsValue = 0;
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        }
        this.metrics.cls = clsValue;
        this.logMetric('CLS', clsValue);
      });
      observer.observe({ entryTypes: ['layout-shift'] });
    }
  }

  measureFCP() {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.name === 'first-contentful-paint') {
            this.metrics.fcp = entry.startTime;
            this.logMetric('FCP', entry.startTime);
          }
        });
      });
      observer.observe({ entryTypes: ['paint'] });
    }
  }

  measureResourceTiming() {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (
            entry.initiatorType === 'script' ||
            entry.initiatorType === 'link'
          ) {
            this.logResourceTiming(entry);
          }
        });
      });
      observer.observe({ entryTypes: ['resource'] });
    }
  }

  measureUserInteractions() {
    // Track button clicks
    document.addEventListener('click', (e) => {
      if (e.target.matches('button, .btn, a[href^="#"]')) {
        this.logInteraction(
          'click',
          e.target.textContent || e.target.className
        );
      }
    });

    // Track form submissions
    document.addEventListener('submit', (e) => {
      this.logInteraction('form_submit', e.target.className || 'unknown_form');
    });

    // Track scroll depth
    let maxScroll = 0;
    window.addEventListener('scroll', () => {
      const scrollPercent = Math.round(
        (window.scrollY / (document.body.scrollHeight - window.innerHeight)) *
          100
      );
      if (scrollPercent > maxScroll) {
        maxScroll = scrollPercent;
        this.metrics.maxScrollDepth = maxScroll;
      }
    });
  }

  setupPerformanceObserver() {
    // Monitor long tasks
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.duration > 50) {
            // Tasks longer than 50ms
            this.logMetric('Long Task', entry.duration);
          }
        });
      });
      observer.observe({ entryTypes: ['longtask'] });
    }
  }

  logMetric(name, value) {
    // Send to analytics if available
    if (typeof gtag !== 'undefined') {
      gtag('event', 'performance_metric', {
        metric_name: name,
        metric_value: Math.round(value),
        page_location: window.location.href
      });
    }
  }

  logResourceTiming(entry) {
    const loadTime = entry.responseEnd - entry.startTime;
    if (loadTime > 1000) {
      // Resources taking longer than 1s
    }
  }

  logInteraction(type, target) {
    if (typeof gtag !== 'undefined') {
      gtag('event', 'user_interaction', {
        interaction_type: type,
        interaction_target: target,
        page_location: window.location.href
      });
    }
  }

  // Get performance summary
  getPerformanceSummary() {
    return {
      ...this.metrics,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      connection: navigator.connection
        ? {
          effectiveType: navigator.connection.effectiveType,
          downlink: navigator.connection.downlink
        }
        : null
    };
  }

  // Export performance data
  exportData() {
    const data = this.getPerformanceSummary();
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `performance-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
}

// Initialize performance monitoring
const performanceMonitor = new PerformanceMonitor();

// Make it globally available for debugging
window.performanceMonitor = performanceMonitor;

// Log performance summary after page load
window.addEventListener('load', () => {
  setTimeout(() => {
    performanceMonitor.logPerformanceSummary();
  }, 2000);
});
