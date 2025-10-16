// Quotes Management Methods for Admin Dashboard
// Add these methods to the AdminDashboard class

async loadQuotes() {
    try {
        const params = new URLSearchParams({
            status: this.quotesFilters.status,
            limit: this.quotesLimit,
            offset: (this.quotesPage - 1) * this.quotesLimit
        });

        if (this.quotesFilters.search) {
            params.append('search', this.quotesFilters.search);
        }

        const response = await fetch(`${this.apiBaseUrl}/quotes?${params}`, {
            headers: {
                'Authorization': `Bearer ${sessionStorage.getItem('admin_token')}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to load quotes');
        }

        const data = await response.json();
        this.quotesData = data.quotes;
        this.renderQuotesTable();
        this.updateQuotesPagination(data.total, data.limit, data.offset);
        this.loadQuotesStats();
    } catch (error) {
        console.error('Error loading quotes:', error);
        this.showNotification('Fout bij het laden van offertes', 'error');
    }
}

renderQuotesTable() {
    const tbody = document.getElementById('quotes-tbody');
    if (!tbody) return;

    if (this.quotesData.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center">
                    <i class="fas fa-inbox"></i>
                    <p>Geen offertes gevonden</p>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = this.quotesData.map(quote => `
        <tr>
            <td><code>${quote.id}</code></td>
            <td>${quote.klantNaam}</td>
            <td>${quote.email}</td>
            <td><span class="badge badge-info">${quote.projectType}</span></td>
            <td><span class="badge badge-${this.getStatusClass(quote.status)}">${this.getStatusText(quote.status)}</span></td>
            <td>€${quote.estimatedValue?.toLocaleString() || '0'}</td>
            <td>${new Date(quote.timestamp).toLocaleDateString('nl-NL')}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-sm btn-primary" onclick="dashboard.viewQuote('${quote.id}')">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-secondary" onclick="dashboard.editQuote('${quote.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="dashboard.deleteQuote('${quote.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

updateQuotesPagination(total, limit, offset) {
    const totalPages = Math.ceil(total / limit);
    const currentPage = Math.floor(offset / limit) + 1;

    document.getElementById('prev-page').disabled = currentPage <= 1;
    document.getElementById('next-page').disabled = currentPage >= totalPages;
    document.getElementById('page-info').textContent = `Pagina ${currentPage} van ${totalPages}`;
}

async loadQuotesStats() {
    try {
        const response = await fetch(`${this.apiBaseUrl}/quotes/stats`, {
            headers: {
                'Authorization': `Bearer ${sessionStorage.getItem('admin_token')}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to load quote stats');
        }

        const stats = await response.json();
        
        document.getElementById('total-quotes').textContent = stats.total_quotes || 0;
        document.getElementById('pending-quotes').textContent = stats.pending_quotes || 0;
        document.getElementById('total-value').textContent = `€${(stats.total_value || 0).toLocaleString()}`;
        document.getElementById('avg-value').textContent = `€${(stats.average_value || 0).toLocaleString()}`;
    } catch (error) {
        console.error('Error loading quote stats:', error);
    }
}

getStatusClass(status) {
    const classes = {
        'pending': 'warning',
        'in-progress': 'info',
        'completed': 'success',
        'cancelled': 'danger'
    };
    return classes[status] || 'secondary';
}

getStatusText(status) {
    const texts = {
        'pending': 'In behandeling',
        'in-progress': 'In uitvoering',
        'completed': 'Voltooid',
        'cancelled': 'Geannuleerd'
    };
    return texts[status] || status;
}

async viewQuote(quoteId) {
    try {
        const response = await fetch(`${this.apiBaseUrl}/quotes/${quoteId}`, {
            headers: {
                'Authorization': `Bearer ${sessionStorage.getItem('admin_token')}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to load quote');
        }

        const quote = await response.json();
        this.showQuoteModal(quote);
    } catch (error) {
        console.error('Error loading quote:', error);
        this.showNotification('Fout bij het laden van offerte', 'error');
    }
}

showQuoteModal(quote) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Offerte Details - ${quote.id}</h3>
                <button class="close-btn" onclick="this.closest('.modal').remove()">&times;</button>
            </div>
            <div class="modal-body">
                <div class="quote-details">
                    <div class="detail-group">
                        <h4>Klantgegevens</h4>
                        <p><strong>Naam:</strong> ${quote.klantNaam}</p>
                        <p><strong>Email:</strong> ${quote.email}</p>
                        <p><strong>Telefoon:</strong> ${quote.telefoon || 'Niet opgegeven'}</p>
                    </div>
                    <div class="detail-group">
                        <h4>Project Details</h4>
                        <p><strong>Type:</strong> ${quote.projectType}</p>
                        <p><strong>Status:</strong> <span class="badge badge-${this.getStatusClass(quote.status)}">${this.getStatusText(quote.status)}</span></p>
                        <p><strong>Geschatte Waarde:</strong> €${quote.estimatedValue?.toLocaleString() || '0'}</p>
                    </div>
                    ${quote.ramen && quote.ramen.length > 0 ? `
                        <div class="detail-group">
                            <h4>Ramen</h4>
                            <ul>
                                ${quote.ramen.map(raam => `<li>${raam.aantal}x ${raam.type} ${raam.maten ? `(${raam.maten})` : ''}</li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}
                    ${quote.deuren && quote.deuren.length > 0 ? `
                        <div class="detail-group">
                            <h4>Deuren</h4>
                            <ul>
                                ${quote.deuren.map(deur => `<li>${deur.aantal}x ${deur.type} ${deur.maten ? `(${deur.maten})` : ''}</li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}
                    ${quote.opmerkingen ? `
                        <div class="detail-group">
                            <h4>Opmerkingen</h4>
                            <p>${quote.opmerkingen}</p>
                        </div>
                    ` : ''}
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">Sluiten</button>
                <button class="btn btn-primary" onclick="dashboard.editQuote('${quote.id}')">Bewerken</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

async editQuote(quoteId) {
    // Implementation for editing quotes
    this.showNotification('Quote bewerken functionaliteit komt binnenkort', 'info');
}

async deleteQuote(quoteId) {
    if (!confirm('Weet u zeker dat u deze offerte wilt verwijderen?')) {
        return;
    }

    try {
        const response = await fetch(`${this.apiBaseUrl}/quotes/${quoteId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${sessionStorage.getItem('admin_token')}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to delete quote');
        }

        this.showNotification('Offerte succesvol verwijderd', 'success');
        this.loadQuotes();
    } catch (error) {
        console.error('Error deleting quote:', error);
        this.showNotification('Fout bij het verwijderen van offerte', 'error');
    }
}

async exportQuotes() {
    try {
        const params = new URLSearchParams({
            status: this.quotesFilters.status
        });

        if (this.quotesFilters.dateFrom) {
            params.append('start_date', this.quotesFilters.dateFrom);
        }
        if (this.quotesFilters.dateTo) {
            params.append('end_date', this.quotesFilters.dateTo);
        }

        const response = await fetch(`${this.apiBaseUrl}/quotes/export/csv?${params}`, {
            headers: {
                'Authorization': `Bearer ${sessionStorage.getItem('admin_token')}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to export quotes');
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `yannova-quotes-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        this.showNotification('Offertes succesvol geëxporteerd', 'success');
    } catch (error) {
        console.error('Error exporting quotes:', error);
        this.showNotification('Fout bij het exporteren van offertes', 'error');
    }
}
