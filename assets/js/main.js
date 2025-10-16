// Enhanced Mobile Menu Toggle with Accessibility
class MobileMenu {
    constructor() {
        this.menuToggle = document.getElementById('menu-toggle');
        this.navMenu = document.getElementById('nav-menu');
        this.isOpen = false;
        this.init();
    }

    init() {
        if (!this.menuToggle || !this.navMenu) return;

        this.menuToggle.addEventListener('click', () => this.toggleMenu());
        this.menuToggle.setAttribute('aria-expanded', 'false');
        this.menuToggle.setAttribute('aria-controls', 'nav-menu');

        // Close menu when clicking on a link
        document.querySelectorAll('.nav-menu a').forEach(link => {
            link.addEventListener('click', () => this.closeMenu());
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (this.isOpen && !this.navMenu.contains(e.target) && !this.menuToggle.contains(e.target)) {
                this.closeMenu();
            }
        });

        // Close menu on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.closeMenu();
                this.menuToggle.focus();
            }
        });
    }

    toggleMenu() {
        this.isOpen = !this.isOpen;
        this.navMenu.classList.toggle('active', this.isOpen);
        this.menuToggle.setAttribute('aria-expanded', this.isOpen.toString());

        // Prevent body scroll when menu is open
        document.body.style.overflow = this.isOpen ? 'hidden' : '';
    }

    closeMenu() {
        this.isOpen = false;
        this.navMenu.classList.remove('active');
        this.menuToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
    }
}

// Initialize mobile menu
const mobileMenu = new MobileMenu();

// Enhanced Form Handling with Validation
class ContactForm {
    constructor() {
        this.form = document.querySelector('.contact-form');
        this.submitBtn = this.form?.querySelector('button[type="submit"]');
        this.init();
    }

    init() {
        if (!this.form) return;

        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        this.addValidationListeners();
        this.addAccessibilityFeatures();
    }

    addValidationListeners() {
        const fields = ['naam', 'email', 'bericht'];

        fields.forEach(fieldName => {
            const field = document.getElementById(fieldName);
            if (field) {
                field.addEventListener('blur', () => this.validateField(field));
                field.addEventListener('input', () => this.clearFieldError(field));
            }
        });

        // Email format validation
        const emailField = document.getElementById('email');
        if (emailField) {
            emailField.addEventListener('input', (e) => {
                this.validateEmailFormat(e.target);
            });
        }
    }

    validateField(field) {
        const value = field.value.trim();
        const fieldName = field.id;

        this.clearFieldError(field);

        if (!value) {
            this.showFieldError(field, `${this.getFieldLabel(fieldName)} is verplicht`);
            return false;
        }

        // Specific validations
        switch (fieldName) {
            case 'email':
                if (!this.isValidEmail(value)) {
                    this.showFieldError(field, 'Voer een geldig emailadres in');
                    return false;
                }
                break;
            case 'bericht':
                if (value.length < 10) {
                    this.showFieldError(field, 'Bericht moet minimaal 10 tekens bevatten');
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

    getFieldLabel(fieldName) {
        const labels = {
            naam: 'Naam',
            email: 'Email',
            telefoon: 'Telefoon',
            bericht: 'Bericht'
        };
        return labels[fieldName] || fieldName;
    }

    showFieldError(field, message) {
        this.clearFieldError(field);

        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error';
        errorDiv.textContent = message;
        errorDiv.setAttribute('role', 'alert');

        field.classList.add('error');
        field.parentNode.appendChild(errorDiv);

        // Set ARIA attributes
        field.setAttribute('aria-invalid', 'true');
        field.setAttribute('aria-describedby', `${field.id}-error`);
        errorDiv.id = `${field.id}-error`;
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

    addAccessibilityFeatures() {
        // Add required field indicators
        const requiredFields = ['naam', 'email', 'bericht'];
        requiredFields.forEach(fieldName => {
            const field = document.getElementById(fieldName);
            if (field) {
                field.setAttribute('aria-required', 'true');
            }
        });
    }

    async handleSubmit(e) {
        e.preventDefault();

        const formData = {
            naam: document.getElementById('naam').value.trim(),
            email: document.getElementById('email').value.trim(),
            telefoon: document.getElementById('telefoon')?.value.trim() || '',
            bericht: document.getElementById('bericht').value.trim()
        };

        // Validate all fields
        const isValid = Object.keys(formData).every(key => {
            const field = document.getElementById(key);
            return field ? this.validateField(field) : true;
        });

        if (!isValid) {
            this.showNotification('Vul alle verplichte velden correct in', 'error');
            return;
        }

        // Show loading state
        this.setLoadingState(true);

        try {
            // Send form data
            const response = await this.submitForm(formData);

            if (response.success) {
                this.showNotification('Bedankt voor uw aanvraag! We nemen zo snel mogelijk contact met u op.', 'success');
                this.form.reset();
                this.clearAllErrors();
            } else {
                throw new Error(response.message || 'Er ging iets fout bij het verzenden');
            }
        } catch (error) {
            // Form submission error handled
            this.showNotification('Er ging iets fout bij het verzenden. Probeer het later opnieuw.', 'error');
        } finally {
            this.setLoadingState(false);
        }
    }

    async submitForm(formData) {
        // In a real application, this would send data to your backend
        // For now, we'll simulate an API call
        return new Promise((resolve) => {
            setTimeout(() => {
                // Simulate random success/failure for demo
                const isSuccess = Math.random() > 0.2;
                resolve({
                    success: isSuccess,
                    message: isSuccess ? 'Formulier succesvol verzonden' : 'Server error'
                });
            }, 1500);
        });
    }

    setLoadingState(loading) {
        if (this.submitBtn) {
            this.submitBtn.disabled = loading;
            this.submitBtn.innerHTML = loading
                ? '<i class="fas fa-spinner fa-spin"></i> Bezig met verzenden...'
                : 'Verstuur bericht';
        }

        // Disable form fields during submission
        const formFields = this.form.querySelectorAll('input, textarea, button');
        formFields.forEach(field => {
            if (field !== this.submitBtn) {
                field.disabled = loading;
            }
        });
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span>${message}</span>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

        // Add to DOM
        const container = document.querySelector('.notification-container') || this.createNotificationContainer();
        container.appendChild(notification);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);

        // Announce to screen readers
        notification.setAttribute('role', 'alert');
        notification.setAttribute('aria-live', 'polite');
    }

    createNotificationContainer() {
        const container = document.createElement('div');
        container.className = 'notification-container';
        document.body.appendChild(container);
        return container;
    }

    clearAllErrors() {
        const errorElements = this.form.querySelectorAll('.field-error');
        errorElements.forEach(error => error.remove());

        const errorFields = this.form.querySelectorAll('.error');
        errorFields.forEach(field => {
            field.classList.remove('error');
            field.removeAttribute('aria-invalid');
            field.removeAttribute('aria-describedby');
        });
    }
}

// Initialize contact form
const contactForm = new ContactForm();

// Smooth scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Scroll to top functionality
window.addEventListener('scroll', () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollToTopBtn = document.getElementById('scroll-to-top');
    
    if (scrollTop > 300) {
        scrollToTopBtn.style.display = 'block';
    } else {
        scrollToTopBtn.style.display = 'none';
    }
});

// Enhanced Smooth Scrolling with Intersection Observer
class ScrollManager {
    constructor() {
        this.scrollToTopBtn = document.getElementById('scroll-to-top');
        this.observedSections = new Set();
        this.init();
    }

    init() {
        this.setupSmoothScrolling();
        this.setupScrollToTop();
        this.setupIntersectionObserver();
        this.setupScrollSpy();
    }

    setupSmoothScrolling() {
        // Enhanced smooth scrolling with offset for fixed header
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = anchor.getAttribute('href');
                const target = document.querySelector(targetId);

                if (target) {
                    const headerHeight = document.querySelector('header')?.offsetHeight || 0;
                    const targetPosition = target.offsetTop - headerHeight - 20;

                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });

                    // Update URL without jumping
                    if (history.pushState) {
                        history.pushState(null, null, targetId);
                    }
                }
            });
        });
    }

    setupScrollToTop() {
        if (!this.scrollToTopBtn) return;

        // Throttled scroll listener for better performance
        let ticking = false;
        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    this.toggleScrollToTop();
                    ticking = false;
                });
                ticking = true;
            }
        });

        // Scroll to top functionality
        this.scrollToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });

            // Focus management for accessibility
            setTimeout(() => {
                document.querySelector('header')?.focus();
            }, 500);
        });
    }

    toggleScrollToTop() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const shouldShow = scrollTop > 400;

        if (shouldShow && this.scrollToTopBtn.style.display !== 'flex') {
            this.scrollToTopBtn.style.display = 'flex';
            this.scrollToTopBtn.setAttribute('aria-hidden', 'false');
        } else if (!shouldShow && this.scrollToTopBtn.style.display !== 'none') {
            this.scrollToTopBtn.style.display = 'none';
            this.scrollToTopBtn.setAttribute('aria-hidden', 'true');
        }
    }

    setupIntersectionObserver() {
        // Animate elements when they come into view
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                    // Optional: unobserve after animation to improve performance
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        // Observe elements that should animate in
        document.querySelectorAll('.animate-on-scroll, .service-card, .about-text, .about-image').forEach(el => {
            observer.observe(el);
        });
    }

    setupScrollSpy() {
        // Highlight navigation items based on scroll position
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-menu a[href^="#"]');

        if (sections.length === 0 || navLinks.length === 0) return;

        const observerOptions = {
            threshold: 0.5,
            rootMargin: '-20% 0px -20% 0px'
        };

        const sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const sectionId = entry.target.id;
                    navLinks.forEach(link => {
                        link.classList.toggle('active', link.getAttribute('href') === `#${sectionId}`);
                    });
                }
            });
        }, observerOptions);

        sections.forEach(section => {
            sectionObserver.observe(section);
        });
    }
}

// Initialize scroll manager
const scrollManager = new ScrollManager();

// Performance monitoring is handled by performance-monitor.js

// Slideshow functionality
class Slideshow {
    constructor() {
        this.slides = document.querySelectorAll('.slide');
        this.dots = document.querySelectorAll('.dot');
        this.prevBtn = document.querySelector('.prev');
        this.nextBtn = document.querySelector('.next');
        this.currentSlide = 0;
        this.slideInterval = null;
        this.init();
    }

    init() {
        if (this.slides.length === 0) return;

        // Event listeners
        if (this.prevBtn) {
            this.prevBtn.addEventListener('click', () => this.prevSlide());
        }
        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', () => this.nextSlide());
        }

        // Dot navigation
        this.dots.forEach((dot, index) => {
            dot.addEventListener('click', () => this.goToSlide(index));
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') this.prevSlide();
            if (e.key === 'ArrowRight') this.nextSlide();
        });

        // Touch/swipe support
        this.addTouchSupport();

        // Auto-play slideshow
        this.startAutoPlay();

        // Pause on hover
        const slideshowContainer = document.querySelector('.slideshow-container');
        if (slideshowContainer) {
            slideshowContainer.addEventListener('mouseenter', () => this.stopAutoPlay());
            slideshowContainer.addEventListener('mouseleave', () => this.startAutoPlay());
        }
    }

    showSlide(index) {
        // Hide all slides
        this.slides.forEach(slide => slide.classList.remove('active'));
        this.dots.forEach(dot => dot.classList.remove('active'));

        // Show current slide
        if (this.slides[index]) {
            this.slides[index].classList.add('active');
        }
        if (this.dots[index]) {
            this.dots[index].classList.add('active');
        }

        this.currentSlide = index;
    }

    nextSlide() {
        const nextIndex = (this.currentSlide + 1) % this.slides.length;
        this.showSlide(nextIndex);
    }

    prevSlide() {
        const prevIndex = (this.currentSlide - 1 + this.slides.length) % this.slides.length;
        this.showSlide(prevIndex);
    }

    goToSlide(index) {
        this.showSlide(index);
    }

    startAutoPlay() {
        this.stopAutoPlay();
        this.slideInterval = setInterval(() => {
            this.nextSlide();
        }, 5000); // Change slide every 5 seconds
    }

    stopAutoPlay() {
        if (this.slideInterval) {
            clearInterval(this.slideInterval);
            this.slideInterval = null;
        }
    }

    addTouchSupport() {
        const slideshowContainer = document.querySelector('.slideshow-container');
        if (!slideshowContainer) return;

        let startX = 0;
        let startY = 0;
        let endX = 0;
        let endY = 0;

        slideshowContainer.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        });

        slideshowContainer.addEventListener('touchend', (e) => {
            endX = e.changedTouches[0].clientX;
            endY = e.changedTouches[0].clientY;
            this.handleSwipe(startX, startY, endX, endY);
        });
    }

    handleSwipe(startX, startY, endX, endY) {
        const deltaX = endX - startX;
        const deltaY = endY - startY;
        const minSwipeDistance = 50;

        // Check if it's a horizontal swipe (not vertical)
        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minSwipeDistance) {
            if (deltaX > 0) {
                this.prevSlide();
            } else {
                this.nextSlide();
            }
        }
    }
}

// Video functionality
class VideoPlayer {
    constructor() {
        this.video = document.getElementById('main-video');
        this.playButton = document.querySelector('.play-button');
        this.videoWrapper = document.querySelector('.video-wrapper');
        this.init();
    }

    init() {
        if (!this.video || !this.playButton || !this.videoWrapper) return;

        this.playButton.addEventListener('click', () => this.togglePlay());
        
        // Video event listeners
        this.video.addEventListener('play', () => this.onPlay());
        this.video.addEventListener('pause', () => this.onPause());
        this.video.addEventListener('ended', () => this.onEnded());
        
        // Click on video to play/pause
        this.video.addEventListener('click', () => this.togglePlay());
        
        // Keyboard support
        this.video.addEventListener('keydown', (e) => {
            if (e.key === ' ' || e.key === 'Enter') {
                e.preventDefault();
                this.togglePlay();
            }
        });
    }

    togglePlay() {
        if (this.video.paused) {
            this.video.play();
        } else {
            this.video.pause();
        }
    }

    onPlay() {
        this.videoWrapper.classList.add('playing');
        this.playButton.innerHTML = '<i class="fas fa-pause"></i>';
    }

    onPause() {
        this.videoWrapper.classList.remove('playing');
        this.playButton.innerHTML = '<i class="fas fa-play"></i>';
    }

    onEnded() {
        this.videoWrapper.classList.remove('playing');
        this.playButton.innerHTML = '<i class="fas fa-play"></i>';
    }
}

// Initialize slideshow and video when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new Slideshow();
    new VideoPlayer();
});
