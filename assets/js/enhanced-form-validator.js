/**
 * Enhanced Form Validator
 * Implements improved form validation with accessibility and user experience features
 */

class EnhancedFormValidator {
    constructor() {
        this.forms = document.querySelectorAll('form');
        this.init();
    }

    init() {
        this.forms.forEach(form => {
            this.setupForm(form);
        });
    }

    setupForm(form) {
        // Add validation listeners
        this.addValidationListeners(form);
        this.addAccessibilityFeatures(form);
        this.setupFormSubmission(form);
    }

    addValidationListeners(form) {
        const fields = form.querySelectorAll('input, textarea, select');
        
        fields.forEach(field => {
            // Real-time validation on blur
            field.addEventListener('blur', () => {
                this.validateField(field);
            });

            // Clear errors on input
            field.addEventListener('input', () => {
                this.clearFieldError(field);
            });

            // Special handling for email fields
            if (field.type === 'email') {
                field.addEventListener('input', (e) => {
                    this.validateEmailFormat(e.target);
                });
            }
        });
    }

    addAccessibilityFeatures(form) {
        // Add required field indicators
        const requiredFields = form.querySelectorAll('[required]');
        requiredFields.forEach(field => {
            field.setAttribute('aria-required', 'true');
            
            // Add visual indicator
            const label = form.querySelector(`label[for="${field.id}"]`);
            if (label && !label.textContent.includes('*')) {
                label.innerHTML += ' <span class="required-indicator" aria-label="verplicht veld">*</span>';
            }
        });

        // Add field descriptions
        this.addFieldDescriptions(form);
    }

    addFieldDescriptions(form) {
        const descriptions = {
            'naam': 'Voer uw volledige naam in',
            'email': 'Voer een geldig emailadres in (bijvoorbeeld: naam@voorbeeld.nl)',
            'telefoon': 'Voer uw telefoonnummer in (optioneel)',
            'bericht': 'Beschrijf uw vraag of project (minimaal 10 tekens)'
        };

        Object.entries(descriptions).forEach(([fieldId, description]) => {
            const field = form.querySelector(`#${fieldId}`);
            if (field) {
                const descId = `${fieldId}-description`;
                field.setAttribute('aria-describedby', descId);
                
                const descElement = document.createElement('div');
                descElement.id = descId;
                descElement.className = 'field-description';
                descElement.textContent = description;
                descElement.style.cssText = 'font-size: 0.9rem; color: #ccc; margin-top: 0.25rem;';
                
                field.parentNode.appendChild(descElement);
            }
        });
    }

    validateField(field) {
        const value = field.value.trim();
        const fieldName = field.id || field.name;
        const isRequired = field.hasAttribute('required');

        this.clearFieldError(field);

        // Check if required field is empty
        if (isRequired && !value) {
            this.showFieldError(field, `${this.getFieldLabel(fieldName)} is verplicht`);
            return false;
        }

        // Skip validation if field is empty and not required
        if (!value && !isRequired) {
            return true;
        }

        // Specific field validations
        switch (field.type) {
            case 'email':
                if (!this.isValidEmail(value)) {
                    this.showFieldError(field, 'Voer een geldig emailadres in');
                    return false;
                }
                break;
            case 'tel':
                if (!this.isValidPhone(value)) {
                    this.showFieldError(field, 'Voer een geldig telefoonnummer in');
                    return false;
                }
                break;
        }

        // Custom validations based on field name
        switch (fieldName) {
            case 'bericht':
                if (value.length < 10) {
                    this.showFieldError(field, 'Bericht moet minimaal 10 tekens bevatten');
                    return false;
                }
                if (value.length > 1000) {
                    this.showFieldError(field, 'Bericht mag maximaal 1000 tekens bevatten');
                    return false;
                }
                break;
            case 'naam':
                if (value.length < 2) {
                    this.showFieldError(field, 'Naam moet minimaal 2 tekens bevatten');
                    return false;
                }
                if (!/^[a-zA-Z\s\u00c0-\u017f]+$/.test(value)) {
                    this.showFieldError(field, 'Naam mag alleen letters en spaties bevatten');
                    return false;
                }
                break;
        }

        return true;
    }

    validateEmailFormat(field) {
        const value = field.value.trim();
        if (value && !this.isValidEmail(value)) {
            this.showFieldError(field, 'Voer een geldig emailadres in');
        } else {
            this.clearFieldError(field);
        }
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    isValidPhone(phone) {
        // Dutch phone number validation
        const phoneRegex = /^(\+31|0)[1-9][0-9]{8}$/;
        return phoneRegex.test(phone.replace(/\s/g, ''));
    }

    getFieldLabel(fieldName) {
        const labels = {
            naam: 'Naam',
            email: 'Email',
            telefoon: 'Telefoon',
            bericht: 'Bericht',
            onderwerp: 'Onderwerp'
        };
        return labels[fieldName] || fieldName;
    }

    showFieldError(field, message) {
        this.clearFieldError(field);

        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error';
        errorDiv.textContent = message;
        errorDiv.setAttribute('role', 'alert');
        errorDiv.setAttribute('aria-live', 'polite');
        errorDiv.style.cssText = `
            color: #ff6b6b;
            font-size: 0.9rem;
            margin-top: 0.25rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        `;

        // Add error icon
        const errorIcon = document.createElement('i');
        errorIcon.className = 'fas fa-exclamation-circle';
        errorIcon.setAttribute('aria-hidden', 'true');
        errorDiv.prepend(errorIcon);

        field.classList.add('error');
        field.setAttribute('aria-invalid', 'true');
        field.setAttribute('aria-describedby', `${field.id}-error`);
        errorDiv.id = `${field.id}-error`;

        // Insert after the field
        field.parentNode.appendChild(errorDiv);

        // Focus the field for accessibility
        field.focus();
    }

    clearFieldError(field) {
        const existingError = field.parentNode.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }

        field.classList.remove('error');
        field.removeAttribute('aria-invalid');
        field.removeAttribute('aria-describedby');
    }

    setupFormSubmission(form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Validate all fields
            const fields = form.querySelectorAll('input, textarea, select');
            let isValid = true;

            fields.forEach(field => {
                if (!this.validateField(field)) {
                    isValid = false;
                }
            });

            if (!isValid) {
                this.showNotification('Vul alle verplichte velden correct in', 'error');
                return;
            }

            // Show loading state
            this.setLoadingState(form, true);

            try {
                const formData = this.collectFormData(form);
                const response = await this.submitForm(formData);

                if (response.success) {
                    this.showNotification('Bedankt voor uw aanvraag! We nemen zo snel mogelijk contact met u op.', 'success');
                    form.reset();
                    this.clearAllErrors(form);
                } else {
                    throw new Error(response.message || 'Er ging iets fout bij het verzenden');
                }
            } catch (error) {
                console.error('Form submission error:', error);
                this.showNotification('Er ging iets fout bij het verzenden. Probeer het later opnieuw.', 'error');
            } finally {
                this.setLoadingState(form, false);
            }
        });
    }

    collectFormData(form) {
        const formData = {};
        const fields = form.querySelectorAll('input, textarea, select');
        
        fields.forEach(field => {
            if (field.name) {
                formData[field.name] = field.value.trim();
            }
        });

        return formData;
    }

    async submitForm(formData) {
        // Simulate API call
        return new Promise((resolve) => {
            setTimeout(() => {
                const isSuccess = Math.random() > 0.1; // 90% success rate for demo
                resolve({
                    success: isSuccess,
                    message: isSuccess ? 'Formulier succesvol verzonden' : 'Server error'
                });
            }, 1500);
        });
    }

    setLoadingState(form, loading) {
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = loading;
            
            if (loading) {
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Bezig met verzenden...';
                submitBtn.classList.add('loading');
            } else {
                submitBtn.innerHTML = 'Verstuur bericht';
                submitBtn.classList.remove('loading');
            }
        }

        // Disable form fields during submission
        const formFields = form.querySelectorAll('input, textarea, select, button');
        formFields.forEach(field => {
            if (field !== submitBtn) {
                field.disabled = loading;
            }
        });
    }

    showNotification(message, type = 'info') {
        // Create notification container if it doesn't exist
        let container = document.querySelector('.notification-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'notification-container';
            container.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                max-width: 400px;
            `;
            document.body.appendChild(container);
        }

        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.setAttribute('role', 'alert');
        notification.setAttribute('aria-live', 'polite');
        
        const typeIcons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            info: 'fa-info-circle',
            warning: 'fa-exclamation-triangle'
        };

        const typeColors = {
            success: '#4caf50',
            error: '#f44336',
            info: '#2196f3',
            warning: '#ff9800'
        };

        notification.innerHTML = `
            <div class="notification-content" style="
                background: ${typeColors[type]};
                color: white;
                padding: 1rem;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                display: flex;
                align-items: center;
                gap: 0.75rem;
                margin-bottom: 0.5rem;
                animation: slideIn 0.3s ease;
            ">
                <i class="fas ${typeIcons[type]}" aria-hidden="true"></i>
                <span>${message}</span>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()" style="
                    background: none;
                    border: none;
                    color: white;
                    cursor: pointer;
                    margin-left: auto;
                    padding: 0.25rem;
                ">
                    <i class="fas fa-times" aria-hidden="true"></i>
                </button>
            </div>
        `;

        // Add CSS animation
        if (!document.querySelector('#notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                .notification-close:hover {
                    background: rgba(255,255,255,0.2) !important;
                    border-radius: 4px;
                }
            `;
            document.head.appendChild(style);
        }

        container.appendChild(notification);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideIn 0.3s ease reverse';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.remove();
                    }
                }, 300);
            }
        }, 5000);
    }

    clearAllErrors(form) {
        const errorElements = form.querySelectorAll('.field-error');
        errorElements.forEach(error => error.remove());

        const errorFields = form.querySelectorAll('.error');
        errorFields.forEach(field => {
            field.classList.remove('error');
            field.removeAttribute('aria-invalid');
            field.removeAttribute('aria-describedby');
        });
    }
}

// Initialize enhanced form validator
document.addEventListener('DOMContentLoaded', () => {
    window.enhancedFormValidator = new EnhancedFormValidator();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EnhancedFormValidator;
}
