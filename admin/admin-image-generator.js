/**
 * Admin Image Generator voor Yannova Ramen en Deuren
 * Beheert AI image generation in het admin dashboard
 */

class AdminImageGenerator {
    constructor() {
        this.apiBaseUrl = '/api/gemini';
        this.selectedImages = new Set();
        this.generatedImages = [];
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadExistingImages();
    }

    bindEvents() {
        // Generate images button
        document.getElementById('generate-images-btn')?.addEventListener('click', () => {
            this.generateImages();
        });

        // Clear gallery button
        document.getElementById('clear-gallery-btn')?.addEventListener('click', () => {
            this.clearGallery();
        });

        // Integration buttons
        document.querySelectorAll('.integration-card button').forEach(button => {
            button.addEventListener('click', (e) => {
                const usage = e.target.getAttribute('onclick')?.match(/integrateImage\('([^']+)'\)/)?.[1];
                if (usage) {
                    this.integrateImages(usage);
                }
            });
        });
    }

    async generateImages() {
        const formData = this.getFormData();
        
        if (!formData.projectType) {
            this.showError('Selecteer een project type');
            return;
        }

        this.showLoading(true);
        
        try {
            const response = await fetch(`${this.apiBaseUrl}/generate-gallery`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    projectType: formData.projectType,
                    count: parseInt(formData.imageCount) || 3,
                    style: formData.style,
                    timeOfDay: formData.timeOfDay,
                    buildingType: formData.buildingType,
                    customPrompt: formData.customPrompt
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.error || 'Fout bij het genereren van afbeeldingen');
            }

            this.displayImages(data.images);
            this.showSuccess(`${data.images.length} afbeeldingen gegenereerd!`);
            
        } catch (error) {
            console.error('Fout bij het genereren van afbeeldingen:', error);
            this.showError('Kon geen afbeeldingen genereren. Probeer het opnieuw.');
        } finally {
            this.showLoading(false);
        }
    }

    getFormData() {
        return {
            projectType: document.getElementById('admin-project-type')?.value || '',
            buildingType: document.getElementById('admin-building-type')?.value || '',
            style: document.getElementById('admin-style')?.value || '',
            timeOfDay: document.getElementById('admin-time-of-day')?.value || '',
            imageCount: document.getElementById('admin-image-count')?.value || '3',
            imageUsage: document.getElementById('admin-image-usage')?.value || 'gallery',
            customPrompt: document.getElementById('admin-custom-prompt')?.value || ''
        };
    }

    displayImages(images) {
        const container = document.getElementById('admin-image-container');
        if (!container) return;

        // Clear existing images
        container.innerHTML = '';

        images.forEach((image, index) => {
            const imageElement = this.createImageElement(image, index);
            container.appendChild(imageElement);
        });

        this.generatedImages = images;
        this.updateIntegrationButtons();
    }

    createImageElement(image, index) {
        const imageDiv = document.createElement('div');
        imageDiv.className = 'image-item';
        imageDiv.innerHTML = `
            <div class="image-wrapper">
                <img src="${image.url}" alt="${image.alt || 'Generated image'}" loading="lazy">
                <div class="image-overlay">
                    <div class="image-actions">
                        <button class="btn btn-sm btn-primary select-image" data-index="${index}">
                            <i class="fas fa-check"></i> Selecteer
                        </button>
                        <button class="btn btn-sm btn-secondary download-image" data-index="${index}">
                            <i class="fas fa-download"></i> Download
                        </button>
                    </div>
                </div>
            </div>
            <div class="image-info">
                <h4>${image.title || 'Generated Image'}</h4>
                <p>${image.description || 'AI gegenereerde afbeelding'}</p>
            </div>
        `;

        // Bind events
        imageDiv.querySelector('.select-image').addEventListener('click', (e) => {
            this.toggleImageSelection(parseInt(e.target.dataset.index));
        });

        imageDiv.querySelector('.download-image').addEventListener('click', (e) => {
            this.downloadImage(parseInt(e.target.dataset.index));
        });

        return imageDiv;
    }

    toggleImageSelection(index) {
        const image = this.generatedImages[index];
        if (!image) return;

        const button = document.querySelector(`[data-index="${index}"].select-image`);
        const imageItem = button.closest('.image-item');

        if (this.selectedImages.has(index)) {
            this.selectedImages.delete(index);
            button.innerHTML = '<i class="fas fa-check"></i> Selecteer';
            button.classList.remove('selected');
            imageItem.classList.remove('selected');
        } else {
            this.selectedImages.add(index);
            button.innerHTML = '<i class="fas fa-times"></i> Deselecteer';
            button.classList.add('selected');
            imageItem.classList.add('selected');
        }

        this.updateIntegrationButtons();
    }

    downloadImage(index) {
        const image = this.generatedImages[index];
        if (!image) return;

        const link = document.createElement('a');
        link.href = image.url;
        link.download = `yannova-${image.title || 'image'}-${index + 1}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    updateIntegrationButtons() {
        const hasSelection = this.selectedImages.size > 0;
        const buttons = document.querySelectorAll('.integration-card button');
        
        buttons.forEach(button => {
            button.disabled = !hasSelection;
            if (hasSelection) {
                button.classList.remove('disabled');
            } else {
                button.classList.add('disabled');
            }
        });

        // Update selection count
        const selectionInfo = document.querySelector('.selection-info');
        if (selectionInfo) {
            selectionInfo.textContent = `${this.selectedImages.size} afbeelding(en) geselecteerd`;
        }
    }

    async integrateImages(usage) {
        if (this.selectedImages.size === 0) {
            this.showError('Selecteer eerst afbeeldingen om te integreren');
            return;
        }

        const selectedImageData = Array.from(this.selectedImages).map(index => ({
            ...this.generatedImages[index],
            index
        }));

        try {
            const response = await fetch(`${this.apiBaseUrl}/admin/save-image`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    images: selectedImageData,
                    usage: usage,
                    section: this.getFormData().imageUsage
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.error || 'Fout bij het integreren van afbeeldingen');
            }

            this.showSuccess(`Afbeeldingen succesvol geïntegreerd voor ${usage}!`);
            this.clearSelection();
            
        } catch (error) {
            console.error('Fout bij het integreren van afbeeldingen:', error);
            this.showError('Kon afbeeldingen niet integreren. Probeer het opnieuw.');
        }
    }

    clearSelection() {
        this.selectedImages.clear();
        document.querySelectorAll('.image-item.selected').forEach(item => {
            item.classList.remove('selected');
        });
        document.querySelectorAll('.select-image.selected').forEach(button => {
            button.innerHTML = '<i class="fas fa-check"></i> Selecteer';
            button.classList.remove('selected');
        });
        this.updateIntegrationButtons();
    }

    clearGallery() {
        const container = document.getElementById('admin-image-container');
        if (container) {
            container.innerHTML = '<p class="no-images">Geen afbeeldingen gegenereerd. Klik op "Genereer Afbeeldingen" om te beginnen.</p>';
        }
        this.generatedImages = [];
        this.clearSelection();
    }

    async loadExistingImages() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/admin/images`);
            if (response.ok) {
                const data = await response.json();
                if (data.success && data.images.length > 0) {
                    this.displayImages(data.images);
                }
            }
        } catch (error) {
            console.error('Fout bij het laden van bestaande afbeeldingen:', error);
        }
    }

    showLoading(show) {
        const button = document.getElementById('generate-images-btn');
        if (button) {
            button.disabled = show;
            if (show) {
                button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Genereren...';
            } else {
                button.innerHTML = '<i class="fas fa-magic"></i> Genereer Afbeeldingen';
            }
        }
    }

    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
        `;

        // Add to page
        document.body.appendChild(notification);

        // Show notification
        setTimeout(() => notification.classList.add('show'), 100);

        // Remove notification after 5 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => document.body.removeChild(notification), 300);
        }, 5000);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.adminImageGenerator = new AdminImageGenerator();
});

// Global function for integration buttons
function integrateImage(usage) {
    if (window.adminImageGenerator) {
        window.adminImageGenerator.integrateImages(usage);
    }
}