// Admin Login JavaScript
class AdminLogin {
    constructor() {
        this.maxAttempts = 3;
        this.attempts = 0;
        this.lockoutTime = 5 * 60 * 1000; // 5 minutes
        this.init();
    }

    init() {
        this.bindEvents();
        this.checkExistingSession();
        this.setupSecurity();
        this.loadRememberedCredentials();
    }

    bindEvents() {
        const form = document.getElementById('login-form');
        const passwordToggle = document.getElementById('password-toggle');
        const passwordInput = document.getElementById('password');

        form.addEventListener('submit', (e) => this.handleLogin(e));
        passwordToggle.addEventListener('click', () => this.togglePasswordVisibility());
        
        // Auto-focus on username field
        document.getElementById('username').focus();

        // Handle Enter key
        document.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                form.dispatchEvent(new Event('submit'));
            }
        });
    }

    setupSecurity() {
        // Disable right-click
        document.addEventListener('contextmenu', (e) => e.preventDefault());
        
        // Disable F12 and other dev tools shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'F12' || 
                (e.ctrlKey && e.shiftKey && e.key === 'I') ||
                (e.ctrlKey && e.shiftKey && e.key === 'C') ||
                (e.ctrlKey && e.key === 'U')) {
                e.preventDefault();
                this.showSecurityWarning();
            }
        });

        // Disable text selection
        document.addEventListener('selectstart', (e) => e.preventDefault());
    }

    showSecurityWarning() {
        const warning = document.createElement('div');
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
        `;
        warning.textContent = 'Toegang geweigerd - Ongeautoriseerde activiteit gedetecteerd';
        document.body.appendChild(warning);
        
        setTimeout(() => {
            document.body.removeChild(warning);
        }, 3000);
    }

    async handleLogin(e) {
        e.preventDefault();
        
        if (this.isLockedOut()) {
            this.showError('Te veel mislukte pogingen. Probeer het later opnieuw.');
            return;
        }

        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        const rememberMe = document.getElementById('remember-me').checked;

        if (!username || !password) {
            this.showError('Vul alle velden in.');
            return;
        }

        this.showLoading(true);

        try {
            // Simulate API call delay
            await this.delay(1500);
            
            const isValid = await this.validateCredentials(username, password);
            
            if (isValid) {
                this.handleSuccessfulLogin(username, rememberMe);
            } else {
                this.handleFailedLogin();
            }
        } catch (error) {
            this.showError('Er is een fout opgetreden. Probeer het opnieuw.');
        } finally {
            this.showLoading(false);
        }
    }

    async validateCredentials(username, password) {
        // In a real application, this would make an API call
        // For demo purposes, using hardcoded credentials
        const validCredentials = {
            'admin': 'yannova2023',
            'manager': 'manager2023',
            'support': 'support2023'
        };

        return validCredentials[username] === password;
    }

    handleSuccessfulLogin(username, rememberMe) {
        // Generate JWT token (simplified)
        const token = this.generateToken(username);
        
        // Store session
        sessionStorage.setItem('admin_token', token);
        sessionStorage.setItem('admin_user', username);
        sessionStorage.setItem('login_time', Date.now().toString());

        if (rememberMe) {
            localStorage.setItem('remembered_user', username);
            localStorage.setItem('remembered_token', token);
        }

        // Reset attempts
        this.attempts = 0;
        localStorage.removeItem('login_attempts');
        localStorage.removeItem('lockout_time');

        // Show success animation
        document.getElementById('login-btn').classList.add('success-animation');
        
        // Redirect to dashboard
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1000);
    }

    handleFailedLogin() {
        this.attempts++;
        localStorage.setItem('login_attempts', this.attempts.toString());

        if (this.attempts >= this.maxAttempts) {
            const lockoutTime = Date.now() + this.lockoutTime;
            localStorage.setItem('lockout_time', lockoutTime.toString());
            this.showError(`Te veel mislukte pogingen. Probeer het over ${Math.ceil(this.lockoutTime / 60000)} minuten opnieuw.`);
        } else {
            const remaining = this.maxAttempts - this.attempts;
            this.showError(`Ongeldige inloggegevens. ${remaining} poging(en) over.`);
        }

        // Clear password field
        document.getElementById('password').value = '';
        document.getElementById('password').focus();
    }

    generateToken(username) {
        // Simplified token generation
        const payload = {
            username: username,
            timestamp: Date.now(),
            role: username === 'admin' ? 'admin' : 'user'
        };
        
        return btoa(JSON.stringify(payload)) + '.' + Date.now();
    }

    checkExistingSession() {
        const token = sessionStorage.getItem('admin_token');
        const loginTime = sessionStorage.getItem('login_time');
        
        if (token && loginTime) {
            const sessionAge = Date.now() - parseInt(loginTime);
            const maxSessionAge = 8 * 60 * 60 * 1000; // 8 hours
            
            if (sessionAge < maxSessionAge) {
                // Valid session exists, redirect to dashboard
                window.location.href = 'dashboard.html';
            } else {
                // Session expired, clear it
                this.clearSession();
            }
        }
    }

    loadRememberedCredentials() {
        const rememberedUser = localStorage.getItem('remembered_user');
        if (rememberedUser) {
            document.getElementById('username').value = rememberedUser;
            document.getElementById('remember-me').checked = true;
            document.getElementById('password').focus();
        }
    }

    isLockedOut() {
        const lockoutTime = localStorage.getItem('lockout_time');
        if (lockoutTime) {
            const remaining = parseInt(lockoutTime) - Date.now();
            if (remaining > 0) {
                return true;
            } else {
                // Lockout expired, clear it
                localStorage.removeItem('lockout_time');
                localStorage.removeItem('login_attempts');
                this.attempts = 0;
            }
        }
        return false;
    }

    showLoading(show) {
        const btn = document.getElementById('login-btn');
        const btnText = btn.querySelector('.btn-text');
        const btnLoader = btn.querySelector('.btn-loader');
        
        if (show) {
            btn.disabled = true;
            btnText.style.display = 'none';
            btnLoader.style.display = 'inline-block';
        } else {
            btn.disabled = false;
            btnText.style.display = 'inline-block';
            btnLoader.style.display = 'none';
        }
    }

    showError(message) {
        const errorDiv = document.getElementById('error-message');
        const errorText = document.getElementById('error-text');
        
        errorText.textContent = message;
        errorDiv.style.display = 'flex';
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            errorDiv.style.display = 'none';
        }, 5000);
    }

    togglePasswordVisibility() {
        const passwordInput = document.getElementById('password');
        const toggleBtn = document.getElementById('password-toggle');
        const icon = toggleBtn.querySelector('i');
        
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
        } else {
            passwordInput.type = 'password';
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        }
    }

    clearSession() {
        sessionStorage.removeItem('admin_token');
        sessionStorage.removeItem('admin_user');
        sessionStorage.removeItem('login_time');
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.adminLogin = new AdminLogin();
});

// Auto-logout after inactivity
let inactivityTimer;
const resetInactivityTimer = () => {
    clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(() => {
        if (sessionStorage.getItem('admin_token')) {
            alert('U bent automatisch uitgelogd vanwege inactiviteit.');
            window.location.href = 'login.html';
        }
    }, 30 * 60 * 1000); // 30 minutes
};

document.addEventListener('mousemove', resetInactivityTimer);
document.addEventListener('keypress', resetInactivityTimer);
document.addEventListener('click', resetInactivityTimer);

// Prevent back button
window.addEventListener('popstate', () => {
    if (sessionStorage.getItem('admin_token')) {
        history.pushState(null, null, window.location.href);
    }
});

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdminLogin;
}