/**
 * Enhanced Session Management
 * Handles user sessions, activity tracking, and security
 */

class SessionManager {
  constructor() {
    this.sessionTimeout = 30 * 60 * 1000; // 30 minutes
    this.warningTimeout = 5 * 60 * 1000; // 5 minutes before timeout
    this.activityTimer = null;
    this.warningTimer = null;
    this.sessionData = {
      startTime: Date.now(),
      lastActivity: Date.now(),
      pageViews: 0,
      actions: 0,
      devices: [],
    };
    this.init();
  }

  init() {
    this.loadSessionData();
    this.setupActivityTracking();
    this.setupSessionMonitoring();
    this.setupVisibilityTracking();
    this.syncWithServer();
    this.cleanupExpiredSessions();
  }

  loadSessionData() {
    const stored = sessionStorage.getItem("admin_session_data");
    if (stored) {
      try {
        const data = JSON.parse(stored);
        this.sessionData = { ...this.sessionData, ...data };
      } catch (error) {
        console.error("Failed to load session data:", error);
      }
    }

    // Track page view
    this.sessionData.pageViews++;
    this.saveSessionData();
  }

  saveSessionData() {
    sessionStorage.setItem(
      "admin_session_data",
      JSON.stringify(this.sessionData),
    );
  }

  setupActivityTracking() {
    const activityEvents = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
      "click",
      "focus",
    ];

    activityEvents.forEach((event) => {
      document.addEventListener(
        event,
        () => {
          this.recordActivity();
        },
        { passive: true },
      );
    });

    // Track specific admin actions
    this.trackAdminActions();
  }

  recordActivity() {
    const now = Date.now();
    this.sessionData.lastActivity = now;

    // Reset timers
    this.resetTimers();

    // Throttle saves to avoid excessive writes
    if (!this.saveTimeout) {
      this.saveTimeout = setTimeout(() => {
        this.saveSessionData();
        this.saveTimeout = null;
      }, 1000);
    }
  }

  trackAdminActions() {
    // Track button clicks
    document.addEventListener("click", (e) => {
      if (e.target.matches('button, .btn, [role="button"]')) {
        this.trackAction("button_click", {
          text: e.target.textContent,
          id: e.target.id,
          className: e.target.className,
        });
      }
    });

    // Track form submissions
    document.addEventListener("submit", (e) => {
      this.trackAction("form_submit", {
        formId: e.target.id,
        formClass: e.target.className,
      });
    });

    // Track navigation
    document.addEventListener("click", (e) => {
      if (e.target.matches("[data-section], .menu-item, nav a")) {
        this.trackAction("navigation", {
          section: e.target.dataset?.section || e.target.textContent,
        });
      }
    });
  }

  trackAction(action, details = {}) {
    this.sessionData.actions++;

    const actionData = {
      timestamp: Date.now(),
      action,
      details,
      page: window.location.pathname,
      userAgent: navigator.userAgent,
    };

    // Send to server for analytics
    this.sendActionToServer(actionData);
  }

  async sendActionToServer(actionData) {
    try {
      await fetch("/api/admin/session/action", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(actionData),
      });
    } catch (error) {
      console.error("Failed to send action to server:", error);
    }
  }

  setupSessionMonitoring() {
    this.resetTimers();
  }

  resetTimers() {
    // Clear existing timers
    if (this.activityTimer) {
      clearTimeout(this.activityTimer);
    }
    if (this.warningTimer) {
      clearTimeout(this.warningTimer);
    }

    // Set new timers
    this.warningTimer = setTimeout(() => {
      this.showSessionWarning();
    }, this.sessionTimeout - this.warningTimeout);

    this.activityTimer = setTimeout(() => {
      this.endSession();
    }, this.sessionTimeout);
  }

  showSessionWarning() {
    const warning = this.createSessionWarning();
    document.body.appendChild(warning);

    // Start countdown
    let timeLeft = Math.floor(this.warningTimeout / 1000);
    const countdownElement = warning.querySelector(".countdown");

    const countdownInterval = setInterval(() => {
      timeLeft--;
      countdownElement.textContent = timeLeft;

      if (timeLeft <= 0) {
        clearInterval(countdownInterval);
        this.endSession();
      }
    }, 1000);

    // Store interval for cleanup
    warning.dataset.countdownInterval = countdownInterval;
  }

  createSessionWarning() {
    const warning = document.createElement("div");
    warning.className = "session-warning";
    warning.innerHTML = `
            <div class="session-warning-backdrop"></div>
            <div class="session-warning-modal">
                <div class="session-warning-content">
                    <div class="warning-icon">
                        <i class="fas fa-clock"></i>
                    </div>
                    <h3>Session Timeout Waarschuwing</h3>
                    <p>Uw sessie verloopt over <span class="countdown">300</span> seconden wegens inactiviteit.</p>
                    <div class="session-warning-actions">
                        <button class="btn btn-primary" id="extend-session">
                            <i class="fas fa-redo"></i> Verleng Sessie
                        </button>
                        <button class="btn btn-secondary" id="logout-now">
                            <i class="fas fa-sign-out-alt"></i> Nu Uitloggen
                        </button>
                    </div>
                </div>
            </div>
        `;

    // Add styles
    Object.assign(warning.style, {
      position: "fixed",
      top: "0",
      left: "0",
      width: "100%",
      height: "100%",
      zIndex: "9999",
    });

    // Bind events
    warning.querySelector("#extend-session").addEventListener("click", () => {
      this.extendSession(warning);
    });

    warning.querySelector("#logout-now").addEventListener("click", () => {
      this.logout();
    });

    return warning;
  }

  extendSession(warning) {
    // Clear countdown
    const countdownInterval = warning.dataset.countdownInterval;
    if (countdownInterval) {
      clearInterval(countdownInterval);
    }

    // Remove warning
    warning.remove();

    // Reset timers
    this.resetTimers();
    this.recordActivity();

    // Show confirmation
    this.showNotification(
      "Sessie verlengd",
      "Uw sessie is met 30 minuten verlengd.",
      "success",
    );
  }

  async endSession() {
    try {
      await fetch("/api/admin/session/end", {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Failed to end session:", error);
    }

    this.logout("Uw sessie is verlopen wegens inactiviteit.");
  }

  logout(message = "U bent uitgelogd.") {
    // Clear session data
    sessionStorage.clear();
    localStorage.removeItem("remembered_user");
    localStorage.removeItem("remembered_token");

    // Show message and redirect
    alert(message);
    window.location.href = "login.html";
  }

  setupVisibilityTracking() {
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        this.sessionData.hiddenTime = Date.now();
      } else {
        if (this.sessionData.hiddenTime) {
          const hiddenDuration = Date.now() - this.sessionData.hiddenTime;
          this.sessionData.totalHiddenTime =
            (this.sessionData.totalHiddenTime || 0) + hiddenDuration;
        }
        this.recordActivity();
      }
    });
  }

  async syncWithServer() {
    try {
      const response = await fetch("/api/admin/session/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(this.sessionData),
      });

      if (response.ok) {
        const data = await response.json();
        this.updateSessionFromServer(data);
      }
    } catch (error) {
      console.error("Failed to sync session:", error);
    }

    // Sync every 30 seconds
    setTimeout(() => this.syncWithServer(), 30000);
  }

  updateSessionFromServer(data) {
    if (data.devices) {
      this.sessionData.devices = data.devices;
    }
    if (data.settings) {
      this.sessionData.settings = data.settings;
    }
    this.saveSessionData();
  }

  async cleanupExpiredSessions() {
    try {
      await fetch("/api/admin/session/cleanup", {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Failed to cleanup sessions:", error);
    }

    // Cleanup every hour
    setTimeout(() => this.cleanupExpiredSessions(), 60 * 60 * 1000);
  }

  // Public methods for external use
  getSessionInfo() {
    return {
      duration: Date.now() - this.sessionData.startTime,
      lastActivity: this.sessionData.lastActivity,
      pageViews: this.sessionData.pageViews,
      actions: this.sessionData.actions,
      devices: this.sessionData.devices,
    };
  }

  async forceLogout(deviceId = null) {
    try {
      await fetch("/api/admin/session/force-logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ deviceId }),
      });

      this.showNotification(
        "Sessie beëindigd",
        "De geselecteerde sessie is beëindigd.",
        "success",
      );
    } catch (error) {
      console.error("Failed to force logout:", error);
      this.showNotification("Fout", "Kon sessie niet beëindigen.", "error");
    }
  }

  showNotification(title, message, type = "info") {
    // Create notification element
    const notification = document.createElement("div");
    notification.className = `session-notification ${type}`;
    notification.innerHTML = `
            <div class="notification-content">
                <h4>${title}</h4>
                <p>${message}</p>
            </div>
            <button class="notification-close">&times;</button>
        `;

    // Add styles
    Object.assign(notification.style, {
      position: "fixed",
      top: "20px",
      right: "20px",
      background:
        type === "success"
          ? "#27ae60"
          : type === "error"
            ? "#e74c3c"
            : "#3498db",
      color: "white",
      padding: "16px 20px",
      borderRadius: "8px",
      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
      zIndex: "10000",
      maxWidth: "300px",
      fontSize: "14px",
    });

    // Add close handler
    notification
      .querySelector(".notification-close")
      .addEventListener("click", () => {
        notification.remove();
      });

    document.body.appendChild(notification);

    // Auto remove after 5 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 5000);
  }

  // Device management
  async getCurrentDevice() {
    try {
      const response = await fetch("/api/admin/session/device", {
        credentials: "include",
      });

      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error("Failed to get device info:", error);
    }
    return null;
  }

  async getAllDevices() {
    try {
      const response = await fetch("/api/admin/session/devices", {
        credentials: "include",
      });

      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error("Failed to get devices:", error);
    }
    return [];
  }

  async revokeDevice(deviceId) {
    try {
      await fetch(`/api/admin/session/devices/${deviceId}/revoke`, {
        method: "POST",
        credentials: "include",
      });

      this.showNotification(
        "Apparaat ingetrokken",
        "Het apparaat is geen toegang meer tot uw account.",
        "success",
      );
    } catch (error) {
      console.error("Failed to revoke device:", error);
      this.showNotification("Fout", "Kon apparaat niet intrekken.", "error");
    }
  }
}

// Session styles
const sessionStyles = `
<style>
.session-warning-backdrop {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(4px);
}

.session-warning-modal {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: white;
    border-radius: 16px;
    padding: 0;
    max-width: 400px;
    width: 90%;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    animation: slideIn 0.3s ease;
}

@keyframes slideIn {
    from {
        opacity: 0;
        transform: translate(-50%, -50%) scale(0.9);
    }
    to {
        opacity: 1;
        transform: translate(-50%, -50%) scale(1);
    }
}

.session-warning-content {
    padding: 40px 30px;
    text-align: center;
}

.warning-icon {
    width: 64px;
    height: 64px;
    background: linear-gradient(135deg, #ff9800, #f44336);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 20px;
}

.warning-icon i {
    font-size: 28px;
    color: white;
}

.session-warning-content h3 {
    margin: 0 0 15px 0;
    color: #2c3e50;
    font-size: 20px;
}

.session-warning-content p {
    margin: 0 0 30px 0;
    color: #6c757d;
    line-height: 1.5;
}

.session-warning-actions {
    display: flex;
    gap: 12px;
}

.session-warning-actions .btn {
    flex: 1;
    padding: 12px 20px;
    border: none;
    border-radius: 8px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
}

.session-warning-actions .btn-primary {
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: white;
}

.session-warning-actions .btn-secondary {
    background: #e9ecef;
    color: #6c757d;
}

.session-warning-actions .btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.countdown {
    font-weight: bold;
    color: #f44336;
}

.session-notification {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
}

.notification-content h4 {
    margin: 0 0 4px 0;
    font-size: 14px;
    font-weight: 600;
}

.notification-content p {
    margin: 0;
    font-size: 13px;
    opacity: 0.9;
}

.notification-close {
    background: none;
    border: none;
    color: white;
    font-size: 18px;
    cursor: pointer;
    padding: 0;
    opacity: 0.8;
    transition: opacity 0.2s;
}

.notification-close:hover {
    opacity: 1;
}
</style>
`;

// Inject styles
if (!document.querySelector("#session-styles")) {
  const styleElement = document.createElement("div");
  styleElement.id = "session-styles";
  styleElement.innerHTML = sessionStyles;
  document.head.appendChild(styleElement.firstElementChild);
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  window.sessionManager = new SessionManager();
});

// Export for testing
if (typeof module !== "undefined" && module.exports) {
  module.exports = SessionManager;
}
