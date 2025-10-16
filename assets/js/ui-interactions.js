/**
 * UI Interactions Manager
 * Handles animations, micro-interactions, and accessibility features
 */

class UIInteractionsManager {
    constructor() {
        this.observers = new Map();
        this.animations = new Map();
        this.init();
    }

    init() {
        this.setupIntersectionObserver();
        this.setupScrollAnimations();
        this.setupHoverEffects();
        this.setupFormInteractions();
        this.setupKeyboardNavigation();
        this.setupTouchInteractions();
        this.setupAccessibilityFeatures();
    }

    /**
     * Setup Intersection Observer for scroll animations
     */
    setupIntersectionObserver() {
        if (!('IntersectionObserver' in window)) return;

        const animationObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                    
                    // Add staggered animation for multiple elements
                    const siblings = Array.from(entry.target.parentNode.children);
                    const index = siblings.indexOf(entry.target);
                    entry.target.style.animationDelay = `${index * 0.1}s`;
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        // Observe all animation elements
        document.querySelectorAll('.fade-in, .slide-in-left, .slide-in-right, .scale-in').forEach(el => {
            animationObserver.observe(el);
        });

        this.observers.set('animation', animationObserver);
    }

    /**
     * Setup scroll-based animations
     */
    setupScrollAnimations() {
        let ticking = false;

        const updateScrollAnimations = () => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            
            // Update scroll-to-top button
            this.updateScrollToTopButton(scrollTop);
            
            // Update header background
            this.updateHeaderBackground(scrollTop);
            
            // Update parallax elements
            this.updateParallaxElements(scrollTop);
            
            ticking = false;
        };

        const requestTick = () => {
            if (!ticking) {
                requestAnimationFrame(updateScrollAnimations);
                ticking = true;
            }
        };

        window.addEventListener('scroll', requestTick, { passive: true });
    }

    updateScrollToTopButton(scrollTop) {
        const scrollBtn = document.querySelector('.scroll-to-top-btn');
        if (!scrollBtn) return;

        if (scrollTop > 300) {
            scrollBtn.classList.add('visible');
        } else {
            scrollBtn.classList.remove('visible');
        }
    }

    updateHeaderBackground(scrollTop) {
        const header = document.querySelector('header');
        if (!header) return;

        const opacity = Math.min(scrollTop / 100, 0.95);
        header.style.background = `rgba(26, 26, 26, ${opacity})`;
    }

    updateParallaxElements(scrollTop) {
        const parallaxElements = document.querySelectorAll('[data-parallax]');
        parallaxElements.forEach(el => {
            const speed = parseFloat(el.dataset.parallax) || 0.5;
            const yPos = -(scrollTop * speed);
            el.style.transform = `translateY(${yPos}px)`;
        });
    }

    /**
     * Setup hover effects and micro-interactions
     */
    setupHoverEffects() {
        // Button hover effects
        document.querySelectorAll('.btn-primary, .btn-secondary, .cta-button').forEach(btn => {
            btn.addEventListener('mouseenter', () => {
                btn.style.transform = 'translateY(-2px)';
                btn.style.boxShadow = '0 5px 15px rgba(0,0,0,0.3)';
            });

            btn.addEventListener('mouseleave', () => {
                btn.style.transform = 'translateY(0)';
                btn.style.boxShadow = '0 2px 10px rgba(0,0,0,0.3)';
            });
        });

        // Card hover effects
        document.querySelectorAll('.service-card, .quote-card, .stat-card').forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-5px)';
                card.style.boxShadow = '0 10px 25px rgba(0,0,0,0.2)';
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0)';
                card.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
            });
        });

        // Hero features hover effects
        document.querySelectorAll('.hero-features span').forEach(feature => {
            feature.addEventListener('mouseenter', () => {
                feature.style.transform = 'scale(1.05)';
                feature.style.background = 'var(--primary-color)';
                feature.style.color = 'var(--secondary-color)';
            });

            feature.addEventListener('mouseleave', () => {
                feature.style.transform = 'scale(1)';
                feature.style.background = 'rgba(212, 165, 116, 0.1)';
                feature.style.color = 'var(--text-color)';
            });
        });
    }

    /**
     * Setup form interactions and validation feedback
     */
    setupFormInteractions() {
        const forms = document.querySelectorAll('form');
        
        forms.forEach(form => {
            const inputs = form.querySelectorAll('input, textarea, select');
            
            inputs.forEach(input => {
                // Real-time validation feedback
                input.addEventListener('blur', () => {
                    this.validateField(input);
                });

                input.addEventListener('input', () => {
                    this.clearFieldError(input);
                });

                // Focus animations
                input.addEventListener('focus', () => {
                    input.parentElement.classList.add('focused');
                });

                input.addEventListener('blur', () => {
                    input.parentElement.classList.remove('focused');
                });
            });

            // Form submission animation
            form.addEventListener('submit', (e) => {
                const submitBtn = form.querySelector('button[type="submit"]');
                if (submitBtn) {
                    this.animateButtonLoading(submitBtn);
                }
            });
        });
    }

    validateField(field) {
        const value = field.value.trim();
        const fieldName = field.name || field.id;
        
        // Basic validation
        if (field.hasAttribute('required') && !value) {
            this.showFieldError(field, `${this.getFieldLabel(fieldName)} is verplicht`);
            return false;
        }

        // Email validation
        if (field.type === 'email' && value && !this.isValidEmail(value)) {
            this.showFieldError(field, 'Voer een geldig emailadres in');
            return false;
        }

        // Phone validation
        if (field.type === 'tel' && value && !this.isValidPhone(value)) {
            this.showFieldError(field, 'Voer een geldig telefoonnummer in');
            return false;
        }

        // Success state
        if (value) {
            this.showFieldSuccess(field);
        }

        return true;
    }

    showFieldError(field, message) {
        this.clearFieldError(field);
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error';
        errorDiv.textContent = message;
        errorDiv.setAttribute('role', 'alert');
        
        field.parentElement.classList.add('error');
        field.parentElement.appendChild(errorDiv);
        
        // Shake animation
        field.parentElement.classList.add('error-shake');
        setTimeout(() => {
            field.parentElement.classList.remove('error-shake');
        }, 500);
    }

    showFieldSuccess(field) {
        field.parentElement.classList.add('success');
        field.parentElement.classList.remove('error');
    }

    clearFieldError(field) {
        const errorDiv = field.parentElement.querySelector('.field-error');
        if (errorDiv) {
            errorDiv.remove();
        }
        field.parentElement.classList.remove('error');
    }

    animateButtonLoading(button) {
        const originalText = button.innerHTML;
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Bezig...';
        button.classList.add('loading');
        button.disabled = true;

        // Reset after 3 seconds (in case of error)
        setTimeout(() => {
            button.innerHTML = originalText;
            button.classList.remove('loading');
            button.disabled = false;
        }, 3000);
    }

    /**
     * Setup keyboard navigation
     */
    setupKeyboardNavigation() {
        // Skip link functionality
        const skipLink = document.querySelector('.skip-link');
        if (skipLink) {
            skipLink.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(skipLink.getAttribute('href'));
                if (target) {
                    target.focus();
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            });
        }

        // Escape key to close modals
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });

        // Tab navigation enhancement
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                document.body.classList.add('keyboard-navigation');
            }
        });

        document.addEventListener('mousedown', () => {
            document.body.classList.remove('keyboard-navigation');
        });
    }

    /**
     * Setup touch interactions for mobile
     */
    setupTouchInteractions() {
        // Touch feedback for buttons
        document.querySelectorAll('button, .btn-primary, .btn-secondary, .cta-button').forEach(btn => {
            btn.addEventListener('touchstart', () => {
                btn.style.transform = 'scale(0.95)';
            });

            btn.addEventListener('touchend', () => {
                btn.style.transform = 'scale(1)';
            });
        });

        // Swipe gestures for mobile menu
        let startX = 0;
        let startY = 0;

        document.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        });

        document.addEventListener('touchend', (e) => {
            const endX = e.changedTouches[0].clientX;
            const endY = e.changedTouches[0].clientY;
            const diffX = startX - endX;
            const diffY = startY - endY;

            // Horizontal swipe
            if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
                if (diffX > 0) {
                    // Swipe left - close mobile menu
                    this.closeMobileMenu();
                } else {
                    // Swipe right - open mobile menu
                    this.openMobileMenu();
                }
            }
        });
    }

    /**
     * Setup accessibility features
     */
    setupAccessibilityFeatures() {
        // ARIA live region for announcements
        this.createLiveRegion();

        // High contrast mode detection
        if (window.matchMedia('(prefers-contrast: high)').matches) {
            document.body.classList.add('high-contrast');
        }

        // Reduced motion detection
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            document.body.classList.add('reduced-motion');
        }

        // Focus management for modals
        this.setupModalFocusManagement();
    }

    createLiveRegion() {
        const liveRegion = document.createElement('div');
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.className = 'sr-only';
        liveRegion.style.cssText = `
            position: absolute;
            width: 1px;
            height: 1px;
            padding: 0;
            margin: -1px;
            overflow: hidden;
            clip: rect(0, 0, 0, 0);
            white-space: nowrap;
            border: 0;
        `;
        document.body.appendChild(liveRegion);
        this.liveRegion = liveRegion;
    }

    announceToScreenReader(message) {
        if (this.liveRegion) {
            this.liveRegion.textContent = message;
        }
    }

    setupModalFocusManagement() {
        // This would be implemented when modals are added
        // For now, just a placeholder
    }

    /**
     * Utility methods
     */
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    isValidPhone(phone) {
        const phoneRegex = /^(\+31|0)[1-9][0-9]{8}$/;
        return phoneRegex.test(phone.replace(/\s/g, ''));
    }

    getFieldLabel(fieldName) {
        const labels = {
            naam: 'Naam',
            email: 'Email',
            telefoon: 'Telefoon',
            bericht: 'Bericht'
        };
        return labels[fieldName] || fieldName;
    }

    openMobileMenu() {
        const menu = document.querySelector('.nav-menu');
        const toggle = document.querySelector('.menu-toggle');
        
        if (menu && toggle) {
            menu.classList.add('active');
            toggle.classList.add('active');
            this.announceToScreenReader('Navigatiemenu geopend');
        }
    }

    closeMobileMenu() {
        const menu = document.querySelector('.nav-menu');
        const toggle = document.querySelector('.menu-toggle');
        
        if (menu && toggle) {
            menu.classList.remove('active');
            toggle.classList.remove('active');
            this.announceToScreenReader('Navigatiemenu gesloten');
        }
    }

    closeAllModals() {
        // Close any open modals
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('active');
        });
    }

    /**
     * Public methods for external use
     */
    showNotification(message, type = 'info') {
        this.announceToScreenReader(message);
        // This would integrate with the notification system
    }

    animateElement(element, animationClass) {
        element.classList.add(animationClass);
        setTimeout(() => {
            element.classList.remove(animationClass);
        }, 1000);
    }
}

// Initialize UI interactions when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.uiInteractions = new UIInteractionsManager();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UIInteractionsManager;
}
