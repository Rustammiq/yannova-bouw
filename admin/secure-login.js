/**
 * Secure Admin Login with Enhanced Security Features
 * Implements CSRF protection, rate limiting, and security monitoring
 */

class SecureAdminLogin {
  constructor() {
    this.maxAttempts = 3;
    this.attempts = 0;
    this.lockoutTime = 5 * 60 * 1000; // 5 minutes
    this.csrfToken = null;
    this.init();
  }

  init() {
    this.bindEvents();
    this.checkExistingSession();
    this.setupSecurity();
    this.loadRememberedCredentials();
    this.fetchCSRFToken();
  }

  async fetchCSRFToken() {
    try {
      const response = await fetch("/api/csrf-token", {
        method: "GET",
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        this.csrfToken = data.token;
        this.setCSRFTokenInForm();
      }
    } catch (error) {
      console.error("Failed to fetch CSRF token:", error);
    }
  }

  setCSRFTokenInForm() {
    const form = document.getElementById("login-form");
    if (form && this.csrfToken) {
      // Remove existing CSRF token input
      const existingToken = form.querySelector('input[name="_csrf"]');
      if (existingToken) {
        existingToken.remove();
      }

      // Add new CSRF token input
      const csrfInput = document.createElement("input");
      csrfInput.type = "hidden";
      csrfInput.name = "_csrf";
      csrfInput.value = this.csrfToken;
      form.appendChild(csrfInput);
    }
  }

  bindEvents() {
    const form = document.getElementById("login-form");
    const passwordToggle = document.getElementById("password-toggle");
    const passwordInput = document.getElementById("password");

    form.addEventListener("submit", (e) => this.handleLogin(e));
    passwordToggle.addEventListener("click", () =>
      this.togglePasswordVisibility(),
    );

    // Social login buttons
    document
      .getElementById("google-login")
      ?.addEventListener("click", () => this.handleSocialLogin("google"));
    document
      .getElementById("microsoft-login")
      ?.addEventListener("click", () => this.handleSocialLogin("microsoft"));
    document
      .getElementById("github-login")
      ?.addEventListener("click", () => this.handleSocialLogin("github"));

    // Quick access buttons
    document
      .getElementById("biometric-login")
      ?.addEventListener("click", () => this.handleBiometricLogin());
    document
      .getElementById("magic-link-login")
      ?.addEventListener("click", () => this.handleMagicLinkLogin());

    // Auto-focus on username field
    document.getElementById("username").focus();

    // Handle Enter key
    document.addEventListener("keypress", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        form.dispatchEvent(new Event("submit"));
      }
    });

    // Real-time password strength checking
    passwordInput.addEventListener("input", (e) => {
      this.checkPasswordStrength(e.target.value);
    });
  }

  setupSecurity() {
    // Disable right-click
    document.addEventListener("contextmenu", (e) => e.preventDefault());

    // Disable F12 and other dev tools shortcuts
    document.addEventListener("keydown", (e) => {
      if (
        e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && e.key === "I") ||
        (e.ctrlKey && e.shiftKey && e.key === "C") ||
        (e.ctrlKey && e.key === "U")
      ) {
        e.preventDefault();
        this.showSecurityWarning();
      }
    });

    // Disable text selection
    document.addEventListener("selectstart", (e) => e.preventDefault());

    // Add security headers
    this.addSecurityHeaders();
  }

  addSecurityHeaders() {
    // Add security meta tags
    const metaTags = [
      { name: "referrer", content: "strict-origin-when-cross-origin" },
      { name: "x-frame-options", content: "DENY" },
      { name: "x-content-type-options", content: "nosniff" },
    ];

    metaTags.forEach((tag) => {
      const meta = document.createElement("meta");
      meta.setAttribute("name", tag.name);
      meta.setAttribute("content", tag.content);
      document.head.appendChild(meta);
    });
  }

  showSecurityWarning() {
    const warning = document.createElement("div");
    warning.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #ff4444;
            color: white;
            padding: 20px;
            border-radius: 10px;
            z-index: 10000;
            font-weight: bold;
            text-align: center;
            box-shadow: 0 4px 20px rgba(0,0,0,0.5);
        `;
    warning.textContent =
      "Toegang geweigerd - Ongeautoriseerde activiteit gedetecteerd";
    document.body.appendChild(warning);

    setTimeout(() => {
      if (document.body.contains(warning)) {
        document.body.removeChild(warning);
      }
    }, 3000);
  }

  async handleLogin(e) {
    e.preventDefault();

    if (this.isLockedOut()) {
      this.showError("Te veel mislukte pogingen. Probeer het later opnieuw.");
      return;
    }

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;
    const rememberMe = document.getElementById("remember-me").checked;

    if (!username || !password) {
      this.showError("Vul alle velden in.");
      return;
    }

    // Validate input
    if (!this.validateInput(username, password)) {
      return;
    }

    this.showLoading(true);

    try {
      const response = await this.submitLogin(username, password, rememberMe);

      if (response.success) {
        this.handleSuccessfulLogin(username, rememberMe, response);
      } else {
        this.handleFailedLogin(response.message);
      }
    } catch (error) {
      console.error("Login error:", error);
      this.showError("Er is een fout opgetreden. Probeer het opnieuw.");
    } finally {
      this.showLoading(false);
    }
  }

  validateInput(username, password) {
    // Username validation
    if (username.length < 3 || username.length > 50) {
      this.showError("Gebruikersnaam moet tussen 3 en 50 tekens zijn.");
      return false;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      this.showError(
        "Gebruikersnaam mag alleen letters, cijfers en underscores bevatten.",
      );
      return false;
    }

    // Password validation
    if (password.length < 6) {
      this.showError("Wachtwoord moet minimaal 6 tekens bevatten.");
      return false;
    }

    return true;
  }

  async submitLogin(username, password, rememberMe) {
    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": this.csrfToken || "",
      },
      credentials: "include",
      body: JSON.stringify({
        username,
        password,
        rememberMe,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Login failed");
    }

    return data;
  }

  handleSuccessfulLogin(username, rememberMe, response) {
    // Store session
    sessionStorage.setItem("admin_token", response.token);
    sessionStorage.setItem("admin_user", JSON.stringify(response.user));
    sessionStorage.setItem("login_time", Date.now().toString());

    if (rememberMe) {
      localStorage.setItem("remembered_user", username);
      localStorage.setItem("remembered_token", response.token);
    }

    // Reset attempts
    this.attempts = 0;
    localStorage.removeItem("login_attempts");
    localStorage.removeItem("lockout_time");

    // Show success animation
    document.getElementById("login-btn").classList.add("success-animation");

    // Log successful login
    this.logSecurityEvent("SUCCESSFUL_LOGIN", { username });

    // Redirect to dashboard
    setTimeout(() => {
      window.location.href = "dashboard.html";
    }, 1000);
  }

  handleFailedLogin(message) {
    this.attempts++;
    localStorage.setItem("login_attempts", this.attempts.toString());

    if (this.attempts >= this.maxAttempts) {
      const lockoutTime = Date.now() + this.lockoutTime;
      localStorage.setItem("lockout_time", lockoutTime.toString());
      this.showError(
        `Te veel mislukte pogingen. Probeer het over ${Math.ceil(this.lockoutTime / 60000)} minuten opnieuw.`,
      );

      // Log security event
      this.logSecurityEvent("ACCOUNT_LOCKED", { attempts: this.attempts });
    } else {
      const remaining = this.maxAttempts - this.attempts;
      this.showError(`${message} ${remaining} poging(en) over.`);

      // Log failed attempt
      this.logSecurityEvent("FAILED_LOGIN", { attempts: this.attempts });
    }

    // Clear password field
    document.getElementById("password").value = "";
    document.getElementById("password").focus();

    // Refresh CSRF token after failed attempt
    this.fetchCSRFToken();
  }

  checkPasswordStrength(password) {
    const strengthIndicator = document.getElementById("password-strength");
    if (!strengthIndicator) return;

    const strength = this.calculatePasswordStrength(password);
    const strengthText = [
      "Zeer zwak",
      "Zwak",
      "Gemiddeld",
      "Sterk",
      "Zeer sterk",
    ];
    const strengthColors = [
      "#ff4444",
      "#ff8800",
      "#ffaa00",
      "#88cc00",
      "#00aa00",
    ];

    strengthIndicator.textContent = strengthText[strength - 1];
    strengthIndicator.style.color = strengthColors[strength - 1];
  }

  calculatePasswordStrength(password) {
    let strength = 0;

    if (password.length >= 6) strength++;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    return Math.min(strength, 5);
  }

  checkExistingSession() {
    const token = sessionStorage.getItem("admin_token");
    const loginTime = sessionStorage.getItem("login_time");

    if (token && loginTime) {
      const sessionAge = Date.now() - parseInt(loginTime);
      const maxSessionAge = 8 * 60 * 60 * 1000; // 8 hours

      if (sessionAge < maxSessionAge) {
        // Valid session exists, redirect to dashboard
        window.location.href = "dashboard.html";
      } else {
        // Session expired, clear it
        this.clearSession();
      }
    }
  }

  loadRememberedCredentials() {
    const rememberedUser = localStorage.getItem("remembered_user");
    if (rememberedUser) {
      document.getElementById("username").value = rememberedUser;
      document.getElementById("remember-me").checked = true;
      document.getElementById("password").focus();
    }
  }

  isLockedOut() {
    const lockoutTime = localStorage.getItem("lockout_time");
    if (lockoutTime) {
      const remaining = parseInt(lockoutTime) - Date.now();
      if (remaining > 0) {
        return true;
      } else {
        // Lockout expired, clear it
        localStorage.removeItem("lockout_time");
        localStorage.removeItem("login_attempts");
        this.attempts = 0;
      }
    }
    return false;
  }

  showLoading(show) {
    const btn = document.getElementById("login-btn");
    const btnText = btn.querySelector(".btn-text");
    const btnLoader = btn.querySelector(".btn-loader");

    if (show) {
      btn.disabled = true;
      btnText.style.display = "none";
      btnLoader.style.display = "inline-block";
    } else {
      btn.disabled = false;
      btnText.style.display = "inline-block";
      btnLoader.style.display = "none";
    }
  }

  showError(message) {
    const errorDiv = document.getElementById("error-message");
    const errorText = document.getElementById("error-text");

    errorText.textContent = message;
    errorDiv.style.display = "flex";

    // Auto-hide after 5 seconds
    setTimeout(() => {
      errorDiv.style.display = "none";
    }, 5000);
  }

  togglePasswordVisibility() {
    const passwordInput = document.getElementById("password");
    const toggleBtn = document.getElementById("password-toggle");
    const icon = toggleBtn.querySelector("i");

    if (passwordInput.type === "password") {
      passwordInput.type = "text";
      icon.classList.remove("fa-eye");
      icon.classList.add("fa-eye-slash");
    } else {
      passwordInput.type = "password";
      icon.classList.remove("fa-eye-slash");
      icon.classList.add("fa-eye");
    }
  }

  clearSession() {
    sessionStorage.removeItem("admin_token");
    sessionStorage.removeItem("admin_user");
    sessionStorage.removeItem("login_time");
  }

  async handleSocialLogin(provider) {
    try {
      this.showLoading(true);

      // OAuth flow for social login
      const authUrl = this.getSocialAuthUrl(provider);
      const popup = window.open(
        authUrl,
        "social-login",
        "width=500,height=600,scrollbars=yes,resizable=yes",
      );

      // Listen for popup close
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed);
          this.showLoading(false);
          this.showError("Social login geannuleerd");
        }
      }, 1000);

      // Listen for message from popup
      window.addEventListener("message", (event) => {
        if (event.origin === window.location.origin) {
          clearInterval(checkClosed);
          popup.close();

          if (event.data.success) {
            this.handleSuccessfulLogin(event.data.user, true, event.data);
          } else {
            this.showError(event.data.message || "Social login mislukt");
          }
          this.showLoading(false);
        }
      });
    } catch (error) {
      console.error("Social login error:", error);
      this.showError("Social login niet beschikbaar");
      this.showLoading(false);
    }
  }

  getSocialAuthUrl(provider) {
    const baseUrl = window.location.origin;
    const redirectUri = encodeURIComponent(
      `${baseUrl}/admin/auth/callback/${provider}`,
    );

    switch (provider) {
      case "google":
        return `https://accounts.google.com/oauth/authorize?client_id=YOUR_GOOGLE_CLIENT_ID&redirect_uri=${redirectUri}&response_type=code&scope=openid email profile`;
      case "microsoft":
        return `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=YOUR_MICROSOFT_CLIENT_ID&redirect_uri=${redirectUri}&response_type=code&scope=openid email profile`;
      case "github":
        return `https://github.com/login/oauth/authorize?client_id=YOUR_GITHUB_CLIENT_ID&redirect_uri=${redirectUri}&scope=user:email`;
      default:
        throw new Error("Unsupported provider");
    }
  }

  async handleBiometricLogin() {
    if (!window.PublicKeyCredential) {
      this.showError("Biometrische login niet ondersteund op dit apparaat");
      return;
    }

    try {
      const btn = document.getElementById("biometric-login");
      btn.classList.add("scanning");

      // WebAuthn API for biometric authentication
      const credential = await navigator.credentials.get({
        publicKey: {
          challenge: new Uint8Array(32),
          allowCredentials: [
            {
              type: "public-key",
              id: new Uint8Array(32),
              transports: ["internal", "usb", "nfc", "ble"],
            },
          ],
          userVerification: "required",
          timeout: 60000,
        },
      });

      if (credential) {
        // Send credential to server for verification
        const response = await fetch("/api/admin/biometric-verify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-CSRF-Token": this.csrfToken || "",
          },
          credentials: "include",
          body: JSON.stringify({
            credentialId: credential.id,
            response: credential.response,
          }),
        });

        const data = await response.json();
        if (data.success) {
          this.handleSuccessfulLogin("biometric_user", true, data);
        } else {
          this.showError("Biometrische verificatie mislukt");
        }
      }
    } catch (error) {
      console.error("Biometric login error:", error);
      this.showError("Biometrische login mislukt");
    } finally {
      document.getElementById("biometric-login")?.classList.remove("scanning");
    }
  }

  async handleMagicLinkLogin() {
    const email = prompt("Voer uw e-mailadres in voor de magic link:");
    if (!email) return;

    try {
      const btn = document.getElementById("magic-link-login");
      btn.classList.add("loading");

      const response = await fetch("/api/admin/magic-link", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": this.csrfToken || "",
        },
        credentials: "include",
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        this.showSuccess("Magic link verzonden! Controleer uw e-mail.");

        // Start polling for magic link validation
        this.pollMagicLinkValidation();
      } else {
        this.showError(data.message || "Magic link verzenden mislukt");
      }
    } catch (error) {
      console.error("Magic link error:", error);
      this.showError("Magic link niet beschikbaar");
    } finally {
      document.getElementById("magic-link-login")?.classList.remove("loading");
    }
  }

  pollMagicLinkValidation() {
    const checkInterval = setInterval(async () => {
      try {
        const response = await fetch("/api/admin/magic-link-status", {
          credentials: "include",
        });

        const data = await response.json();

        if (data.validated) {
          clearInterval(checkInterval);
          this.handleSuccessfulLogin("magic_link_user", true, data);
        }
      } catch (error) {
        console.error("Magic link polling error:", error);
      }
    }, 3000);

    // Stop polling after 5 minutes
    setTimeout(
      () => {
        clearInterval(checkInterval);
      },
      5 * 60 * 1000,
    );
  }

  showSuccess(message) {
    const errorDiv = document.getElementById("error-message");
    const errorText = document.getElementById("error-text");
    const icon = errorDiv.querySelector("i");

    icon.className = "fas fa-check-circle";
    errorText.textContent = message;
    errorDiv.style.background = "rgba(76, 175, 80, 0.1)";
    errorDiv.style.border = "1px solid rgba(76, 175, 80, 0.3)";
    errorDiv.style.color = "#4caf50";
    errorDiv.style.display = "flex";

    setTimeout(() => {
      errorDiv.style.display = "none";
      icon.className = "fas fa-exclamation-triangle";
      errorDiv.style.background = "";
      errorDiv.style.border = "";
      errorDiv.style.color = "";
    }, 5000);
  }

  logSecurityEvent(event, details) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      event,
      details,
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    console.log("SECURITY EVENT:", logEntry);

    // Send to server for logging
    fetch("/api/admin/security-log", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": this.csrfToken || "",
      },
      credentials: "include",
      body: JSON.stringify(logEntry),
    }).catch((error) => {
      console.error("Failed to log security event:", error);
    });
  }
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  window.secureAdminLogin = new SecureAdminLogin();
});

// Auto-logout after inactivity
let inactivityTimer;
const resetInactivityTimer = () => {
  clearTimeout(inactivityTimer);
  inactivityTimer = setTimeout(
    () => {
      if (sessionStorage.getItem("admin_token")) {
        alert("U bent automatisch uitgelogd vanwege inactiviteit.");
        window.location.href = "login.html";
      }
    },
    30 * 60 * 1000,
  ); // 30 minutes
};

document.addEventListener("mousemove", resetInactivityTimer);
document.addEventListener("keypress", resetInactivityTimer);
document.addEventListener("click", resetInactivityTimer);

// Prevent back button
window.addEventListener("popstate", () => {
  if (sessionStorage.getItem("admin_token")) {
    history.pushState(null, null, window.location.href);
  }
});

// Export for testing
if (typeof module !== "undefined" && module.exports) {
  module.exports = SecureAdminLogin;
}
