/**
 * Enhanced Dashboard Functionality
 * Quick Actions, Notifications, and Shortcuts
 */

class EnhancedDashboard {
  constructor() {
    this.notifications = [];
    this.settings = {
      autoRefresh: true,
      soundAlerts: true,
      desktopNotifications: false,
      compactView: false,
    };
    this.refreshInterval = null;
    this.init();
  }

  init() {
    this.bindQuickActions();
    this.bindNotifications();
    this.bindQuickSettings();
    this.loadNotifications();
    this.startAutoRefresh();
    this.setupKeyboardShortcuts();
  }

  bindQuickActions() {
    // New Quote Button
    document.getElementById("new-quote-btn")?.addEventListener("click", () => {
      this.createNewQuote();
    });

    // View Chats Button
    document.getElementById("view-chats-btn")?.addEventListener("click", () => {
      this.switchToSection("chat");
      this.highlightNewChats();
    });

    // Generate Content Button
    document
      .getElementById("generate-content-btn")
      ?.addEventListener("click", () => {
        this.openContentGenerator();
      });

    // Quick Settings Button
    document
      .getElementById("quick-settings-btn")
      ?.addEventListener("click", () => {
        this.openQuickSettings();
      });
  }

  bindNotifications() {
    const notificationsBtn = document.getElementById("notifications-btn");
    const notificationDropdown = document.querySelector(
      ".notification-dropdown",
    );

    if (notificationsBtn) {
      notificationsBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.toggleNotificationDropdown();
      });
    }

    // Close dropdown when clicking outside
    document.addEventListener("click", (e) => {
      if (notificationDropdown && !notificationDropdown.contains(e.target)) {
        notificationDropdown.classList.remove("show");
      }
    });

    // Mark all as read
    document.querySelector(".mark-all-read")?.addEventListener("click", () => {
      this.markAllNotificationsRead();
    });
  }

  bindQuickSettings() {
    const modal = document.querySelector(".quick-settings-modal");
    const closeBtn = modal?.querySelector(".close-modal");

    closeBtn?.addEventListener("click", () => {
      this.closeQuickSettings();
    });

    modal?.addEventListener("click", (e) => {
      if (e.target === modal) {
        this.closeQuickSettings();
      }
    });

    // Bind setting toggles
    const toggles = modal?.querySelectorAll(".toggle-switch input");
    toggles?.forEach((toggle) => {
      toggle.addEventListener("change", (e) => {
        this.updateSetting(e.target.id, e.target.checked);
      });
    });
  }

  async loadNotifications() {
    try {
      const response = await fetch("/api/admin/notifications", {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        this.notifications = data.notifications || [];
        this.renderNotifications();
        this.updateNotificationBadge();
      }
    } catch (error) {
      console.error("Failed to load notifications:", error);
    }
  }

  renderNotifications() {
    const dropdown = document.querySelector(".notification-dropdown");
    if (!dropdown) return;

    const existingList = dropdown.querySelector(".notification-list");
    if (existingList) {
      existingList.remove();
    }

    const notificationList = document.createElement("div");
    notificationList.className = "notification-list";

    if (this.notifications.length === 0) {
      notificationList.innerHTML = `
                <div class="no-notifications">
                    <i class="fas fa-bell-slash"></i>
                    <p>Geen nieuwe notificaties</p>
                </div>
            `;
    } else {
      this.notifications.forEach((notification) => {
        const item = this.createNotificationItem(notification);
        notificationList.appendChild(item);
      });
    }

    dropdown.appendChild(notificationList);
  }

  createNotificationItem(notification) {
    const item = document.createElement("div");
    item.className = `notification-item ${notification.read ? "" : "unread"}`;

    const iconClass = this.getNotificationIcon(notification.type);
    const timeAgo = this.getTimeAgo(notification.timestamp);

    item.innerHTML = `
            <div class="notification-content">
                <div class="notification-icon ${notification.type}">
                    <i class="fas ${iconClass}"></i>
                </div>
                <div class="notification-text">
                    <div class="notification-title">${notification.title}</div>
                    <div class="notification-message">${notification.message}</div>
                    <div class="notification-time">${timeAgo}</div>
                </div>
            </div>
        `;

    item.addEventListener("click", () => {
      this.handleNotificationClick(notification);
    });

    return item;
  }

  getNotificationIcon(type) {
    const icons = {
      quote: "fa-file-invoice",
      chat: "fa-comments",
      system: "fa-cog",
      alert: "fa-exclamation-triangle",
      success: "fa-check-circle",
    };
    return icons[type] || "fa-bell";
  }

  getTimeAgo(timestamp) {
    const now = new Date();
    const time = new Date(timestamp);
    const diff = Math.floor((now - time) / 1000);

    if (diff < 60) return "zojuist";
    if (diff < 3600) return `${Math.floor(diff / 60)} min geleden`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} uur geleden`;
    return `${Math.floor(diff / 86400)} dagen geleden`;
  }

  toggleNotificationDropdown() {
    const dropdown = document.querySelector(".notification-dropdown");
    if (dropdown) {
      dropdown.classList.toggle("show");

      if (dropdown.classList.contains("show")) {
        this.loadNotifications();
      }
    }
  }

  updateNotificationBadge() {
    const badge = document.getElementById("notification-count");
    const unreadCount = this.notifications.filter((n) => !n.read).length;

    if (badge) {
      if (unreadCount > 0) {
        badge.textContent = unreadCount > 99 ? "99+" : unreadCount;
        badge.style.display = "block";
      } else {
        badge.style.display = "none";
      }
    }
  }

  async markAllNotificationsRead() {
    try {
      await fetch("/api/admin/notifications/read-all", {
        method: "POST",
        credentials: "include",
      });

      this.notifications.forEach((n) => (n.read = true));
      this.renderNotifications();
      this.updateNotificationBadge();
    } catch (error) {
      console.error("Failed to mark notifications as read:", error);
    }
  }

  async handleNotificationClick(notification) {
    if (!notification.read) {
      try {
        await fetch(`/api/admin/notifications/${notification.id}/read`, {
          method: "POST",
          credentials: "include",
        });

        notification.read = true;
        this.updateNotificationBadge();
      } catch (error) {
        console.error("Failed to mark notification as read:", error);
      }
    }

    // Navigate to relevant section
    switch (notification.type) {
      case "quote":
        this.switchToSection("quotes");
        break;
      case "chat":
        this.switchToSection("chat");
        break;
      default:
        this.switchToSection("overview");
    }

    this.toggleNotificationDropdown();
  }

  createNewQuote() {
    // Quick quote creation modal
    const modal = this.createQuickQuoteModal();
    document.body.appendChild(modal);
    modal.classList.add("show");
  }

  createQuickQuoteModal() {
    const modal = document.createElement("div");
    modal.className = "quick-quote-modal";
    modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Snelle Offerte Aanmaken</h3>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label>Klantnaam</label>
                        <input type="text" id="quick-customer-name" placeholder="Voer klantnaam in">
                    </div>
                    <div class="form-group">
                        <label>Email</label>
                        <input type="email" id="quick-customer-email" placeholder="Voer e-mailadres in">
                    </div>
                    <div class="form-group">
                        <label>Project Type</label>
                        <select id="quick-project-type">
                            <option value="ramen">Ramen</option>
                            <option value="deuren">Deuren</option>
                            <option value="renovatie">Renovatie</option>
                            <option value="nieuwbouw">Nieuwbouw</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Beschrijving</label>
                        <textarea id="quick-description" rows="3" placeholder="Korte beschrijving van het project"></textarea>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" id="cancel-quote">Annuleren</button>
                    <button class="btn btn-primary" id="save-quote">Offerte Aanmaken</button>
                </div>
            </div>
        `;

    // Bind events
    modal.querySelector(".close-modal").addEventListener("click", () => {
      modal.remove();
    });

    modal.querySelector("#cancel-quote").addEventListener("click", () => {
      modal.remove();
    });

    modal.querySelector("#save-quote").addEventListener("click", () => {
      this.saveQuickQuote(modal);
    });

    return modal;
  }

  async saveQuickQuote(modal) {
    const quoteData = {
      customerName: document.getElementById("quick-customer-name").value,
      email: document.getElementById("quick-customer-email").value,
      projectType: document.getElementById("quick-project-type").value,
      description: document.getElementById("quick-description").value,
    };

    if (!quoteData.customerName || !quoteData.email) {
      this.showAlert("Vul verplichte velden in", "error");
      return;
    }

    try {
      const response = await fetch("/api/admin/quotes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(quoteData),
      });

      if (response.ok) {
        this.showAlert("Offerte succesvol aangemaakt!", "success");
        modal.remove();
        this.switchToSection("quotes");
        this.refreshQuotes();
      } else {
        throw new Error("Failed to create quote");
      }
    } catch (error) {
      console.error("Error creating quote:", error);
      this.showAlert("Offerte aanmaken mislukt", "error");
    }
  }

  openContentGenerator() {
    // Open AI Dashboard in new tab or redirect
    window.open("ai-dashboard.html", "_blank");
    this.showAlert("AI Dashboard geopend", "info");
  }

  openQuickSettings() {
    const modal = document.querySelector(".quick-settings-modal");
    if (modal) {
      modal.classList.add("show");
      this.loadSettingsIntoModal();
    }
  }

  closeQuickSettings() {
    const modal = document.querySelector(".quick-settings-modal");
    if (modal) {
      modal.classList.remove("show");
    }
  }

  loadSettingsIntoModal() {
    Object.keys(this.settings).forEach((key) => {
      const toggle = document.getElementById(key);
      if (toggle) {
        toggle.checked = this.settings[key];
      }
    });
  }

  async updateSetting(key, value) {
    this.settings[key] = value;

    try {
      await fetch("/api/admin/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ [key]: value }),
      });

      // Apply setting changes
      this.applySettingChange(key, value);
    } catch (error) {
      console.error("Failed to save setting:", error);
    }
  }

  applySettingChange(key, value) {
    switch (key) {
      case "autoRefresh":
        if (value) {
          this.startAutoRefresh();
        } else {
          this.stopAutoRefresh();
        }
        break;
      case "desktopNotifications":
        if (value) {
          this.requestNotificationPermission();
        }
        break;
      case "compactView":
        document.body.classList.toggle("compact-view", value);
        break;
    }
  }

  async requestNotificationPermission() {
    if ("Notification" in window && Notification.permission === "default") {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        this.settings.desktopNotifications = false;
        document.getElementById("desktopNotifications").checked = false;
      }
    }
  }

  startAutoRefresh() {
    if (this.settings.autoRefresh && !this.refreshInterval) {
      this.refreshInterval = setInterval(() => {
        this.refreshDashboardData();
      }, 30000); // Refresh every 30 seconds
    }
  }

  stopAutoRefresh() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
  }

  async refreshDashboardData() {
    try {
      const response = await fetch("/api/admin/dashboard-data", {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        this.updateDashboardStats(data);
        this.checkForNewNotifications();
      }
    } catch (error) {
      console.error("Failed to refresh dashboard:", error);
    }
  }

  updateDashboardStats(data) {
    // Update header stats
    const statsElements = {
      visitors: document.querySelector(
        ".header-stats .stat-item:first-child span",
      ),
      chats: document.querySelector(
        ".header-stats .stat-item:nth-child(2) span",
      ),
      avgTime: document.querySelector(
        ".header-stats .stat-item:nth-child(3) span",
      ),
    };

    if (statsElements.visitors)
      statsElements.visitors.textContent = data.visitors || "127";
    if (statsElements.chats)
      statsElements.chats.textContent = data.chats || "23";
    if (statsElements.avgTime)
      statsElements.avgTime.textContent = data.avgTime || "2.3m";
  }

  async checkForNewNotifications() {
    const currentCount = this.notifications.filter((n) => !n.read).length;
    await this.loadNotifications();
    const newCount = this.notifications.filter((n) => !n.read).length;

    if (newCount > currentCount) {
      this.showDesktopNotification(
        "Nieuwe notificaties",
        `U heeft ${newCount - currentCount} nieuwe notificaties`,
      );
    }
  }

  showDesktopNotification(title, body) {
    if (
      this.settings.desktopNotifications &&
      "Notification" in window &&
      Notification.permission === "granted"
    ) {
      new Notification(title, {
        body: body,
        icon: "/favicon.ico",
        badge: "/favicon.ico",
      });
    }
  }

  setupKeyboardShortcuts() {
    document.addEventListener("keydown", (e) => {
      // Ctrl/Cmd + K for quick search
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        this.openQuickSearch();
      }

      // Ctrl/Cmd + N for new quote
      if ((e.ctrlKey || e.metaKey) && e.key === "n") {
        e.preventDefault();
        this.createNewQuote();
      }

      // Ctrl/Cmd + / for shortcuts help
      if ((e.ctrlKey || e.metaKey) && e.key === "/") {
        e.preventDefault();
        this.showShortcutsHelp();
      }

      // Escape to close modals
      if (e.key === "Escape") {
        this.closeAllModals();
      }
    });
  }

  openQuickSearch() {
    // Implement quick search functionality
    this.showAlert("Quick search coming soon!", "info");
  }

  showShortcutsHelp() {
    const shortcuts = [
      { key: "Ctrl + K", description: "Quick search" },
      { key: "Ctrl + N", description: "Nieuwe offerte" },
      { key: "Ctrl + /", description: "Sneltoetsen" },
      { key: "Escape", description: "Sluit modals" },
    ];

    let html = '<div class="shortcuts-list">';
    shortcuts.forEach((shortcut) => {
      html += `
                <div class="shortcut-item">
                    <kbd>${shortcut.key}</kbd>
                    <span>${shortcut.description}</span>
                </div>
            `;
    });
    html += "</div>";

    this.showAlert(html, "info", "Sneltoetsen");
  }

  closeAllModals() {
    document
      .querySelectorAll(
        ".modal.show, .quick-settings-modal.show, .quick-quote-modal",
      )
      .forEach((modal) => {
        modal.classList.remove("show");
        if (modal.classList.contains("quick-quote-modal")) {
          modal.remove();
        }
      });
  }

  switchToSection(sectionName) {
    const menuItem = document.querySelector(`[data-section="${sectionName}"]`);
    if (menuItem) {
      menuItem.click();
    }
  }

  highlightNewChats() {
    // Add visual indication for new chats
    const chatSection = document.getElementById("chat-section");
    if (chatSection) {
      chatSection.classList.add("highlight-new");
      setTimeout(() => {
        chatSection.classList.remove("highlight-new");
      }, 3000);
    }
  }

  async refreshQuotes() {
    // Trigger quotes refresh
    const refreshBtn = document.getElementById("refresh-quotes");
    if (refreshBtn) {
      refreshBtn.click();
    }
  }

  showAlert(message, type = "info", title = "") {
    // Create and show alert notification
    const alert = document.createElement("div");
    alert.className = `alert alert-${type}`;
    alert.innerHTML = `
            ${title ? `<strong>${title}</strong><br>` : ""}
            ${message}
        `;

    // Style the alert
    Object.assign(alert.style, {
      position: "fixed",
      top: "20px",
      right: "20px",
      background:
        type === "error"
          ? "#e74c3c"
          : type === "success"
            ? "#27ae60"
            : "#3498db",
      color: "white",
      padding: "12px 20px",
      borderRadius: "8px",
      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
      zIndex: "3000",
      maxWidth: "300px",
      fontSize: "14px",
      lineHeight: "1.4",
    });

    document.body.appendChild(alert);

    // Auto remove after 3 seconds
    setTimeout(() => {
      if (alert.parentNode) {
        alert.parentNode.removeChild(alert);
      }
    }, 3000);
  }
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  window.enhancedDashboard = new EnhancedDashboard();
});

// Export for testing
if (typeof module !== "undefined" && module.exports) {
  module.exports = EnhancedDashboard;
}
