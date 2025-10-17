/**
 * Modern UI Interactions for Yannova Website
 * Enhanced animations, micro-interactions, and user experience improvements
 */

class ModernUIInteractions {
  constructor() {
    this.init();
    this.setupIntersectionObserver();
    this.setupScrollEffects();
    this.setupParallaxEffects();
    this.setupMicroInteractions();
    this.setupPerformanceOptimizations();
  }

  init() {
    // Initialize all components when DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.initializeComponents());
    } else {
      this.initializeComponents();
    }
  }

  initializeComponents() {
    this.setupSmoothScrolling();
    this.setupNavigationEnhancements();
    this.setupButtonAnimations();
    this.setupCardAnimations();
    this.setupFormEnhancements();
    this.setupLoadingStates();
    this.setupErrorHandling();
    this.setupAccessibilityFeatures();
  }

  /**
     * Intersection Observer for scroll-triggered animations
     */
  setupIntersectionObserver() {
    if (!('IntersectionObserver' in window)) {return;}

    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.animateElement(entry.target);
        }
      });
    }, observerOptions);

    // Observe elements with animation classes
    const animatedElements = document.querySelectorAll(
      '.animate-fade-in-up, .animate-fade-in-left, .animate-fade-in-right, .animate-scale-in'
    );

    animatedElements.forEach(el => {
      observer.observe(el);
    });
  }

  /**
     * Animate element based on its animation class
     */
  animateElement(element) {
    const animationClass = Array.from(element.classList).find(cls =>
      cls.startsWith('animate-')
    );

    if (animationClass) {
      element.classList.add('animate-in');

      // Add stagger effect for multiple elements
      const siblings = Array.from(element.parentElement.children);
      const index = siblings.indexOf(element);
      element.style.animationDelay = `${index * 100}ms`;
    }
  }

  /**
     * Enhanced scroll effects
     */
  setupScrollEffects() {
    let ticking = false;

    const updateScrollEffects = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;

      // Navigation background opacity
      const nav = document.querySelector('.nav-modern');
      if (nav) {
        const opacity = Math.min(scrollY / 100, 1);
        nav.style.background = `rgba(26, 26, 26, ${0.95 + (opacity * 0.05)})`;
      }

      // Parallax effects
      this.updateParallaxElements(scrollY);

      // Progress indicator
      this.updateScrollProgress(scrollY);

      ticking = false;
    };

    const requestTick = () => {
      if (!ticking) {
        requestAnimationFrame(updateScrollEffects);
        ticking = true;
      }
    };

    window.addEventListener('scroll', requestTick, { passive: true });
  }

  /**
     * Parallax effects for background elements
     */
  setupParallaxEffects() {
    this.parallaxElements = document.querySelectorAll('[data-parallax]');
  }

  updateParallaxElements(scrollY) {
    this.parallaxElements.forEach(element => {
      const speed = parseFloat(element.dataset.parallax) || 0.5;
      const yPos = -(scrollY * speed);
      element.style.transform = `translateY(${yPos}px)`;
    });
  }

  /**
     * Update scroll progress indicator
     */
  updateScrollProgress(scrollY) {
    const progressBar = document.querySelector('.scroll-progress');
    if (progressBar) {
      const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrollY / documentHeight) * 100;
      progressBar.style.width = `${Math.min(progress, 100)}%`;
    }
  }

  /**
     * Smooth scrolling for anchor links
     */
  setupSmoothScrolling() {
    const links = document.querySelectorAll('a[href^="#"]');

    links.forEach(link => {
      link.addEventListener('click', (e) => {
        const targetId = link.getAttribute('href');
        if (targetId === '#') {return;}

        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          e.preventDefault();
          this.smoothScrollTo(targetElement);
        }
      });
    });
  }

  smoothScrollTo(element) {
    const targetPosition = element.offsetTop - 80; // Account for fixed header
    const startPosition = window.pageYOffset;
    const distance = targetPosition - startPosition;
    const duration = 800;
    let start = null;

    const animation = (currentTime) => {
      if (start === null) {start = currentTime;}
      const timeElapsed = currentTime - start;
      const run = this.easeInOutCubic(timeElapsed, startPosition, distance, duration);
      window.scrollTo(0, run);
      if (timeElapsed < duration) {requestAnimationFrame(animation);}
    };

    requestAnimationFrame(animation);
  }

  easeInOutCubic(t, b, c, d) {
    t /= d / 2;
    if (t < 1) {return c / 2 * t * t * t + b;}
    t -= 2;
    return c / 2 * (t * t * t + 2) + b;
  }

  /**
     * Enhanced navigation interactions
     */
  setupNavigationEnhancements() {
    const nav = document.querySelector('.nav-modern');
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.nav-menu-modern');

    if (!nav) {return;}

    // Mobile menu toggle
    if (menuToggle && navMenu) {
      menuToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        menuToggle.classList.toggle('active');
        document.body.classList.toggle('menu-open');
      });

      // Close menu when clicking outside
      document.addEventListener('click', (e) => {
        if (!nav.contains(e.target) && navMenu.classList.contains('active')) {
          navMenu.classList.remove('active');
          menuToggle.classList.remove('active');
          document.body.classList.remove('menu-open');
        }
      });
    }

    // Active link highlighting
    this.setupActiveLinkHighlighting();
  }

  setupActiveLinkHighlighting() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link-modern');

    if (sections.length === 0 || navLinks.length === 0) {return;}

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${id}`) {
              link.classList.add('active');
            }
          });
        }
      });
    }, { threshold: 0.3 });

    sections.forEach(section => observer.observe(section));
  }

  /**
     * Enhanced button animations and interactions
     */
  setupButtonAnimations() {
    const buttons = document.querySelectorAll('.btn');

    buttons.forEach(button => {
      // Ripple effect
      button.addEventListener('click', (e) => {
        this.createRippleEffect(e, button);
      });

      // Hover effects
      button.addEventListener('mouseenter', () => {
        this.enhanceButtonHover(button);
      });

      button.addEventListener('mouseleave', () => {
        this.resetButtonHover(button);
      });
    });
  }

  createRippleEffect(event, button) {
    const ripple = document.createElement('span');
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            background: rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            transform: scale(0);
            animation: ripple 0.6s linear;
            pointer-events: none;
        `;

    button.style.position = 'relative';
    button.style.overflow = 'hidden';
    button.appendChild(ripple);

    setTimeout(() => {
      ripple.remove();
    }, 600);
  }

  enhanceButtonHover(button) {
    button.style.transform = 'translateY(-2px) scale(1.02)';
    button.style.boxShadow = '0 8px 25px rgba(212, 165, 116, 0.4)';
  }

  resetButtonHover(button) {
    button.style.transform = '';
    button.style.boxShadow = '';
  }

  /**
     * Enhanced card animations
     */
  setupCardAnimations() {
    const cards = document.querySelectorAll('.card, .service-card-modern');

    cards.forEach(card => {
      card.addEventListener('mouseenter', () => {
        this.enhanceCardHover(card);
      });

      card.addEventListener('mouseleave', () => {
        this.resetCardHover(card);
      });

      // Stagger animation for card grids
      const cardGrid = card.closest('.services-grid-modern, .grid');
      if (cardGrid) {
        const cardsInGrid = Array.from(cardGrid.children);
        const index = cardsInGrid.indexOf(card);
        card.style.animationDelay = `${index * 100}ms`;
      }
    });
  }

  enhanceCardHover(card) {
    card.style.transform = 'translateY(-12px) scale(1.02)';
    card.style.boxShadow = '0 25px 50px rgba(0, 0, 0, 0.25)';

    // Animate icon
    const icon = card.querySelector('.service-icon-modern i, .service-icon i');
    if (icon) {
      icon.style.transform = 'scale(1.1) rotate(5deg)';
    }
  }

  resetCardHover(card) {
    card.style.transform = '';
    card.style.boxShadow = '';

    const icon = card.querySelector('.service-icon-modern i, .service-icon i');
    if (icon) {
      icon.style.transform = '';
    }
  }

  /**
     * Enhanced form interactions
     */
  setupFormEnhancements() {
    const inputs = document.querySelectorAll('input, textarea, select');

    inputs.forEach(input => {
      // Floating label effect
      this.setupFloatingLabel(input);

      // Real-time validation
      input.addEventListener('blur', () => {
        this.validateField(input);
      });

      input.addEventListener('input', () => {
        this.clearFieldError(input);
      });
    });
  }

  setupFloatingLabel(input) {
    const wrapper = input.closest('.form-group');
    if (!wrapper) {return;}

    const label = wrapper.querySelector('label');
    if (!label) {return;}

    input.addEventListener('focus', () => {
      label.classList.add('floating');
    });

    input.addEventListener('blur', () => {
      if (!input.value) {
        label.classList.remove('floating');
      }
    });

    // Check if input has value on load
    if (input.value) {
      label.classList.add('floating');
    }
  }

  validateField(field) {
    const value = field.value.trim();
    const type = field.type;
    const required = field.hasAttribute('required');

    let isValid = true;
    let errorMessage = '';

    if (required && !value) {
      isValid = false;
      errorMessage = 'Dit veld is verplicht';
    } else if (type === 'email' && value && !this.isValidEmail(value)) {
      isValid = false;
      errorMessage = 'Voer een geldig e-mailadres in';
    } else if (type === 'tel' && value && !this.isValidPhone(value)) {
      isValid = false;
      errorMessage = 'Voer een geldig telefoonnummer in';
    }

    this.showFieldValidation(field, isValid, errorMessage);
  }

  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  isValidPhone(phone) {
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/;
    return phoneRegex.test(phone);
  }

  showFieldValidation(field, isValid, errorMessage) {
    const wrapper = field.closest('.form-group');
    if (!wrapper) {return;}

    // Remove existing error
    const existingError = wrapper.querySelector('.field-error');
    if (existingError) {
      existingError.remove();
    }

    field.classList.remove('error');

    if (!isValid) {
      field.classList.add('error');

      const errorElement = document.createElement('div');
      errorElement.className = 'field-error';
      errorElement.textContent = errorMessage;
      wrapper.appendChild(errorElement);
    }
  }

  clearFieldError(field) {
    const wrapper = field.closest('.form-group');
    if (!wrapper) {return;}

    const error = wrapper.querySelector('.field-error');
    if (error) {
      error.remove();
    }

    field.classList.remove('error');
  }

  /**
     * Loading states for async operations
     */
  setupLoadingStates() {
    // Add loading state to buttons during form submission
    const forms = document.querySelectorAll('form');

    forms.forEach(form => {
      form.addEventListener('submit', (e) => {
        const submitButton = form.querySelector('button[type="submit"], .btn-submit');
        if (submitButton) {
          this.setButtonLoading(submitButton, true);
        }
      });
    });
  }

  setButtonLoading(button, loading) {
    if (loading) {
      button.disabled = true;
      button.classList.add('loading');
      button.dataset.originalText = button.textContent;
      button.innerHTML = '<span class="loading-spinner"></span> Bezig met versturen...';
    } else {
      button.disabled = false;
      button.classList.remove('loading');
      button.textContent = button.dataset.originalText || 'Versturen';
    }
  }

  /**
     * Micro-interactions and subtle animations
     */
  setupMicroInteractions() {
    // Icon animations
    const icons = document.querySelectorAll('.service-icon i, .hero-feature i');
    icons.forEach(icon => {
      icon.addEventListener('mouseenter', () => {
        icon.style.transform = 'scale(1.1) rotate(5deg)';
      });

      icon.addEventListener('mouseleave', () => {
        icon.style.transform = '';
      });
    });

    // Text reveal animations
    this.setupTextRevealAnimations();

    // Counter animations
    this.setupCounterAnimations();
  }

  setupTextRevealAnimations() {
    const textElements = document.querySelectorAll('h1, h2, h3, .hero-title-modern');

    textElements.forEach(element => {
      const text = element.textContent;
      element.innerHTML = '';

      text.split('').forEach((char, index) => {
        const span = document.createElement('span');
        span.textContent = char === ' ' ? '\u00A0' : char;
        span.style.animationDelay = `${index * 50}ms`;
        span.classList.add('char-reveal');
        element.appendChild(span);
      });
    });
  }

  setupCounterAnimations() {
    const counters = document.querySelectorAll('[data-counter]');

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    });

    counters.forEach(counter => observer.observe(counter));
  }

  animateCounter(element) {
    const target = parseInt(element.dataset.counter);
    const duration = 2000;
    const start = performance.now();

    const updateCounter = (currentTime) => {
      const elapsed = currentTime - start;
      const progress = Math.min(elapsed / duration, 1);
      const current = Math.floor(progress * target);

      element.textContent = current.toLocaleString();

      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      }
    };

    requestAnimationFrame(updateCounter);
  }

  /**
     * Performance optimizations
     */
  setupPerformanceOptimizations() {
    // Lazy load images
    this.setupLazyLoading();

    // Debounce scroll events
    this.debounceScrollEvents();

    // Optimize animations for reduced motion
    this.respectReducedMotion();
  }

  setupLazyLoading() {
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.classList.remove('lazy');
            imageObserver.unobserve(img);
          }
        });
      });

      const lazyImages = document.querySelectorAll('img[data-src]');
      lazyImages.forEach(img => imageObserver.observe(img));
    }
  }

  debounceScrollEvents() {
    let scrollTimeout;

    const debouncedScrollHandler = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        this.handleScrollEnd();
      }, 150);
    };

    window.addEventListener('scroll', debouncedScrollHandler, { passive: true });
  }

  handleScrollEnd() {
    // Actions to perform when scrolling stops
    const nav = document.querySelector('.nav-modern');
    if (nav) {
      nav.classList.remove('scrolling');
    }
  }

  respectReducedMotion() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      // Disable animations for users who prefer reduced motion
      document.documentElement.style.setProperty('--duration-300', '0ms');
      document.documentElement.style.setProperty('--duration-500', '0ms');
      document.documentElement.style.setProperty('--duration-700', '0ms');
    }
  }

  /**
     * Accessibility enhancements
     */
  setupAccessibilityFeatures() {
    // Skip links
    this.setupSkipLinks();

    // Focus management
    this.setupFocusManagement();

    // Keyboard navigation
    this.setupKeyboardNavigation();

    // ARIA attributes
    this.setupARIAttributes();
  }

  setupSkipLinks() {
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
  }

  setupFocusManagement() {
    // Trap focus in modals
    const modals = document.querySelectorAll('.modal, .quote-modal-container');

    modals.forEach(modal => {
      modal.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          this.closeModal(modal);
        }
      });
    });
  }

  setupKeyboardNavigation() {
    // Arrow key navigation for custom components
    const customSelects = document.querySelectorAll('.custom-select');

    customSelects.forEach(select => {
      select.addEventListener('keydown', (e) => {
        this.handleSelectKeyboardNavigation(e, select);
      });
    });
  }

  handleSelectKeyboardNavigation(event, select) {
    const options = select.querySelectorAll('.option');
    const activeOption = select.querySelector('.option.active');
    let currentIndex = Array.from(options).indexOf(activeOption);

    switch (event.key) {
    case 'ArrowDown':
      event.preventDefault();
      currentIndex = (currentIndex + 1) % options.length;
      this.setActiveOption(select, options[currentIndex]);
      break;
    case 'ArrowUp':
      event.preventDefault();
      currentIndex = currentIndex <= 0 ? options.length - 1 : currentIndex - 1;
      this.setActiveOption(select, options[currentIndex]);
      break;
    case 'Enter':
    case ' ':
      event.preventDefault();
      if (activeOption) {
        this.selectOption(select, activeOption);
      }
      break;
    }
  }

  setActiveOption(select, option) {
    const options = select.querySelectorAll('.option');
    options.forEach(opt => opt.classList.remove('active'));
    option.classList.add('active');
  }

  selectOption(select, option) {
    const value = option.dataset.value;
    const display = option.textContent;

    select.querySelector('.select-value').textContent = display;
    select.querySelector('input[type="hidden"]').value = value;
    select.classList.remove('open');
  }

  setupARIAttributes() {
    // Add ARIA labels to interactive elements
    const buttons = document.querySelectorAll('button:not([aria-label])');
    buttons.forEach(button => {
      if (!button.textContent.trim()) {
        button.setAttribute('aria-label', 'Button');
      }
    });

    // Add role attributes where needed
    const customSelects = document.querySelectorAll('.custom-select');
    customSelects.forEach(select => {
      select.setAttribute('role', 'combobox');
      select.setAttribute('aria-expanded', 'false');
    });
  }

  /**
     * Error handling and user feedback
     */
  setupErrorHandling() {
    // Global error handler
    window.addEventListener('error', (e) => {
      console.error('Global error:', e.error);
      this.showNotification('Er is een onverwachte fout opgetreden', 'error');
    });

    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (e) => {
      console.error('Unhandled promise rejection:', e.reason);
      this.showNotification('Er is een fout opgetreden bij het verwerken van uw verzoek', 'error');
    });
  }

  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
            <div class="notification-content">
                <span>${message}</span>
                <button class="notification-close" aria-label="Sluit notificatie">&times;</button>
            </div>
        `;

    document.body.appendChild(notification);

    // Auto remove after 5 seconds
    setTimeout(() => {
      notification.remove();
    }, 5000);

    // Close button functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
      notification.remove();
    });
  }

  closeModal(modal) {
    modal.classList.remove('open', 'show');
    document.body.classList.remove('modal-open');

    // Return focus to trigger element
    const trigger = document.querySelector(`[data-target="${modal.id}"]`);
    if (trigger) {
      trigger.focus();
    }
  }
}

// Initialize when DOM is ready
const modernUI = new ModernUIInteractions();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ModernUIInteractions;
}
