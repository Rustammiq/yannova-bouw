// Content Management JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Initialize content management
    initializeContentManagement();
    loadContentData();
    setupEventListeners();
    loadMediaLibrary();
});

let contentData = {};
let mediaLibrary = [];
let currentEditingService = null;

function initializeContentManagement() {
    // Initialize character counters
    updateCharacterCounters();
    
    // Load default content structure
    contentData = {
        seo: {
            pageTitle: 'Yannova Ramen en Deuren | Professionele Ramen en Deuren',
            metaDescription: 'Yannova Ramen en Deuren - Uw specialist in hoogwaardige ramen en deuren. Professionele installatie en advies voor uw woning.',
            metaKeywords: 'ramen, deuren, schuifdeuren, garagedeuren, installatie, renovatie, isolatieglas',
            ogTitle: 'Yannova Ramen en Deuren | Professionele Ramen en Deuren',
            ogDescription: 'Uw specialist in hoogwaardige ramen en deuren. Professionele installatie en advies voor uw woning.',
            ogImage: 'https://yannovabouw.nl/assets/images/about-team.jpg',
            businessName: 'Yannova Ramen en Deuren',
            businessPhone: '+31-123-456-789',
            businessEmail: 'info@yannovabouw.nl',
            businessAddress: 'Hoofdstraat 123, 1000 AB Amsterdam, Nederland'
        },
        homepage: {
            hero: {
                title: 'Ramen en Deuren dromen?',
                subtitle: 'Wij realiseren ze graag.',
                buttonText: 'Vraag een offerte aan',
                backgroundImage: '../assets/images/hero-bg.jpg'
            },
            about: {
                title: 'Over',
                subtitle: 'Uw specialist in ramen en deuren',
                text: 'Een droomhuis realiseren met perfecte ramen en deuren is zoveel fijner met een toegewijde specialist aan uw zijde.\n\nYannova Ramen en Deuren is uw ervaren partner voor hoogwaardige ramen en deuren. Wij realiseren zowel klassieke als moderne oplossingen voor particulieren en professionals en dit voor ieders budget.\n\nVan het eerste advies tot de oplevering: we gaan steeds voor perfectie.',
                image: '../assets/images/about-team.jpg'
            },
            services: {
                title: 'Aanbod',
                subtitle: 'Professionele oplossingen voor uw woning',
                items: [
                    {
                        icon: 'fas fa-window-maximize',
                        title: 'Ramen',
                        description: 'Hoogwaardige ramen in verschillende stijlen en materialen. Van klassiek tot modern, energiezuinig isolatieglas voor optimaal comfort.'
                    },
                    {
                        icon: 'fas fa-door-open',
                        title: 'Deuren',
                        description: 'Stijlvolle binnendeuren en veilige buitendeuren. Volledig op maat gemaakt voor elke woning en stijl.'
                    },
                    {
                        icon: 'fas fa-door-closed',
                        title: 'Schuifdeuren',
                        description: 'Moderne schuifdeuren voor een open en ruimtelijk gevoel. Perfect voor binnen en buitengebruik.'
                    },
                    {
                        icon: 'fas fa-warehouse',
                        title: 'Garagedeuren',
                        description: 'Professionele garagedeuren met hoge isolatiewaarden. Veilig, duurzaam en stijlvol.'
                    }
                ]
            },
            contact: {
                title: 'Contact',
                subtitle: 'Uw bouwplannen bespreken?',
                address: 'Industrieweg 123, 1234 AB Amsterdam',
                phone: '+32 (0)477 28 10 28',
                email: 'info@yannova.nl',
                hours: 'Ma-Vr: 8:00-18:00 | Za: 9:00-16:00'
            }
        }
    };
}

function setupEventListeners() {
    // Character counters
    document.getElementById('page-title').addEventListener('input', updateCharacterCounters);
    document.getElementById('meta-description').addEventListener('input', updateCharacterCounters);

    // Save all changes button
    document.getElementById('save-all-changes').addEventListener('click', saveAllChanges);

    // Preview SEO button
    document.getElementById('preview-seo').addEventListener('click', previewSEO);

    // Image upload handlers
    setupImageUploads();

    // Service management
    document.getElementById('add-service').addEventListener('click', openServiceModal);
    document.getElementById('save-service').addEventListener('click', saveService);
    document.getElementById('cancel-service').addEventListener('click', closeServiceModal);
    document.getElementById('close-service-modal').addEventListener('click', closeServiceModal);

    // Media upload
    document.getElementById('upload-media').addEventListener('click', openMediaUpload);

    // Auto-save on input changes
    setupAutoSave();
}

function updateCharacterCounters() {
    const titleCounter = document.getElementById('title-counter');
    const descriptionCounter = document.getElementById('description-counter');
    const pageTitle = document.getElementById('page-title').value;
    const metaDescription = document.getElementById('meta-description').value;

    titleCounter.textContent = pageTitle.length;
    descriptionCounter.textContent = metaDescription.length;

    // Color coding
    titleCounter.style.color = pageTitle.length > 60 ? '#e74c3c' : '#27ae60';
    descriptionCounter.style.color = metaDescription.length > 160 ? '#e74c3c' : '#27ae60';
}

function setupImageUploads() {
    const imageInputs = ['hero-background', 'about-image'];
    
    imageInputs.forEach(inputId => {
        const input = document.getElementById(inputId);
        const previewId = inputId.replace('-background', '-preview').replace('-image', '-preview');
        const preview = document.getElementById(previewId);
        
        input.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    preview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
                };
                reader.readAsDataURL(file);
            }
        });
    });
}

function loadContentData() {
    // Load SEO data
    document.getElementById('page-title').value = contentData.seo.pageTitle;
    document.getElementById('meta-description').value = contentData.seo.metaDescription;
    document.getElementById('meta-keywords').value = contentData.seo.metaKeywords;
    document.getElementById('og-title').value = contentData.seo.ogTitle;
    document.getElementById('og-description').value = contentData.seo.ogDescription;
    document.getElementById('og-image').value = contentData.seo.ogImage;
    document.getElementById('business-name').value = contentData.seo.businessName;
    document.getElementById('business-phone').value = contentData.seo.businessPhone;
    document.getElementById('business-email').value = contentData.seo.businessEmail;
    document.getElementById('business-address').value = contentData.seo.businessAddress;

    // Load homepage content
    document.getElementById('hero-title').value = contentData.homepage.hero.title;
    document.getElementById('hero-subtitle').value = contentData.homepage.hero.subtitle;
    document.getElementById('hero-button-text').value = contentData.homepage.hero.buttonText;
    
    document.getElementById('about-title').value = contentData.homepage.about.title;
    document.getElementById('about-subtitle').value = contentData.homepage.about.subtitle;
    document.getElementById('about-text').value = contentData.homepage.about.text;
    
    document.getElementById('services-title').value = contentData.homepage.services.title;
    document.getElementById('services-subtitle').value = contentData.homepage.services.subtitle;
    
    document.getElementById('contact-title').value = contentData.homepage.contact.title;
    document.getElementById('contact-subtitle').value = contentData.homepage.contact.subtitle;
    document.getElementById('contact-address').value = contentData.homepage.contact.address;
    document.getElementById('contact-phone').value = contentData.homepage.contact.phone;
    document.getElementById('contact-email').value = contentData.homepage.contact.email;
    document.getElementById('contact-hours').value = contentData.homepage.contact.hours;

    // Load services
    loadServices();
}

function loadServices() {
    const servicesList = document.getElementById('services-list');
    servicesList.innerHTML = '';

    contentData.homepage.services.items.forEach((service, index) => {
        const serviceElement = createServiceElement(service, index);
        servicesList.appendChild(serviceElement);
    });
}

function createServiceElement(service, index) {
    const div = document.createElement('div');
    div.className = 'service-item';
    div.innerHTML = `
        <div class="service-preview">
            <i class="${service.icon}"></i>
            <div class="service-info">
                <h4>${service.title}</h4>
                <p>${service.description}</p>
            </div>
        </div>
        <div class="service-actions">
            <button class="btn btn-sm btn-secondary edit-service" data-index="${index}">
                <i class="fas fa-edit"></i>
            </button>
            <button class="btn btn-sm btn-danger delete-service" data-index="${index}">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;

    // Add event listeners
    div.querySelector('.edit-service').addEventListener('click', () => editService(index));
    div.querySelector('.delete-service').addEventListener('click', () => deleteService(index));

    return div;
}

function openServiceModal(service = null) {
    currentEditingService = service;
    const modal = document.getElementById('service-modal');
    
    if (service) {
        document.getElementById('service-icon').value = service.icon;
        document.getElementById('service-title').value = service.title;
        document.getElementById('service-description').value = service.description;
    } else {
        document.getElementById('service-icon').value = 'fas fa-window-maximize';
        document.getElementById('service-title').value = '';
        document.getElementById('service-description').value = '';
    }
    
    modal.style.display = 'block';
}

function closeServiceModal() {
    document.getElementById('service-modal').style.display = 'none';
    currentEditingService = null;
}

function saveService() {
    const icon = document.getElementById('service-icon').value;
    const title = document.getElementById('service-title').value;
    const description = document.getElementById('service-description').value;

    if (!title || !description) {
        alert('Vul alle velden in');
        return;
    }

    const service = { icon, title, description };

    if (currentEditingService !== null) {
        contentData.homepage.services.items[currentEditingService] = service;
    } else {
        contentData.homepage.services.items.push(service);
    }

    loadServices();
    closeServiceModal();
}

function editService(index) {
    const service = contentData.homepage.services.items[index];
    openServiceModal(service);
}

function deleteService(index) {
    if (confirm('Weet je zeker dat je deze dienst wilt verwijderen?')) {
        contentData.homepage.services.items.splice(index, 1);
        loadServices();
    }
}

function loadMediaLibrary() {
    // Simulate loading media from server
    mediaLibrary = [
        {
            id: 1,
            name: 'hero-bg.jpg',
            url: '../assets/images/hero-bg.jpg',
            type: 'image',
            size: '2.1 MB',
            uploaded: '2023-12-01'
        },
        {
            id: 2,
            name: 'about-team.jpg',
            url: '../assets/images/about-team.jpg',
            type: 'image',
            size: '1.8 MB',
            uploaded: '2023-12-01'
        }
    ];

    renderMediaLibrary();
}

function renderMediaLibrary() {
    const mediaGrid = document.getElementById('media-grid');
    mediaGrid.innerHTML = '';

    mediaLibrary.forEach(media => {
        const mediaElement = createMediaElement(media);
        mediaGrid.appendChild(mediaElement);
    });
}

function createMediaElement(media) {
    const div = document.createElement('div');
    div.className = 'media-item';
    div.innerHTML = `
        <div class="media-preview">
            <img src="${media.url}" alt="${media.name}">
            <div class="media-overlay">
                <button class="btn btn-sm btn-primary use-media" data-url="${media.url}">
                    <i class="fas fa-check"></i>
                </button>
                <button class="btn btn-sm btn-danger delete-media" data-id="${media.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
        <div class="media-info">
            <h4>${media.name}</h4>
            <p>${media.size} • ${media.uploaded}</p>
        </div>
    `;

    // Add event listeners
    div.querySelector('.use-media').addEventListener('click', () => useMedia(media.url));
    div.querySelector('.delete-media').addEventListener('click', () => deleteMedia(media.id));

    return div;
}

function useMedia(url) {
    // This would be implemented based on which image field is currently focused
    console.log('Using media:', url);
}

function deleteMedia(id) {
    if (confirm('Weet je zeker dat je deze afbeelding wilt verwijderen?')) {
        mediaLibrary = mediaLibrary.filter(media => media.id !== id);
        renderMediaLibrary();
    }
}

function openMediaUpload() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;
    
    input.addEventListener('change', function(e) {
        const files = Array.from(e.target.files);
        files.forEach(file => {
            uploadMediaFile(file);
        });
    });
    
    input.click();
}

function uploadMediaFile(file) {
    // Simulate file upload
    const reader = new FileReader();
    reader.onload = function(e) {
        const newMedia = {
            id: Date.now(),
            name: file.name,
            url: e.target.result,
            type: 'image',
            size: (file.size / 1024 / 1024).toFixed(1) + ' MB',
            uploaded: new Date().toLocaleDateString('nl-NL')
        };
        
        mediaLibrary.unshift(newMedia);
        renderMediaLibrary();
    };
    reader.readAsDataURL(file);
}

function setupAutoSave() {
    const inputs = document.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
        input.addEventListener('change', () => {
            // Auto-save after 2 seconds of inactivity
            clearTimeout(window.autoSaveTimeout);
            window.autoSaveTimeout = setTimeout(saveAllChanges, 2000);
        });
    });
}

async function saveAllChanges() {
    try {
        // Collect all form data
        const formData = {
            seo: {
                pageTitle: document.getElementById('page-title').value,
                metaDescription: document.getElementById('meta-description').value,
                metaKeywords: document.getElementById('meta-keywords').value,
                ogTitle: document.getElementById('og-title').value,
                ogDescription: document.getElementById('og-description').value,
                ogImage: document.getElementById('og-image').value,
                businessName: document.getElementById('business-name').value,
                businessPhone: document.getElementById('business-phone').value,
                businessEmail: document.getElementById('business-email').value,
                businessAddress: document.getElementById('business-address').value
            },
            homepage: {
                hero: {
                    title: document.getElementById('hero-title').value,
                    subtitle: document.getElementById('hero-subtitle').value,
                    buttonText: document.getElementById('hero-button-text').value,
                    backgroundImage: document.getElementById('hero-background').files[0] || contentData.homepage.hero.backgroundImage
                },
                about: {
                    title: document.getElementById('about-title').value,
                    subtitle: document.getElementById('about-subtitle').value,
                    text: document.getElementById('about-text').value,
                    image: document.getElementById('about-image').files[0] || contentData.homepage.about.image
                },
                services: contentData.homepage.services,
                contact: {
                    title: document.getElementById('contact-title').value,
                    subtitle: document.getElementById('contact-subtitle').value,
                    address: document.getElementById('contact-address').value,
                    phone: document.getElementById('contact-phone').value,
                    email: document.getElementById('contact-email').value,
                    hours: document.getElementById('contact-hours').value
                }
            },
            media: mediaLibrary
        };

        const response = await fetch('/api/admin/content', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            showNotification('Wijzigingen opgeslagen!', 'success');
        } else {
            throw new Error('Failed to save content');
        }
    } catch (error) {
        console.error('Save error:', error);
        showNotification('Fout bij opslaan. Probeer het opnieuw.', 'error');
    }
}

function previewSEO() {
    const previewWindow = window.open('', '_blank', 'width=800,height=600');
    const seoData = {
        title: document.getElementById('page-title').value,
        description: document.getElementById('meta-description').value,
        ogTitle: document.getElementById('og-title').value,
        ogDescription: document.getElementById('og-description').value,
        ogImage: document.getElementById('og-image').value
    };

    previewWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>SEO Preview</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .preview { border: 1px solid #ddd; padding: 20px; margin: 20px 0; }
                .search-result { margin: 20px 0; }
                .title { color: #1a0dab; font-size: 18px; margin-bottom: 5px; }
                .url { color: #006621; font-size: 14px; }
                .description { color: #545454; font-size: 14px; margin-top: 5px; }
                .social-preview { border: 1px solid #e1e8ed; padding: 15px; margin: 20px 0; }
                .social-image { width: 100%; max-width: 300px; height: 200px; object-fit: cover; }
            </style>
        </head>
        <body>
            <h1>SEO Preview</h1>
            
            <div class="preview">
                <h2>Google Search Result</h2>
                <div class="search-result">
                    <div class="title">${seoData.title}</div>
                    <div class="url">https://yannovabouw.nl</div>
                    <div class="description">${seoData.description}</div>
                </div>
            </div>

            <div class="preview">
                <h2>Social Media Preview (Facebook/Twitter)</h2>
                <div class="social-preview">
                    <img src="${seoData.ogImage}" alt="Preview" class="social-image">
                    <h3>${seoData.ogTitle}</h3>
                    <p>${seoData.ogDescription}</p>
                </div>
            </div>
        </body>
        </html>
    `);
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Close modal when clicking outside
window.addEventListener('click', function(e) {
    const modal = document.getElementById('service-modal');
    if (e.target === modal) {
        closeServiceModal();
    }
});
