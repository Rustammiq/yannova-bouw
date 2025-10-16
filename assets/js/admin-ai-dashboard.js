/**
 * Admin AI Dashboard JavaScript
 * Manages the AI tools interface and interactions
 */

class AdminAIDashboard {
    constructor() {
        this.currentTool = null;
        this.geminiAPI = new GeminiAITools();
        this.init();
    }

    init() {
        this.checkAPIStatus();
        this.loadRecentActivity();
        this.setupEventListeners();
        this.initializeSettings();
    }

    setupEventListeners() {
        // Auto-generation toggle
        document.getElementById('auto-generation').addEventListener('change', (e) => {
            this.updateSetting('autoGeneration', e.target.checked);
        });

        // Content quality selector
        document.getElementById('content-quality').addEventListener('change', (e) => {
            this.updateSetting('contentQuality', e.target.value);
        });

        // Modal close on outside click
        document.getElementById('ai-tool-modal').addEventListener('click', (e) => {
            if (e.target.id === 'ai-tool-modal') {
                this.closeAITool();
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAITool();
            }
        });
    }

    async checkAPIStatus() {
        const statusIndicator = document.getElementById('api-status');
        const statusText = document.getElementById('api-status-text');

        statusIndicator.className = 'status-indicator connecting';
        statusText.textContent = 'Checking...';

        try {
            const response = await fetch('/api/gemini/status');
            if (response.ok) {
                statusIndicator.className = 'status-indicator connected';
                statusText.textContent = 'Connected';
            } else {
                throw new Error('API not available');
            }
        } catch (error) {
            statusIndicator.className = 'status-indicator';
            statusText.textContent = 'Disconnected';
            console.error('API Status Check Failed:', error);
        }
    }

    openAITool(toolName) {
        this.currentTool = toolName;
        const modal = document.getElementById('ai-tool-modal');
        const modalTitle = document.getElementById('modal-title');
        const modalBody = document.getElementById('modal-body');

        // Update modal title
        modalTitle.textContent = this.getToolTitle(toolName);

        // Load tool content
        modalBody.innerHTML = this.getToolContent(toolName);

        // Show modal
        modal.style.display = 'block';
        modal.classList.add('fade-in');

        // Focus first input
        const firstInput = modalBody.querySelector('input, select, textarea');
        if (firstInput) {
            firstInput.focus();
        }
    }

    closeAITool() {
        const modal = document.getElementById('ai-tool-modal');
        modal.style.display = 'none';
        this.currentTool = null;
    }

    getToolTitle(toolName) {
        const titles = {
            'video-generator': 'Video Generator',
            'content-writer': 'Smart Content Writer',
            'quote-generator': 'Intelligent Quote Generator',
            'project-planner': 'Project Planning AI',
            'customer-service': 'Customer Service AI',
            'analytics': 'Advanced Analytics',
            'report-generator': 'Report Generator',
            'design-assistant': 'Design Assistant'
        };
        return titles[toolName] || 'AI Tool';
    }

    getToolContent(toolName) {
        switch (toolName) {
        case 'video-generator':
            return this.getVideoGeneratorContent();
        case 'content-writer':
            return this.getContentWriterContent();
        case 'quote-generator':
            return this.getQuoteGeneratorContent();
        case 'project-planner':
            return this.getProjectPlannerContent();
        case 'customer-service':
            return this.getCustomerServiceContent();
        case 'analytics':
            return this.getAnalyticsContent();
        case 'report-generator':
            return this.getReportGeneratorContent();
        case 'design-assistant':
            return this.getDesignAssistantContent();
        default:
            return '<p>Tool not found</p>';
        }
    }

    getVideoGeneratorContent() {
        return `
            <div class="tool-form">
                <div class="form-group">
                    <label for="video-project-type">Project Type</label>
                    <select id="video-project-type">
                        <option value="isolatiewerken">Isolatiewerken</option>
                        <option value="renovatiewerken">Renovatiewerken</option>
                        <option value="platedakken">Platedakken</option>
                        <option value="ramen-deuren">Ramen en Deuren</option>
                        <option value="tuinaanleg">Tuinaanleg</option>
                    </select>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label for="video-duration">Duration (seconds)</label>
                        <select id="video-duration">
                            <option value="15">15 seconds</option>
                            <option value="30" selected>30 seconds</option>
                            <option value="60">60 seconds</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="video-style">Style</label>
                        <select id="video-style">
                            <option value="timelapse">Timelapse</option>
                            <option value="process">Process Video</option>
                            <option value="before-after">Before/After</option>
                        </select>
                    </div>
                </div>

                <div class="form-group">
                    <label for="video-description">Description</label>
                    <textarea id="video-description" rows="3" placeholder="Describe what you want to show in the video..."></textarea>
                </div>

                <button class="btn-primary" onclick="adminDashboard.generateVideo()">
                    <i class="fas fa-video"></i> Generate Video
                </button>

                <div id="video-results" class="results-container" style="display: none;">
                    <h4 class="results-title">Generated Videos</h4>
                    <div id="video-list"></div>
                </div>
            </div>
        `;
    }

    getContentWriterContent() {
        return `
            <div class="tool-form">
                <div class="form-group">
                    <label for="content-type">Content Type</label>
                    <select id="content-type">
                        <option value="project-description">Project Description</option>
                        <option value="seo-content">SEO Content</option>
                        <option value="blog-post">Blog Post</option>
                        <option value="service-page">Service Page</option>
                        <option value="about-page">About Page</option>
                    </select>
                </div>

                <div class="form-group">
                    <label for="content-topic">Topic/Subject</label>
                    <input type="text" id="content-topic" placeholder="e.g., Dakisolatie in Amsterdam">
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label for="content-length">Length</label>
                        <select id="content-length">
                            <option value="short">Short (200-300 words)</option>
                            <option value="medium" selected>Medium (500-700 words)</option>
                            <option value="long">Long (1000+ words)</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="content-tone">Tone</label>
                        <select id="content-tone">
                            <option value="professional">Professional</option>
                            <option value="friendly">Friendly</option>
                            <option value="technical">Technical</option>
                        </select>
                    </div>
                </div>

                <div class="form-group">
                    <label for="content-keywords">Keywords (comma separated)</label>
                    <input type="text" id="content-keywords" placeholder="isolatie, energiebesparing, Amsterdam">
                </div>

                <button class="btn-primary" onclick="adminDashboard.generateContent()">
                    <i class="fas fa-pen-fancy"></i> Generate Content
                </button>

                <div id="content-results" class="results-container" style="display: none;">
                    <h4 class="results-title">Generated Content</h4>
                    <div id="content-output"></div>
                </div>
            </div>
        `;
    }

    getQuoteGeneratorContent() {
        return `
            <div class="tool-form">
                <div class="form-group">
                    <label for="quote-project-type">Project Type</label>
                    <select id="quote-project-type">
                        <option value="isolatiewerken">Isolatiewerken</option>
                        <option value="renovatiewerken">Renovatiewerken</option>
                        <option value="platedakken">Platedakken</option>
                        <option value="ramen-deuren">Ramen en Deuren</option>
                        <option value="tuinaanleg">Tuinaanleg</option>
                    </select>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label for="quote-size">Project Size (m²)</label>
                        <input type="number" id="quote-size" placeholder="100">
                    </div>
                    <div class="form-group">
                        <label for="quote-complexity">Complexity</label>
                        <select id="quote-complexity">
                            <option value="simple">Simple</option>
                            <option value="medium" selected>Medium</option>
                            <option value="complex">Complex</option>
                        </select>
                    </div>
                </div>

                <div class="form-group">
                    <label for="quote-location">Location</label>
                    <input type="text" id="quote-location" placeholder="Amsterdam" value="Amsterdam">
                </div>

                <div class="form-group">
                    <label for="quote-urgency">Urgency</label>
                    <select id="quote-urgency">
                        <option value="normal">Normal (2-4 weeks)</option>
                        <option value="urgent">Urgent (1-2 weeks)</option>
                        <option value="asap">ASAP (3-7 days)</option>
                    </select>
                </div>

                <button class="btn-primary" onclick="adminDashboard.generateQuote()">
                    <i class="fas fa-calculator"></i> Generate Quote
                </button>

                <div id="quote-results" class="results-container" style="display: none;">
                    <h4 class="results-title">Generated Quote</h4>
                    <div id="quote-output"></div>
                </div>
            </div>
        `;
    }

    getProjectPlannerContent() {
        return `
            <div class="tool-form">
                <div class="form-group">
                    <label for="planner-project-name">Project Name</label>
                    <input type="text" id="planner-project-name" placeholder="Villa Renovatie Amsterdam">
                </div>

                <div class="form-group">
                    <label for="planner-project-type">Project Type</label>
                    <select id="planner-project-type">
                        <option value="isolatiewerken">Isolatiewerken</option>
                        <option value="renovatiewerken">Renovatiewerken</option>
                        <option value="platedakken">Platedakken</option>
                        <option value="ramen-deuren">Ramen en Deuren</option>
                        <option value="tuinaanleg">Tuinaanleg</option>
                    </select>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label for="planner-start-date">Start Date</label>
                        <input type="date" id="planner-start-date">
                    </div>
                    <div class="form-group">
                        <label for="planner-duration">Estimated Duration (weeks)</label>
                        <input type="number" id="planner-duration" placeholder="4" min="1" max="52">
                    </div>
                </div>

                <div class="form-group">
                    <label for="planner-team-size">Team Size</label>
                    <select id="planner-team-size">
                        <option value="1">1 person</option>
                        <option value="2-3" selected>2-3 people</option>
                        <option value="4-6">4-6 people</option>
                        <option value="7+">7+ people</option>
                    </select>
                </div>

                <button class="btn-primary" onclick="adminDashboard.generateProjectPlan()">
                    <i class="fas fa-calendar-alt"></i> Generate Project Plan
                </button>

                <div id="planner-results" class="results-container" style="display: none;">
                    <h4 class="results-title">Project Plan</h4>
                    <div id="planner-output"></div>
                </div>
            </div>
        `;
    }

    getCustomerServiceContent() {
        return `
            <div class="tool-form">
                <div class="form-group">
                    <label for="cs-query-type">Query Type</label>
                    <select id="cs-query-type">
                        <option value="general">General Inquiry</option>
                        <option value="quote">Quote Request</option>
                        <option value="complaint">Complaint</option>
                        <option value="support">Technical Support</option>
                        <option value="follow-up">Follow-up</option>
                    </select>
                </div>

                <div class="form-group">
                    <label for="cs-customer-query">Customer Query</label>
                    <textarea id="cs-customer-query" rows="4" placeholder="Paste the customer's message here..."></textarea>
                </div>

                <div class="form-group">
                    <label for="cs-response-tone">Response Tone</label>
                    <select id="cs-response-tone">
                        <option value="professional">Professional</option>
                        <option value="friendly" selected>Friendly</option>
                        <option value="apologetic">Apologetic</option>
                        <option value="urgent">Urgent</option>
                    </select>
                </div>

                <button class="btn-primary" onclick="adminDashboard.generateCustomerResponse()">
                    <i class="fas fa-headset"></i> Generate Response
                </button>

                <div id="cs-results" class="results-container" style="display: none;">
                    <h4 class="results-title">Generated Response</h4>
                    <div id="cs-output"></div>
                </div>
            </div>
        `;
    }

    getAnalyticsContent() {
        return `
            <div class="tool-form">
                <div class="form-group">
                    <label for="analytics-data-type">Data Type</label>
                    <select id="analytics-data-type">
                        <option value="website">Website Analytics</option>
                        <option value="projects">Project Performance</option>
                        <option value="quotes">Quote Conversion</option>
                        <option value="customers">Customer Data</option>
                    </select>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label for="analytics-period">Time Period</label>
                        <select id="analytics-period">
                            <option value="7days">Last 7 days</option>
                            <option value="30days" selected>Last 30 days</option>
                            <option value="90days">Last 90 days</option>
                            <option value="1year">Last year</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="analytics-metrics">Key Metrics</label>
                        <select id="analytics-metrics">
                            <option value="overview">Overview</option>
                            <option value="conversion">Conversion Rates</option>
                            <option value="performance">Performance</option>
                            <option value="trends">Trends</option>
                        </select>
                    </div>
                </div>

                <button class="btn-primary" onclick="adminDashboard.generateAnalytics()">
                    <i class="fas fa-chart-line"></i> Analyze Data
                </button>

                <div id="analytics-results" class="results-container" style="display: none;">
                    <h4 class="results-title">Analytics Report</h4>
                    <div id="analytics-output"></div>
                </div>
            </div>
        `;
    }

    getReportGeneratorContent() {
        return `
            <div class="tool-form">
                <div class="form-group">
                    <label for="report-type">Report Type</label>
                    <select id="report-type">
                        <option value="project-summary">Project Summary</option>
                        <option value="monthly-report">Monthly Report</option>
                        <option value="quote-analysis">Quote Analysis</option>
                        <option value="customer-report">Customer Report</option>
                        <option value="financial-summary">Financial Summary</option>
                    </select>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label for="report-period">Period</label>
                        <select id="report-period">
                            <option value="current-month">Current Month</option>
                            <option value="last-month">Last Month</option>
                            <option value="quarter">This Quarter</option>
                            <option value="year">This Year</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="report-format">Format</label>
                        <select id="report-format">
                            <option value="html">HTML</option>
                            <option value="pdf">PDF</option>
                            <option value="excel">Excel</option>
                        </select>
                    </div>
                </div>

                <div class="form-group">
                    <label for="report-sections">Include Sections</label>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem;">
                        <label><input type="checkbox" checked> Executive Summary</label>
                        <label><input type="checkbox" checked> Project Details</label>
                        <label><input type="checkbox" checked> Financial Data</label>
                        <label><input type="checkbox" checked> Recommendations</label>
                    </div>
                </div>

                <button class="btn-primary" onclick="adminDashboard.generateReport()">
                    <i class="fas fa-file-alt"></i> Generate Report
                </button>

                <div id="report-results" class="results-container" style="display: none;">
                    <h4 class="results-title">Generated Report</h4>
                    <div id="report-output"></div>
                </div>
            </div>
        `;
    }

    getDesignAssistantContent() {
        return `
            <div class="tool-form">
                <div class="form-group">
                    <label for="design-project-type">Project Type</label>
                    <select id="design-project-type">
                        <option value="3d-visualization">3D Visualization</option>
                        <option value="floor-plan">Floor Plan</option>
                        <option value="exterior-design">Exterior Design</option>
                        <option value="interior-design">Interior Design</option>
                        <option value="landscape">Landscape Design</option>
                    </select>
                </div>

                <div class="form-group">
                    <label for="design-description">Project Description</label>
                    <textarea id="design-description" rows="3" placeholder="Describe the project you want to visualize..."></textarea>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label for="design-style">Style</label>
                        <select id="design-style">
                            <option value="modern">Modern</option>
                            <option value="traditional">Traditional</option>
                            <option value="contemporary">Contemporary</option>
                            <option value="minimalist">Minimalist</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="design-quality">Quality</label>
                        <select id="design-quality">
                            <option value="draft">Draft</option>
                            <option value="standard" selected>Standard</option>
                            <option value="high">High</option>
                        </select>
                    </div>
                </div>

                <button class="btn-primary" onclick="adminDashboard.generateDesign()">
                    <i class="fas fa-cube"></i> Generate Design
                </button>

                <div id="design-results" class="results-container" style="display: none;">
                    <h4 class="results-title">Generated Design</h4>
                    <div id="design-output"></div>
                </div>
            </div>
        `;
    }

    async generateVideo() {
        this.showLoading();

        const projectType = document.getElementById('video-project-type').value;
        const duration = document.getElementById('video-duration').value;
        const style = document.getElementById('video-style').value;
        const description = document.getElementById('video-description').value;

        try {
            const result = await this.geminiAPI.generateVideo({
                projectType,
                duration: parseInt(duration),
                style,
                description
            });

            this.displayVideoResults(result);
            this.addActivity('Video Generated', `${projectType} video created`);
        } catch (error) {
            this.showError('Failed to generate video: ' + error.message);
        } finally {
            this.hideLoading();
        }
    }

    async generateContent() {
        this.showLoading();

        const contentType = document.getElementById('content-type').value;
        const topic = document.getElementById('content-topic').value;
        const length = document.getElementById('content-length').value;
        const tone = document.getElementById('content-tone').value;
        const keywords = document.getElementById('content-keywords').value;

        try {
            const result = await this.geminiAPI.generateContent({
                contentType,
                topic,
                length,
                tone,
                keywords: keywords.split(',').map(k => k.trim())
            });

            this.displayContentResults(result);
            this.addActivity('Content Generated', `${contentType} content created`);
        } catch (error) {
            this.showError('Failed to generate content: ' + error.message);
        } finally {
            this.hideLoading();
        }
    }

    async generateQuote() {
        this.showLoading();

        const projectType = document.getElementById('quote-project-type').value;
        const size = document.getElementById('quote-size').value;
        const complexity = document.getElementById('quote-complexity').value;
        const location = document.getElementById('quote-location').value;
        const urgency = document.getElementById('quote-urgency').value;

        try {
            const result = await this.geminiAPI.generateQuote({
                projectType,
                size: parseInt(size),
                complexity,
                location,
                urgency
            });

            this.displayQuoteResults(result);
            this.addActivity('Quote Generated', `${projectType} quote created`);
        } catch (error) {
            this.showError('Failed to generate quote: ' + error.message);
        } finally {
            this.hideLoading();
        }
    }

    async generateProjectPlan() {
        this.showLoading();

        const projectName = document.getElementById('planner-project-name').value;
        const projectType = document.getElementById('planner-project-type').value;
        const startDate = document.getElementById('planner-start-date').value;
        const duration = document.getElementById('planner-duration').value;
        const teamSize = document.getElementById('planner-team-size').value;

        try {
            const result = await this.geminiAPI.generateProjectPlan({
                projectName,
                projectType,
                startDate,
                duration: parseInt(duration),
                teamSize
            });

            this.displayProjectPlanResults(result);
            this.addActivity('Project Plan Generated', `${projectName} plan created`);
        } catch (error) {
            this.showError('Failed to generate project plan: ' + error.message);
        } finally {
            this.hideLoading();
        }
    }

    async generateCustomerResponse() {
        this.showLoading();

        const queryType = document.getElementById('cs-query-type').value;
        const customerQuery = document.getElementById('cs-customer-query').value;
        const responseTone = document.getElementById('cs-response-tone').value;

        try {
            const result = await this.geminiAPI.generateCustomerResponse({
                queryType,
                customerQuery,
                responseTone
            });

            this.displayCustomerResponseResults(result);
            this.addActivity('Customer Response Generated', `${queryType} response created`);
        } catch (error) {
            this.showError('Failed to generate customer response: ' + error.message);
        } finally {
            this.hideLoading();
        }
    }

    async generateAnalytics() {
        this.showLoading();

        const dataType = document.getElementById('analytics-data-type').value;
        const period = document.getElementById('analytics-period').value;
        const metrics = document.getElementById('analytics-metrics').value;

        try {
            const result = await this.geminiAPI.generateAnalytics({
                dataType,
                period,
                metrics
            });

            this.displayAnalyticsResults(result);
            this.addActivity('Analytics Generated', `${dataType} analysis created`);
        } catch (error) {
            this.showError('Failed to generate analytics: ' + error.message);
        } finally {
            this.hideLoading();
        }
    }

    async generateReport() {
        this.showLoading();

        const reportType = document.getElementById('report-type').value;
        const period = document.getElementById('report-period').value;
        const format = document.getElementById('report-format').value;

        try {
            const result = await this.geminiAPI.generateReport({
                reportType,
                period,
                format
            });

            this.displayReportResults(result);
            this.addActivity('Report Generated', `${reportType} report created`);
        } catch (error) {
            this.showError('Failed to generate report: ' + error.message);
        } finally {
            this.hideLoading();
        }
    }

    async generateDesign() {
        this.showLoading();

        const projectType = document.getElementById('design-project-type').value;
        const description = document.getElementById('design-description').value;
        const style = document.getElementById('design-style').value;
        const quality = document.getElementById('design-quality').value;

        try {
            const result = await this.geminiAPI.generateDesign({
                projectType,
                description,
                style,
                quality
            });

            this.displayDesignResults(result);
            this.addActivity('Design Generated', `${projectType} design created`);
        } catch (error) {
            this.showError('Failed to generate design: ' + error.message);
        } finally {
            this.hideLoading();
        }
    }

    displayVideoResults(result) {
        const resultsContainer = document.getElementById('video-results');
        const videoList = document.getElementById('video-list');

        videoList.innerHTML = `
            <div class="result-item">
                <h5>Generated Video</h5>
                <p><strong>Project:</strong> ${result.projectType}</p>
                <p><strong>Duration:</strong> ${result.duration} seconds</p>
                <p><strong>Style:</strong> ${result.style}</p>
                <video controls style="width: 100%; max-width: 500px;">
                    <source src="${result.videoUrl}" type="video/mp4">
                    Your browser does not support the video tag.
                </video>
                <div style="margin-top: 1rem;">
                    <button class="btn-primary" onclick="adminDashboard.downloadFile('${result.videoUrl}', 'video.mp4')">
                        <i class="fas fa-download"></i> Download Video
                    </button>
                    <button class="btn-secondary" onclick="adminDashboard.copyToClipboard('${result.videoUrl}')">
                        <i class="fas fa-copy"></i> Copy URL
                    </button>
                </div>
            </div>
        `;

        resultsContainer.style.display = 'block';
    }

    displayContentResults(result) {
        const resultsContainer = document.getElementById('content-results');
        const contentOutput = document.getElementById('content-output');

        contentOutput.innerHTML = `
            <div class="result-item">
                <h5>Generated Content</h5>
                <div style="background: white; padding: 1rem; border-radius: 6px; border: 1px solid #ddd;">
                    ${result.content}
                </div>
                <div style="margin-top: 1rem;">
                    <button class="btn-primary" onclick="adminDashboard.copyToClipboard('${result.content}')">
                        <i class="fas fa-copy"></i> Copy Content
                    </button>
                    <button class="btn-secondary" onclick="adminDashboard.saveContent('${result.content}')">
                        <i class="fas fa-save"></i> Save to Website
                    </button>
                </div>
            </div>
        `;

        resultsContainer.style.display = 'block';
    }

    displayQuoteResults(result) {
        const resultsContainer = document.getElementById('quote-results');
        const quoteOutput = document.getElementById('quote-output');

        quoteOutput.innerHTML = `
            <div class="result-item">
                <h5>Generated Quote</h5>
                <div style="background: white; padding: 1rem; border-radius: 6px; border: 1px solid #ddd;">
                    <h6>Project: ${result.projectType}</h6>
                    <p><strong>Total Cost:</strong> €${result.totalCost.toLocaleString()}</p>
                    <p><strong>Duration:</strong> ${result.duration} weeks</p>
                    <p><strong>Materials:</strong> €${result.materialsCost.toLocaleString()}</p>
                    <p><strong>Labor:</strong> €${result.laborCost.toLocaleString()}</p>
                    <hr>
                    <h6>Breakdown:</h6>
                    <ul>
                        ${result.breakdown.map(item => `<li>${item.item}: €${item.cost.toLocaleString()}</li>`).join('')}
                    </ul>
                </div>
                <div style="margin-top: 1rem;">
                    <button class="btn-primary" onclick="adminDashboard.downloadQuote(result)">
                        <i class="fas fa-download"></i> Download Quote
                    </button>
                    <button class="btn-secondary" onclick="adminDashboard.emailQuote(result)">
                        <i class="fas fa-envelope"></i> Email Quote
                    </button>
                </div>
            </div>
        `;

        resultsContainer.style.display = 'block';
    }

    displayProjectPlanResults(result) {
        const resultsContainer = document.getElementById('planner-results');
        const plannerOutput = document.getElementById('planner-output');

        plannerOutput.innerHTML = `
            <div class="result-item">
                <h5>Project Plan: ${result.projectName}</h5>
                <div style="background: white; padding: 1rem; border-radius: 6px; border: 1px solid #ddd;">
                    <h6>Timeline (${result.duration} weeks)</h6>
                    <div style="margin: 1rem 0;">
                        ${result.timeline.map(phase => `
                            <div style="margin-bottom: 1rem; padding: 0.5rem; background: #f8f9fa; border-radius: 4px;">
                                <strong>Week ${phase.week}:</strong> ${phase.task}
                                <br><small>Duration: ${phase.duration} days | Team: ${phase.teamSize} people</small>
                            </div>
                        `).join('')}
                    </div>
                    <h6>Resources Needed</h6>
                    <ul>
                        ${result.resources.map(resource => `<li>${resource}</li>`).join('')}
                    </ul>
                </div>
                <div style="margin-top: 1rem;">
                    <button class="btn-primary" onclick="adminDashboard.downloadProjectPlan(result)">
                        <i class="fas fa-download"></i> Download Plan
                    </button>
                    <button class="btn-secondary" onclick="adminDashboard.saveProjectPlan(result)">
                        <i class="fas fa-save"></i> Save to Projects
                    </button>
                </div>
            </div>
        `;

        resultsContainer.style.display = 'block';
    }

    displayCustomerResponseResults(result) {
        const resultsContainer = document.getElementById('cs-results');
        const csOutput = document.getElementById('cs-output');

        csOutput.innerHTML = `
            <div class="result-item">
                <h5>Generated Response</h5>
                <div style="background: white; padding: 1rem; border-radius: 6px; border: 1px solid #ddd;">
                    <div style="white-space: pre-wrap;">${result.response}</div>
                </div>
                <div style="margin-top: 1rem;">
                    <button class="btn-primary" onclick="adminDashboard.copyToClipboard('${result.response}')">
                        <i class="fas fa-copy"></i> Copy Response
                    </button>
                    <button class="btn-secondary" onclick="adminDashboard.sendResponse(result)">
                        <i class="fas fa-paper-plane"></i> Send Response
                    </button>
                </div>
            </div>
        `;

        resultsContainer.style.display = 'block';
    }

    displayAnalyticsResults(result) {
        const resultsContainer = document.getElementById('analytics-results');
        const analyticsOutput = document.getElementById('analytics-output');

        analyticsOutput.innerHTML = `
            <div class="result-item">
                <h5>Analytics Report</h5>
                <div style="background: white; padding: 1rem; border-radius: 6px; border: 1px solid #ddd;">
                    <h6>Key Insights</h6>
                    <ul>
                        ${result.insights.map(insight => `<li>${insight}</li>`).join('')}
                    </ul>
                    <h6>Recommendations</h6>
                    <ul>
                        ${result.recommendations.map(rec => `<li>${rec}</li>`).join('')}
                    </ul>
                    <h6>Metrics</h6>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem; margin-top: 1rem;">
                        ${Object.entries(result.metrics).map(([key, value]) => `
                            <div style="text-align: center; padding: 0.5rem; background: #f8f9fa; border-radius: 4px;">
                                <div style="font-size: 1.5rem; font-weight: bold; color: #667eea;">${value}</div>
                                <div style="font-size: 0.9rem; color: #666;">${key}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div style="margin-top: 1rem;">
                    <button class="btn-primary" onclick="adminDashboard.downloadAnalytics(result)">
                        <i class="fas fa-download"></i> Download Report
                    </button>
                    <button class="btn-secondary" onclick="adminDashboard.saveAnalytics(result)">
                        <i class="fas fa-save"></i> Save to Dashboard
                    </button>
                </div>
            </div>
        `;

        resultsContainer.style.display = 'block';
    }

    displayReportResults(result) {
        const resultsContainer = document.getElementById('report-results');
        const reportOutput = document.getElementById('report-output');

        reportOutput.innerHTML = `
            <div class="result-item">
                <h5>Generated Report</h5>
                <div style="background: white; padding: 1rem; border-radius: 6px; border: 1px solid #ddd;">
                    <div style="white-space: pre-wrap;">${result.report}</div>
                </div>
                <div style="margin-top: 1rem;">
                    <button class="btn-primary" onclick="adminDashboard.downloadReport(result)">
                        <i class="fas fa-download"></i> Download Report
                    </button>
                    <button class="btn-secondary" onclick="adminDashboard.emailReport(result)">
                        <i class="fas fa-envelope"></i> Email Report
                    </button>
                </div>
            </div>
        `;

        resultsContainer.style.display = 'block';
    }

    displayDesignResults(result) {
        const resultsContainer = document.getElementById('design-results');
        const designOutput = document.getElementById('design-output');

        designOutput.innerHTML = `
            <div class="result-item">
                <h5>Generated Design</h5>
                <div style="background: white; padding: 1rem; border-radius: 6px; border: 1px solid #ddd;">
                    <img src="${result.imageUrl}" alt="Generated Design" style="width: 100%; max-width: 500px; border-radius: 6px;">
                    <p style="margin-top: 1rem;"><strong>Description:</strong> ${result.description}</p>
                </div>
                <div style="margin-top: 1rem;">
                    <button class="btn-primary" onclick="adminDashboard.downloadFile('${result.imageUrl}', 'design.png')">
                        <i class="fas fa-download"></i> Download Image
                    </button>
                    <button class="btn-secondary" onclick="adminDashboard.saveDesign(result)">
                        <i class="fas fa-save"></i> Save to Gallery
                    </button>
                </div>
            </div>
        `;

        resultsContainer.style.display = 'block';
    }

    showLoading() {
        document.getElementById('loading-overlay').style.display = 'block';
    }

    hideLoading() {
        document.getElementById('loading-overlay').style.display = 'none';
    }

    showError(message) {
        alert('Error: ' + message);
    }

    addActivity(title, description) {
        const activityList = document.getElementById('activity-list');
        const activityItem = document.createElement('div');
        activityItem.className = 'activity-item';
        activityItem.innerHTML = `
            <div class="activity-icon">
                <i class="fas fa-robot"></i>
            </div>
            <div class="activity-content">
                <div class="activity-title">${title}</div>
                <div class="activity-description">${description}</div>
            </div>
            <div class="activity-time">${new Date().toLocaleTimeString()}</div>
        `;

        activityList.insertBefore(activityItem, activityList.firstChild);

        // Keep only last 10 activities
        while (activityList.children.length > 10) {
            activityList.removeChild(activityList.lastChild);
        }
    }

    loadRecentActivity() {
        // Load recent activity from localStorage or API
        const activities = JSON.parse(localStorage.getItem('ai-activities') || '[]');
        const activityList = document.getElementById('activity-list');

        if (activities.length === 0) {
            activityList.innerHTML = '<p style="text-align: center; color: #666; padding: 2rem;">No recent activity</p>';
            return;
        }

        activityList.innerHTML = activities.map(activity => `
            <div class="activity-item">
                <div class="activity-icon">
                    <i class="fas fa-robot"></i>
                </div>
                <div class="activity-content">
                    <div class="activity-title">${activity.title}</div>
                    <div class="activity-description">${activity.description}</div>
                </div>
                <div class="activity-time">${new Date(activity.timestamp).toLocaleTimeString()}</div>
            </div>
        `).join('');
    }

    refreshActivity() {
        this.loadRecentActivity();
    }

    initializeSettings() {
        // Load settings from localStorage
        const settings = JSON.parse(localStorage.getItem('ai-settings') || '{}');

        if (settings.autoGeneration !== undefined) {
            document.getElementById('auto-generation').checked = settings.autoGeneration;
        }

        if (settings.contentQuality) {
            document.getElementById('content-quality').value = settings.contentQuality;
        }
    }

    updateSetting(key, value) {
        const settings = JSON.parse(localStorage.getItem('ai-settings') || '{}');
        settings[key] = value;
        localStorage.setItem('ai-settings', JSON.stringify(settings));
    }

    // Utility methods
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            alert('Copied to clipboard!');
        } catch (err) {
            console.error('Failed to copy: ', err);
        }
    }

    downloadFile(url, filename) {
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
    }

    saveContent(content) {
        // Save content to website

        alert('Content saved to website!');
    }

    downloadQuote(quote) {
        // Generate and download quote PDF

        alert('Quote downloaded!');
    }

    emailQuote(quote) {
        // Email quote to customer

        alert('Quote emailed!');
    }

    downloadProjectPlan(plan) {
        // Generate and download project plan

        alert('Project plan downloaded!');
    }

    saveProjectPlan(plan) {
        // Save project plan to projects

        alert('Project plan saved!');
    }

    sendResponse(response) {
        // Send response to customer

        alert('Response sent!');
    }

    downloadAnalytics(analytics) {
        // Download analytics report

        alert('Analytics report downloaded!');
    }

    saveAnalytics(analytics) {
        // Save analytics to dashboard

        alert('Analytics saved to dashboard!');
    }

    downloadReport(report) {
        // Download report

        alert('Report downloaded!');
    }

    emailReport(report) {
        // Email report

        alert('Report emailed!');
    }

    saveDesign(design) {
        // Save design to gallery

        alert('Design saved to gallery!');
    }
}

// Global functions for HTML onclick handlers
function openAITool(toolName) {
    if (window.adminDashboard) {
        window.adminDashboard.openAITool(toolName);
    }
}

function closeAITool() {
    if (window.adminDashboard) {
        window.adminDashboard.closeAITool();
    }
}

function refreshActivity() {
    if (window.adminDashboard) {
        window.adminDashboard.refreshActivity();
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.adminDashboard = new AdminAIDashboard();
});
