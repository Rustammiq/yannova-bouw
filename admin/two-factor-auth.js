/**
 * Two-Factor Authentication Implementation
 * Supports TOTP, SMS, and Email verification
 */

class TwoFactorAuth {
  constructor() {
    this.selectedMethod = "app";
    this.verificationCode = "";
    this.backupCodes = [];
    this.init();
  }

  init() {
    this.bindEvents();
    this.setupVerificationInput();
    this.generateBackupCodes();
    this.checkExisting2FA();
  }

  bindEvents() {
    // Auth method selection
    document.querySelectorAll(".auth-method").forEach((method) => {
      method.addEventListener("click", () => {
        this.selectAuthMethod(method.dataset.method);
      });
    });

    // Verify button
    document.getElementById("verify-btn")?.addEventListener("click", () => {
      this.verifyCode();
    });

    // Cancel button
    document.getElementById("cancel-btn")?.addEventListener("click", () => {
      this.cancelSetup();
    });

    // Download backup codes
    document
      .querySelector(".backup-codes .btn")
      ?.addEventListener("click", () => {
        this.downloadBackupCodes();
      });

    // Trust device checkbox
    document.getElementById("trust-device")?.addEventListener("change", (e) => {
      this.handleTrustDevice(e.target.checked);
    });
  }

  setupVerificationInput() {
    const inputs = document.querySelectorAll(".verification-input input");

    inputs.forEach((input, index) => {
      input.addEventListener("input", (e) => {
        const value = e.target.value;

        if (value.length === 1 && /^\d$/.test(value)) {
          // Move to next input
          if (index < inputs.length - 1) {
            inputs[index + 1].focus();
          }
          this.verificationCode += value;
        } else if (value.length === 0) {
          // Handle backspace
          this.verificationCode = this.verificationCode.slice(0, -1);
          if (index > 0) {
            inputs[index - 1].focus();
          }
        } else {
          // Invalid input
          e.target.value = "";
        }
      });

      input.addEventListener("keydown", (e) => {
        if (e.key === "Backspace" && !e.target.value && index > 0) {
          inputs[index - 1].focus();
        }

        if (e.key === "Enter" && this.verificationCode.length === 6) {
          this.verifyCode();
        }
      });

      // Handle paste
      input.addEventListener("paste", (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData("text").replace(/\D/g, "");

        if (pastedData.length === 6) {
          pastedData.split("").forEach((digit, i) => {
            if (inputs[i]) {
              inputs[i].value = digit;
            }
          });
          this.verificationCode = pastedData;
          inputs[5].focus();
        }
      });
    });
  }

  selectAuthMethod(method) {
    this.selectedMethod = method;

    // Update UI
    document.querySelectorAll(".auth-method").forEach((el) => {
      el.classList.remove("selected");
    });
    document
      .querySelector(`[data-method="${method}"]`)
      ?.classList.add("selected");

    // Update QR code based on method
    this.updateQRCode(method);
  }

  updateQRCode(method) {
    const qrContainer = document.getElementById("qr-container");
    if (!qrContainer) return;

    switch (method) {
      case "app":
        qrContainer.innerHTML = `
                    <div class="qr-code">
                        <i class="fas fa-qrcode" style="font-size: 64px; color: #ccc;"></i>
                    </div>
                    <p><strong>Scan deze QR code met uw authenticator app</strong></p>
                    <p style="font-size: 12px; color: #6c757d; margin-top: 10px;">
                        Kan niet scannen? Voer handmatig deze code in:<br>
                        <code style="background: #f8f9fa; padding: 4px 8px; border-radius: 4px;">JBSWY3DPEHPK3PXP</code>
                    </p>
                `;
        break;

      case "sms":
        qrContainer.innerHTML = `
                    <div style="text-align: center; padding: 40px;">
                        <i class="fas fa-sms" style="font-size: 64px; color: #667eea; margin-bottom: 20px;"></i>
                        <h4>Verificatie via SMS</h4>
                        <p style="color: #6c757d; margin: 10px 0;">
                            Voer uw telefoonnummer in om een verificatiecode te ontvangen
                        </p>
                        <input type="tel" placeholder="+31 6 12345678" style="
                            width: 100%;
                            padding: 12px;
                            border: 2px solid #e9ecef;
                            border-radius: 8px;
                            font-size: 16px;
                            margin: 10px 0;
                        ">
                        <button class="btn btn-primary" style="width: 100%;" onclick="twoFactorAuth.sendSMSCode()">
                            Verstuur Code
                        </button>
                    </div>
                `;
        break;

      case "email":
        qrContainer.innerHTML = `
                    <div style="text-align: center; padding: 40px;">
                        <i class="fas fa-envelope" style="font-size: 64px; color: #667eea; margin-bottom: 20px;"></i>
                        <h4>Verificatie via E-mail</h4>
                        <p style="color: #6c757d; margin: 10px 0;">
                            Een verificatiecode wordt verstuurd naar uw e-mailadres
                        </p>
                        <button class="btn btn-primary" style="width: 100%;" onclick="twoFactorAuth.sendEmailCode()">
                            Verstuur Code
                        </button>
                    </div>
                `;
        break;
    }
  }

  async sendSMSCode() {
    const phoneInput = document.querySelector('input[type="tel"]');
    if (!phoneInput || !phoneInput.value) {
      this.showError("Voer een geldig telefoonnummer in");
      return;
    }

    try {
      const response = await fetch("/api/admin/2fa/send-sms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ phoneNumber: phoneInput.value }),
      });

      const data = await response.json();

      if (data.success) {
        this.showSuccess("Verificatiecode verstuurd via SMS");
        this.showVerificationInput();
      } else {
        this.showError(data.message || "Code versturen mislukt");
      }
    } catch (error) {
      console.error("SMS error:", error);
      this.showError("SMS service niet beschikbaar");
    }
  }

  async sendEmailCode() {
    try {
      const response = await fetch("/api/admin/2fa/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      const data = await response.json();

      if (data.success) {
        this.showSuccess("Verificatiecode verstuurd via e-mail");
        this.showVerificationInput();
      } else {
        this.showError(data.message || "Code versturen mislukt");
      }
    } catch (error) {
      console.error("Email error:", error);
      this.showError("E-mail service niet beschikbaar");
    }
  }

  showVerificationInput() {
    const qrContainer = document.getElementById("qr-container");
    if (!qrContainer) return;

    qrContainer.innerHTML = `
            <div style="text-align: center; padding: 20px;">
                <i class="fas fa-shield-alt" style="font-size: 48px; color: #27ae60; margin-bottom: 20px;"></i>
                <h4>Voer de verificatiecode in</h4>
                <p style="color: #6c757d; margin: 10px 0;">
                    Controleer uw ${this.selectedMethod === "sms" ? "SMS" : "e-mail"} voor de 6-cijferige code
                </p>
            </div>
        `;
  }

  async verifyCode() {
    if (this.verificationCode.length !== 6) {
      this.showError("Voer een complete 6-cijferige code in");
      return;
    }

    const trustDevice =
      document.getElementById("trust-device")?.checked || false;

    try {
      const response = await fetch("/api/admin/2fa/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          code: this.verificationCode,
          method: this.selectedMethod,
          trustDevice,
        }),
      });

      const data = await response.json();

      if (data.success) {
        this.showSuccess("Twee-factor authenticatie succesvol ingesteld!");
        setTimeout(() => {
          window.location.href = "dashboard.html";
        }, 2000);
      } else {
        this.showError(data.message || "Ongeldige verificatiecode");
        this.resetVerificationInput();
      }
    } catch (error) {
      console.error("Verification error:", error);
      this.showError("Verificatie mislukt. Probeer het opnieuw.");
    }
  }

  resetVerificationInput() {
    this.verificationCode = "";
    document.querySelectorAll(".verification-input input").forEach((input) => {
      input.value = "";
    });
    document.querySelector(".verification-input input")?.focus();
  }

  generateBackupCodes() {
    this.backupCodes = [];
    for (let i = 0; i < 8; i++) {
      const code = Math.random().toString(36).substring(2, 10).toUpperCase();
      this.backupCodes.push(code);
    }
    this.updateBackupCodesDisplay();
  }

  updateBackupCodesDisplay() {
    const codeItems = document.querySelectorAll(".code-item");
    codeItems.forEach((item, index) => {
      if (this.backupCodes[index]) {
        const formatted = this.backupCodes[index].match(/.{1,4}/g).join("-");
        item.textContent = formatted;
      }
    });
  }

  downloadBackupCodes() {
    const content = `Yannova Admin Backup Codes\n\n${this.backupCodes.join("\n")}\n\nBewaar deze codes op een veilige plek.\nGenerated: ${new Date().toLocaleString()}`;

    const blob = new Blob([content], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `yannova-backup-codes-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    this.showSuccess("Backup codes gedownload");
  }

  async handleTrustDevice(trusted) {
    try {
      await fetch("/api/admin/2fa/trust-device", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ trusted }),
      });
    } catch (error) {
      console.error("Trust device error:", error);
    }
  }

  async checkExisting2FA() {
    try {
      const response = await fetch("/api/admin/2fa/status", {
        credentials: "include",
      });

      const data = await response.json();

      if (data.enabled) {
        // Redirect to verification if 2FA is already enabled
        window.location.href = "verify-2fa.html";
      }
    } catch (error) {
      console.error("2FA status check error:", error);
    }
  }

  cancelSetup() {
    if (confirm("Weet u zeker dat u de setup wilt annuleren?")) {
      window.location.href = "dashboard.html";
    }
  }

  showError(message) {
    this.showAlert(message, "error");
  }

  showSuccess(message) {
    this.showAlert(message, "success");
  }

  showAlert(message, type) {
    // Remove existing alerts
    const existingAlert = document.querySelector(".alert");
    if (existingAlert) {
      existingAlert.remove();
    }

    const alert = document.createElement("div");
    alert.className = `alert alert-${type}`;
    alert.innerHTML = `
            <i class="fas ${type === "error" ? "fa-exclamation-circle" : "fa-check-circle"}"></i>
            ${message}
        `;

    // Style the alert
    Object.assign(alert.style, {
      position: "fixed",
      top: "20px",
      right: "20px",
      background: type === "error" ? "#e74c3c" : "#27ae60",
      color: "white",
      padding: "12px 20px",
      borderRadius: "8px",
      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
      zIndex: "3000",
      maxWidth: "300px",
      fontSize: "14px",
      display: "flex",
      alignItems: "center",
      gap: "10px",
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
  window.twoFactorAuth = new TwoFactorAuth();
});

// Export for testing
if (typeof module !== "undefined" && module.exports) {
  module.exports = TwoFactorAuth;
}
