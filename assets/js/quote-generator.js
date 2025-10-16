/**
 * Enhanced Quote Generator voor Yannova Ramen en Deuren
 * Modern, efficient en user-friendly offerte aanvraag systeem
 */

class YannovaQuoteGenerator {
  constructor() {
    this.currentStep = 1;
    this.totalSteps = 6;
    this.quoteData = {
      contact: {},
      project: {},
      preferences: {},
      measurements: {},
      timeline: {}
    };

    // DOM elementen cachen voor betere performance
    this.elements = {};

    this.init();
  }

  init() {
    this.cacheElements();
    this.bindEvents();
    this.loadSavedData();
    this.updateStep();
  }

  cacheElements() {
    // Cache alle DOM elementen voor betere performance
    this.elements = {
      modal: document.getElementById('quote-modal-container'),
      closeBtn: document.getElementById('quote-close'),
      prevBtn: document.getElementById('quote-prev'),
      nextBtn: document.getElementById('quote-next'),
      submitBtn: document.getElementById('quote-submit'),
      progressFill: document.getElementById('progress-fill'),
      progressText: document.getElementById('progress-text'),
      summaryList: document.getElementById('summary-list'),
      steps: document.querySelectorAll('.quote-step'),
      projectTypes: document.querySelectorAll('.project-type'),
      formInputs: document.querySelectorAll('#quote-modal-container input, #quote-modal-container select, #quote-modal-container textarea')
    };
  }

  bindEvents() {
    // Modal openen/sluiten
    document.addEventListener('click', (e) => {
      if (e.target.matches('.btn-primary[href="#contact"], .quote-btn')) {
        e.preventDefault();
        this.openModal();
      }
    });

    // Modal sluiten
    this.elements.closeBtn.addEventListener('click', () => this.closeModal());

    // Escape toets voor sluiten
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.elements.modal.classList.contains('open')) {
        this.closeModal();
      }
    });

    // Navigation
    this.elements.nextBtn.addEventListener('click', () => this.nextStep());
    this.elements.prevBtn.addEventListener('click', () => this.prevStep());
    this.elements.submitBtn.addEventListener('click', () => this.submitQuote());

    // Project type selectie
    this.elements.projectTypes.forEach(type => {
      type.addEventListener('click', () => this.selectProjectType(type));
    });

    // Real-time data opslaan en validatie
    this.elements.formInputs.forEach(input => {
      input.addEventListener('input', () => this.handleInputChange(input));
      input.addEventListener('change', () => this.handleInputChange(input));
      input.addEventListener('blur', () => this.validateField(input));
    });

    // Modal backdrop klik om te sluiten
    this.elements.modal.addEventListener('click', (e) => {
      if (e.target === this.elements.modal) {
        this.closeModal();
      }
    });
  }

  openModal() {
    this.elements.modal.classList.add('open');
    this.elements.modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    // Focus op eerste input
    const firstInput = this.elements.modal.querySelector('input[required]');
    if (firstInput) {
      setTimeout(() => firstInput.focus(), 100);
    }

    // Analytics tracking
    this.trackEvent('quote_modal_opened');
  }

  closeModal() {
    this.elements.modal.classList.remove('open');
    this.elements.modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';

    // Analytics tracking
    this.trackEvent('quote_modal_closed');
  }

  nextStep() {
    if (this.validateCurrentStep()) {
      if (this.currentStep < this.totalSteps) {
        this.animateStepTransition(() => {
          this.currentStep++;
          this.updateStep();
        });
      }
    }
  }

  prevStep() {
    if (this.currentStep > 1) {
      this.animateStepTransition(() => {
        this.currentStep--;
        this.updateStep();
      });
    }
  }

  animateStepTransition(callback) {
    const currentStepEl = document.getElementById(`step-${this.currentStep}`);
    currentStepEl.classList.add('exiting');

    setTimeout(() => {
      callback();
      currentStepEl.classList.remove('exiting');
    }, 200);
  }

  updateStep() {
    // Hide all steps
    this.elements.steps.forEach(step => {
      step.classList.remove('active');
    });

    // Show current step
    const currentStepEl = document.getElementById(`step-${this.currentStep}`);
    if (currentStepEl) {
      currentStepEl.classList.add('active');
    }

    // Update progress bar
    const progress = (this.currentStep / this.totalSteps) * 100;
    this.elements.progressFill.style.width = `${progress}%`;
    this.elements.progressText.textContent = `Stap ${this.currentStep} van ${this.totalSteps}`;

    // Update navigation buttons
    this.elements.prevBtn.style.display = this.currentStep > 1 ? 'flex' : 'none';

    if (this.currentStep === this.totalSteps) {
      this.elements.nextBtn.style.display = 'none';
      this.elements.submitBtn.style.display = 'flex';
      this.updateSummary();
    } else {
      this.elements.nextBtn.style.display = 'flex';
      this.elements.submitBtn.style.display = 'none';
    }

    // Focus op eerste input van nieuwe stap
    const firstInput = currentStepEl?.querySelector('input, select, textarea');
    if (firstInput) {
      setTimeout(() => firstInput.focus(), 100);
    }
  }

  selectProjectType(element) {
    // Toggle selectie (meerdere opties mogelijk)
    element.classList.toggle('selected');

    // Update data
    const selectedTypes = Array.from(this.elements.projectTypes)
      .filter(type => type.classList.contains('selected'))
      .map(type => type.getAttribute('data-type'));

    this.quoteData.project.types = selectedTypes;
    this.saveData();
  }

  handleInputChange(input) {
    this.saveData();

    // Real-time validatie voor specifieke velden
    if (input.matches('#quote-email, #quote-phone')) {
      this.validateField(input);
    }
  }

  validateCurrentStep() {
    const currentStepEl = document.getElementById(`step-${this.currentStep}`);
    const requiredFields = currentStepEl.querySelectorAll('[required]');

    this.clearErrors();

    let isValid = true;

    // Valideer verplichte velden
    for (const field of requiredFields) {
      if (!this.validateField(field)) {
        isValid = false;
      }
    }

    // Specifieke validatie per stap
    if (this.currentStep === 2) {
      if (!this.quoteData.project.types || this.quoteData.project.types.length === 0) {
        this.showError('Selecteer minimaal één project type');
        isValid = false;
      }
    }

    if (this.currentStep === 6) {
      if (!document.getElementById('quote-terms').checked) {
        this.showError('U moet akkoord gaan met de privacyvoorwaarden');
        isValid = false;
      }
    }

    return isValid;
  }

  validateField(field) {
    const value = field.value.trim();
    const fieldLabel = field.previousElementSibling?.textContent || field.getAttribute('placeholder') || 'Dit veld';

    // Clear existing errors
    this.clearFieldError(field);
    field.classList.remove('error');

    // Only validate if field has content
    if (!value) {
      if (field.hasAttribute('required')) {
        this.showFieldError(field, `${fieldLabel} is verplicht`);
        return false;
      }
      return true;
    }

    // Email validatie
    if (field.type === 'email' && !this.isValidEmail(value)) {
      this.showFieldError(field, 'Voer een geldig e-mailadres in');
      return false;
    }

    // Telefoon validatie
    if (field.type === 'tel' && !this.isValidPhone(value)) {
      this.showFieldError(field, 'Voer een geldig telefoonnummer in');
      return false;
    }

    return true;
  }

  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  isValidPhone(phone) {
    const phoneRegex = /^[+]?[0-9\s\-()]{10,}$/;
    return phoneRegex.test(phone);
  }

  showFieldError(field, message) {
    field.classList.add('error');

    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error';
    errorDiv.textContent = message;

    field.parentNode.insertBefore(errorDiv, field.nextSibling);
  }

  clearFieldError(field) {
    const existingError = field.parentNode.querySelector('.field-error');
    if (existingError) {
      existingError.remove();
    }
  }

  clearErrors() {
    document.querySelectorAll('.field-error').forEach(error => error.remove());
    document.querySelectorAll('.error').forEach(field => field.classList.remove('error'));

    const errorBanner = document.querySelector('.error-banner');
    if (errorBanner) {
      errorBanner.remove();
    }
  }

  showError(message) {
    this.clearErrors();

    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-banner';
    errorDiv.textContent = message;

    const stepsContainer = document.querySelector('.quote-steps');
    stepsContainer.insertBefore(errorDiv, stepsContainer.firstChild);

    setTimeout(() => errorDiv.remove(), 5000);
  }

  saveData() {
    // Contact informatie
    this.quoteData.contact = {
      name: document.getElementById('quote-name')?.value || '',
      email: document.getElementById('quote-email')?.value || '',
      phone: document.getElementById('quote-phone')?.value || '',
      address: document.getElementById('quote-address')?.value || ''
    };

    // Voorkeuren
    this.quoteData.preferences = {
      material: document.querySelector('input[name="material"]:checked')?.value || '',
      color: document.getElementById('quote-color')?.value || ''
    };

    // Project details
    this.quoteData.measurements = {
      notes: document.getElementById('quote-notes')?.value || ''
    };

    // Timeline
    this.quoteData.timeline = {
      preferred: document.querySelector('input[name="timeline"]:checked')?.value || '',
      date: document.getElementById('quote-preferred-date')?.value || '',
      terms: document.getElementById('quote-terms')?.checked || false
    };

    // Opslaan in localStorage
    localStorage.setItem('yannova_quote_data', JSON.stringify(this.quoteData));
  }

  loadSavedData() {
    try {
      const saved = localStorage.getItem('yannova_quote_data');
      if (saved) {
        this.quoteData = JSON.parse(saved);
        this.populateForm();
      }
    } catch (error) {
      this.log('Could not load saved data:', error, 'warn');
    }
  }

  populateForm() {
    // Contact velden
    if (this.quoteData.contact) {
      Object.keys(this.quoteData.contact).forEach(key => {
        const field = document.getElementById(`quote-${key}`);
        if (field) {field.value = this.quoteData.contact[key] || '';}
      });
    }

    // Project types
    if (this.quoteData.project.types) {
      this.quoteData.project.types.forEach(type => {
        const element = document.querySelector(`[data-type="${type}"]`);
        if (element) {element.classList.add('selected');}
      });
    }

    // Voorkeuren
    if (this.quoteData.preferences) {
      if (this.quoteData.preferences.material) {
        const materialInput = document.querySelector(`input[name="material"][value="${this.quoteData.preferences.material}"]`);
        if (materialInput) {materialInput.checked = true;}
      }
      if (this.quoteData.preferences.color) {
        const colorField = document.getElementById('quote-color');
        if (colorField) {colorField.value = this.quoteData.preferences.color;}
      }
    }

    // Project details
    if (this.quoteData.measurements) {
      const notesField = document.getElementById('quote-notes');
      if (notesField) {notesField.value = this.quoteData.measurements.notes || '';}
    }

    // Timeline
    if (this.quoteData.timeline) {
      if (this.quoteData.timeline.preferred) {
        const timelineInput = document.querySelector(`input[name="timeline"][value="${this.quoteData.timeline.preferred}"]`);
        if (timelineInput) {timelineInput.checked = true;}
      }
      if (this.quoteData.timeline.date) {
        const dateField = document.getElementById('quote-preferred-date');
        if (dateField) {dateField.value = this.quoteData.timeline.date;}
      }
      if (this.quoteData.timeline.terms) {
        const termsField = document.getElementById('quote-terms');
        if (termsField) {termsField.checked = true;}
      }
    }
  }

  updateSummary() {
    const summaryItems = [
      { label: 'Naam', value: this.quoteData.contact.name },
      { label: 'E-mail', value: this.quoteData.contact.email },
      { label: 'Telefoon', value: this.quoteData.contact.phone },
      { label: 'Adres', value: this.quoteData.contact.address || 'Niet opgegeven' },
      { label: 'Project type(s)', value: this.quoteData.project.types?.join(', ') || 'Niet geselecteerd' },
      { label: 'Materiaal voorkeur', value: this.quoteData.preferences.material || 'Geen voorkeur' },
      { label: 'Kleur', value: this.quoteData.preferences.color || 'Niet opgegeven' },
      { label: 'Project beschrijving', value: this.quoteData.measurements.notes || 'Niet opgegeven' },
      { label: 'Timeline', value: this.quoteData.timeline.preferred || 'Niet geselecteerd' },
      { label: 'Voorkeursdatum', value: this.quoteData.timeline.date || 'Niet opgegeven' }
    ];

    this.elements.summaryList.innerHTML = summaryItems
      .filter(item => item.value && item.value !== 'Niet opgegeven' && item.value !== 'Niet geselecteerd')
      .map(item => `
                <li>
                    <span class="summary-label">${item.label}:</span>
                    <span class="summary-value">${item.value}</span>
                </li>
            `).join('');
  }

  async submitQuote() {
    if (!this.validateCurrentStep()) {return;}

    this.saveData();

    const submitBtn = this.elements.submitBtn;
    const originalText = submitBtn.innerHTML;

    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Versturen...';
    submitBtn.disabled = true;

    try {
      // Transform data to match server expectations
      const serverData = {
        klantNaam: this.quoteData.contact.name,
        email: this.quoteData.contact.email,
        telefoon: this.quoteData.contact.phone,
        projectType: this.quoteData.project.types?.join(', ') || 'Niet gespecificeerd',
        opmerkingen: this.quoteData.measurements.notes || '',
        voorkeuren: {
          material: this.quoteData.preferences.material || '',
          color: this.quoteData.preferences.color || '',
          timeline: this.quoteData.timeline.preferred || '',
          preferredDate: this.quoteData.timeline.date || ''
        },
        timestamp: new Date().toISOString(),
        source: 'website'
      };

      const response = await fetch('/api/quotes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(serverData)
      });

      const data = await response.json();

      if (data.success) {
        this.showSuccess('Uw offerte aanvraag is succesvol verstuurd! We nemen zo snel mogelijk contact met u op.');
        this.closeModal();
        this.resetForm();

        // Analytics tracking
        this.trackEvent('quote_submitted', {
          project_types: this.quoteData.project.types,
          material: this.quoteData.preferences.material
        });
      } else {
        throw new Error(data.error || 'Er is een fout opgetreden');
      }
    } catch (error) {
      this.log('Quote submission error:', error, 'error');
      this.showError('Er is een fout opgetreden bij het versturen van uw aanvraag. Probeer het later opnieuw.');
    } finally {
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
    }
  }

  resetForm() {
    this.currentStep = 1;
    this.quoteData = {
      contact: {},
      project: {},
      preferences: {},
      measurements: {},
      timeline: {}
    };

    // Reset form fields
    this.elements.formInputs.forEach(field => {
      if (field.type === 'checkbox') {
        field.checked = false;
      } else {
        field.value = '';
      }
    });

    // Reset project types
    this.elements.projectTypes.forEach(type => {
      type.classList.remove('selected');
    });

    localStorage.removeItem('yannova_quote_data');
    this.updateStep();
  }

  showSuccess(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'quote-success';
    successDiv.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <div>${message}</div>
        `;

    document.body.appendChild(successDiv);

    setTimeout(() => {
      successDiv.remove();
    }, 5000);
  }

  trackEvent(eventName, data = {}) {
    // Analytics tracking
    if (window.yannovaAnalytics) {
      window.yannovaAnalytics.trackCustomEvent(eventName, data);
    } else {
      // Store event for later processing if analytics not ready
      if (!window.pendingAnalyticsEvents) {
        window.pendingAnalyticsEvents = [];
      }
      window.pendingAnalyticsEvents.push({ eventName, data });
    }

    // Google Analytics 4 tracking
    if (typeof window.gtag !== 'undefined') {
      window.gtag('event', eventName, {
        event_category: 'quote_generator',
        ...data
      });
    }

    // Send to server analytics endpoint
    try {
      fetch('/api/analytics/event', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          eventType: eventName,
          eventData: data
        })
      }).catch(error => {
        this.log('Analytics tracking failed:', error, 'warn');
      });
    } catch (error) {
      this.log('Analytics tracking failed:', error, 'warn');
    }
  }

  log(message, data = null, level = 'log') {
    if (typeof window !== 'undefined' && window.console) {
      switch (level) {
      case 'error':
        console.error(message, data);
        break;
      case 'warn':
        console.warn(message, data);
        break;
      default:
        console.log(message, data);
      }
    }
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.yannovaQuoteGenerator = new YannovaQuoteGenerator();
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = YannovaQuoteGenerator;
}
