// Forgot Password JavaScript
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('forgot-password-form');
    const emailInput = document.getElementById('email');
    const resetBtn = document.getElementById('reset-btn');
    const btnText = resetBtn.querySelector('.btn-text');
    const btnLoader = resetBtn.querySelector('.btn-loader');
    const errorMessage = document.getElementById('error-message');
    const successMessage = document.getElementById('success-message');
    const errorText = document.getElementById('error-text');
    const successText = document.getElementById('success-text');

    // Form submission
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = emailInput.value.trim();
        
        if (!email) {
            showError('Voer een geldig emailadres in');
            return;
        }

        if (!isValidEmail(email)) {
            showError('Voer een geldig emailadres in');
            return;
        }

        // Show loading state
        setLoading(true);
        hideMessages();

        try {
            const response = await fetch('/api/admin/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: email })
            });

            const data = await response.json();

            if (data.success) {
                showSuccess('Een reset link is verzonden naar uw emailadres. Controleer uw inbox en spam folder.');
                form.reset();
            } else {
                showError(data.message || 'Er is een fout opgetreden. Probeer het later opnieuw.');
            }
        } catch (error) {
            console.error('Forgot password error:', error);
            showError('Er is een netwerkfout opgetreden. Controleer uw internetverbinding.');
        } finally {
            setLoading(false);
        }
    });

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

    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Auto-hide messages after 5 seconds
    setInterval(() => {
        if (successMessage.style.display === 'block') {
            successMessage.style.display = 'none';
        }
    }, 5000);
});
