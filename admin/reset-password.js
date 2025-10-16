// Reset Password JavaScript
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('reset-password-form');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirm-password');
    const passwordToggle = document.getElementById('password-toggle');
    const confirmPasswordToggle = document.getElementById('confirm-password-toggle');
    const resetBtn = document.getElementById('reset-btn');
    const btnText = resetBtn.querySelector('.btn-text');
    const btnLoader = resetBtn.querySelector('.btn-loader');
    const errorMessage = document.getElementById('error-message');
    const successMessage = document.getElementById('success-message');
    const errorText = document.getElementById('error-text');
    const successText = document.getElementById('success-text');
    const passwordStrength = document.getElementById('password-strength');
    const strengthFill = document.getElementById('strength-fill');
    const strengthText = document.getElementById('strength-text');

    // Get token from URL
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    if (!token) {
        showError('Ongeldige reset link. Vraag een nieuwe reset link aan.');
        return;
    }

    // Password visibility toggle
    passwordToggle.addEventListener('click', function() {
        togglePasswordVisibility(passwordInput, passwordToggle);
    });

    confirmPasswordToggle.addEventListener('click', function() {
        togglePasswordVisibility(confirmPasswordInput, confirmPasswordToggle);
    });

    // Password strength checker
    passwordInput.addEventListener('input', function() {
        checkPasswordStrength(passwordInput.value);
    });

    // Form submission
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        
        // Validation
        if (!password) {
            showError('Voer een wachtwoord in');
            return;
        }

        if (password.length < 8) {
            showError('Wachtwoord moet minimaal 8 karakters lang zijn');
            return;
        }

        if (password !== confirmPassword) {
            showError('Wachtwoorden komen niet overeen');
            return;
        }

        if (!isStrongPassword(password)) {
            showError('Wachtwoord moet minimaal één hoofdletter, één kleine letter, één cijfer en één speciaal teken bevatten');
            return;
        }

        // Show loading state
        setLoading(true);
        hideMessages();

        try {
            const response = await fetch('/api/admin/reset-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    token: token,
                    password: password 
                })
            });

            const data = await response.json();

            if (data.success) {
                showSuccess('Uw wachtwoord is succesvol bijgewerkt. U wordt doorgestuurd naar de login pagina.');
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000);
            } else {
                showError(data.message || 'Er is een fout opgetreden. Probeer het later opnieuw.');
            }
        } catch (error) {
            console.error('Reset password error:', error);
            showError('Er is een netwerkfout opgetreden. Controleer uw internetverbinding.');
        } finally {
            setLoading(false);
        }
    });

    function togglePasswordVisibility(input, toggle) {
        const isPassword = input.type === 'password';
        input.type = isPassword ? 'text' : 'password';
        toggle.querySelector('i').className = isPassword ? 'fas fa-eye-slash' : 'fas fa-eye';
    }

    function checkPasswordStrength(password) {
        if (password.length === 0) {
            passwordStrength.style.display = 'none';
            return;
        }

        passwordStrength.style.display = 'block';
        
        let strength = 0;
        let strengthLabel = '';

        // Length check
        if (password.length >= 8) strength += 1;
        if (password.length >= 12) strength += 1;

        // Character variety checks
        if (/[a-z]/.test(password)) strength += 1;
        if (/[A-Z]/.test(password)) strength += 1;
        if (/[0-9]/.test(password)) strength += 1;
        if (/[^A-Za-z0-9]/.test(password)) strength += 1;

        // Determine strength level
        if (strength <= 2) {
            strengthLabel = 'Zwak';
            strengthFill.style.width = '25%';
            strengthFill.style.backgroundColor = '#e74c3c';
        } else if (strength <= 4) {
            strengthLabel = 'Gemiddeld';
            strengthFill.style.width = '50%';
            strengthFill.style.backgroundColor = '#f39c12';
        } else if (strength <= 5) {
            strengthLabel = 'Goed';
            strengthFill.style.width = '75%';
            strengthFill.style.backgroundColor = '#3498db';
        } else {
            strengthLabel = 'Sterk';
            strengthFill.style.width = '100%';
            strengthFill.style.backgroundColor = '#27ae60';
        }

        strengthText.textContent = strengthLabel;
    }

    function isStrongPassword(password) {
        return password.length >= 8 &&
               /[a-z]/.test(password) &&
               /[A-Z]/.test(password) &&
               /[0-9]/.test(password) &&
               /[^A-Za-z0-9]/.test(password);
    }

    function setLoading(loading) {
        if (loading) {
            resetBtn.disabled = true;
            btnText.style.display = 'none';
            btnLoader.style.display = 'inline-block';
        } else {
            resetBtn.disabled = false;
            btnText.style.display = 'inline-block';
            btnLoader.style.display = 'none';
        }
    }

    function showError(message) {
        errorText.textContent = message;
        errorMessage.style.display = 'block';
        successMessage.style.display = 'none';
    }

    function showSuccess(message) {
        successText.textContent = message;
        successMessage.style.display = 'block';
        errorMessage.style.display = 'none';
    }

    function hideMessages() {
        errorMessage.style.display = 'none';
        successMessage.style.display = 'none';
    }
});
