// Layout Switcher for Service Cards
class LayoutSwitcher {
  constructor() {
    this.layouts = ['grid', 'masonry', 'zigzag'];
    this.currentLayout = 'grid';

    // Cache DOM elements to avoid repeated queries
    this.controlsContainer = null;
    this.buttons = [];
    this.grids = document.querySelectorAll('.services-grid');

    if (this.grids.length > 0) {
      this.init();
    }
  }

  init() {
    this.createLayoutControls();
    this.bindEvents();
  }

  createLayoutControls() {
    const controls = document.createElement('div');
    controls.className = 'layout-controls';
    controls.innerHTML = `
            <div class="layout-controls-container">
                <span class="layout-label">Layout:</span>
                <div class="layout-buttons">
                    <button class="layout-btn active" data-layout="grid" title="Grid Layout">
                        <i class="fas fa-th"></i>
                    </button>
                    <button class="layout-btn" data-layout="masonry" title="Masonry Layout">
                        <i class="fas fa-th-list"></i>
                    </button>
                    <button class="layout-btn" data-layout="zigzag" title="Zigzag Layout">
                        <i class="fas fa-random"></i>
                    </button>
                </div>
            </div>
        `;

    const firstCategory = document.querySelector('.service-category');
    if (firstCategory) {
      firstCategory.parentNode.insertBefore(controls, firstCategory);
      // After creating controls, cache the button container and buttons
      this.controlsContainer = controls.querySelector('.layout-buttons');
      this.buttons = controls.querySelectorAll('.layout-btn');
    }
  }

  bindEvents() {
    // Use event delegation on the container
    if (this.controlsContainer) {
      this.controlsContainer.addEventListener('click', (e) => {
        const button = e.target.closest('.layout-btn');
        if (button) {
          const layout = button.dataset.layout;
          this.switchLayout(layout);
          this.updateActiveButton(button);
        }
      });
    }
  }

  switchLayout(layout) {
    if (!this.layouts.includes(layout) || layout === this.currentLayout) {return;}

    this.currentLayout = layout;

    this.grids.forEach(grid => {
      // Remove all layout classes
      this.layouts.forEach(l => grid.classList.remove(l));

      // Add new layout class
      if (layout !== 'grid') {
        grid.classList.add(layout);
      }

      // Add smooth transition
      grid.style.transition = 'all 0.5s ease';
      setTimeout(() => {
        grid.style.transition = '';
      }, 500);
    });
  }

  updateActiveButton(activeBtn) {
    this.buttons.forEach(btn => btn.classList.remove('active'));
    activeBtn.classList.add('active');
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new LayoutSwitcher();
});

// Enhanced scroll animations for cards
document.addEventListener('DOMContentLoaded', () => {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        // Staggered animation
        setTimeout(() => {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0) scale(1)';
        }, index * 100);
      }
    });
  }, observerOptions);

  // Observe all service cards with enhanced animations
  const cards = document.querySelectorAll('.service-card');
  cards.forEach((card, index) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(50px) scale(0.9)';
    card.style.transition = 'opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1), transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
    card.style.transitionDelay = `${index * 0.1}s`;
    observer.observe(card);
  });

  // Add click animations
  cards.forEach(card => {
    card.addEventListener('click', function(e) {
      // Ripple effect
      const ripple = document.createElement('span');
      const rect = this.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;

      ripple.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
                background: rgba(212, 165, 116, 0.3);
                border-radius: 50%;
                transform: scale(0);
                animation: ripple 0.6s linear;
                pointer-events: none;
            `;

      this.appendChild(ripple);

      setTimeout(() => {
        ripple.remove();
      }, 600);
    });
  });

  // Add CSS for ripple animation
  const style = document.createElement('style');
  style.textContent = `
        @keyframes ripple {
            to {
                transform: scale(2);
                opacity: 0;
            }
        }
    `;
  document.head.appendChild(style);
});
