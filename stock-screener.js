(function($) {
    'use strict';
    
    class StockScreener {
        constructor(container) {
            this.container = container;
            this.filters = [];
            this.selectedIndustry = '';
            this.stocks = [];
            this.filteredStocks = [];
            this.sortField = 'ticker';
            this.sortDirection = 'asc';
            
            this.init();
        }
        
        init() {
            this.render();
            this.bindEvents();
            this.loadInitialData();
        }
        
        render() {
            this.container.html(`
                <div class="stock-screener-header">
                    <h1>Stock Screener</h1>
                    <p>Filter and analyze stocks based on financial metrics</p>
                </div>
                <div class="stock-screener-content">
                    <div class="stock-screener-filters">
                        <div class="filter-card">
                            <h3>Industry Filter</h3>
                            <select class="filter-input" id="industry-select">
                                <option value="">Select industry</option>
                            </select>
                        </div>
                        
                        <div class="filter-card">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                                <h3 style="margin: 0;">Custom Filters</h3>
                                <button class="btn btn-primary" id="add-filter">
                                    <span>+</span> Add Filter
                                </button>
                            </div>
                            <div id="custom-filters">
                                <div class="no-filters" style="text-align: center; padding: 40px 20px; color: #64748b;">
                                    <p style="margin: 0; font-size: 14px;">No filters added yet.</p>
                                    <p style="margin: 4px 0 0 0; font-size: 12px;">Click "Add Filter" to get started.</p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="filter-card">
                            <button class="btn btn-secondary" style="width: 100%;">Edit Columns</button>
                        </div>
                        
                        <div class="filter-card">
                            <button class="btn btn-success" id="export-btn" style="width: 100%;">
                                📊 Export
                            </button>
                        </div>
                    </div>
                    
                    <div class="stock-screener-results">
                        <div class="results-header">
                            <div>
                                <h2 class="results-title">Screening Results</h2>
                                <p class="results-count">Showing <span id="results-count">0</span> stocks</p>
                            </div>
                        </div>
                        
                        <div id="results-container">
                            <div class="stock-screener-loading">
                                <div class="spinner"></div>
                                <p>Loading stocks...</p>
                            </div>
                        </div>
                    </div>
                </div>
            `);
        }
        
        bindEvents() {
            const self = this;
            
            // Add filter button
            this.container.on('click', '#add-filter', function() {
                self.addFilter();
            });
            
            // Remove filter button
            this.container.on('click', '.remove-filter', function() {
                const filterId = $(this).data('filter-id');
                self.removeFilter(filterId);
            });
            
            // Industry change
            this.container.on('change', '#industry-select', function() {
                self.selectedIndustry = $(this).val();
                self.applyFilters();
            });
            
            // Filter changes
            this.container.on('change', '.filter-metric, .filter-operator, .filter-value, .filter-unit', function() {
                self.updateFilterFromDOM();
                self.applyFilters();
            });
            
            // Table sorting
            this.container.on('click', '.sortable', function() {
                const field = $(this).data('field');
                self.sortTable(field);
            });
            
            // Export button
            this.container.on('click', '#export-btn', function() {
                self.exportToCSV();
            });
        }
        
        loadInitialData() {
            const self = this;
            
            // Load industries
            this.ajaxRequest('get_industries', {}, function(response) {
                if (response.success) {
                    const select = self.container.find('#industry-select');
                    response.data.forEach(function(industry) {
                        select.append(`<option value="${industry}">${industry}</option>`);
                    });
                }
            });
            
            // Load initial stocks
            this.loadStocks();
        }
        
        loadStocks() {
            const self = this;
            
            const data = {
                industry: this.selectedIndustry,
                filters: {
                    custom_filters: this.filters
                }
            };
            
            this.ajaxRequest('get_stocks', data, function(response) {
                if (response.success) {
                    self.stocks = response.data;
                    self.filteredStocks = response.data;
                    self.renderTable();
                    self.updateResultsCount();
                }
            });
        }
        
        addFilter() {
            const filterId = 'filter_' + Date.now();
            const filter = {
                id: filterId,
                metric: 'Revenue (Quarter)',
                operator: 'greater_than',
                value: '',
                unit: 'One'
            };
            
            this.filters.push(filter);
            this.renderFilters();
        }
        
        removeFilter(filterId) {
            this.filters = this.filters.filter(f => f.id !== filterId);
            this.renderFilters();
            this.applyFilters();
        }
        
        renderFilters() {
            const container = this.container.find('#custom-filters');
            
            if (this.filters.length === 0) {
                container.html(`
                    <div class="no-filters" style="text-align: center; padding: 40px 20px; color: #64748b;">
                        <p style="margin: 0; font-size: 14px;">No filters added yet.</p>
                        <p style="margin: 4px 0 0 0; font-size: 12px;">Click "Add Filter" to get started.</p>
                    </div>
                `);
                return;
            }
            
            let html = '';
            this.filters.forEach((filter, index) => {
                html += this.renderFilterRow(filter, index + 1);
            });
            
            container.html(html);
        }
        
        renderFilterRow(filter, index) {
            const metrics = [
                'Revenue (Quarter)', 'EV to Assets', 'EPS (Basic) (Annual)', 'Market Cap',
                'EPS (Y)', 'EV/Assets', 'Revenue (Qtr)', 'Cap Employed (TTM)',
                'Capex % Rev (TTM)', 'Capex (TTM)', 'Cash & Equity (Y)', '2Y %'
            ];
            
            const operators = [
                { value: 'greater_than', label: 'Greater than' },
                { value: 'less_than', label: 'Less than' },
                { value: 'less_than_or_equal', label: 'Less than or equal to' },
                { value: 'greater_than_or_equal', label: 'Greater than or equal to' },
                { value: 'equal', label: 'Equal to' }
            ];
            
            const units = ['One', 'Thousand', 'Million', 'Billion'];
            
            return `
                <div class="filter-row" data-filter-id="${filter.id}">
                    <div class="filter-row-header">
                        <span class="filter-row-title">Filter ${index}</span>
                        <button class="remove-filter" data-filter-id="${filter.id}">×</button>
                    </div>
                    
                    <div class="filter-grid">
                        <div class="filter-field">
                            <label class="filter-label">Metric</label>
                            <select class="filter-input filter-metric">
                                ${metrics.map(m => `<option value="${m}" ${m === filter.metric ? 'selected' : ''}>${m}</option>`).join('')}
                            </select>
                        </div>
                        
                        <div class="filter-field">
                            <label class="filter-label">Condition</label>
                            <select class="filter-input filter-operator">
                                ${operators.map(o => `<option value="${o.value}" ${o.value === filter.operator ? 'selected' : ''}>${o.label}</option>`).join('')}
                            </select>
                        </div>
                        
                        <div class="filter-field">
                            <label class="filter-label">Value</label>
                            <input type="number" class="filter-input filter-value" value="${filter.value}" placeholder="Enter value">
                        </div>
                        
                        <div class="filter-field">
                            <label class="filter-label">Unit</label>
                            <select class="filter-input filter-unit">
                                ${units.map(u => `<option value="${u}" ${u === filter.unit ? 'selected' : ''}>${u}</option>`).join('')}
                            </select>
                        </div>
                    </div>
                </div>
            `;
        }
        
        updateFilterFromDOM() {
            const self = this;
            this.container.find('.filter-row').each(function() {
                const filterId = $(this).data('filter-id');
                const filter = self.filters.find(f => f.id === filterId);
                
                if (filter) {
                    filter.metric = $(this).find('.filter-metric').val();
                    filter.operator = $(this).find('.filter-operator').val();
                    filter.value = $(this).find('.filter-value').val();
                    filter.unit = $(this).find('.filter-unit').val();
                }
            });
        }
        
        applyFilters() {
            this.loadStocks();
        }
        
        renderTable() {
            const container = this.container.find('#results-container');
            
            if (this.filteredStocks.length === 0) {
                container.html(`
                    <div class="no-results">
                        <div class="no-results-icon">📊</div>
                        <h3 style="margin: 0 0 8px 0; font-size: 18px; color: #1e293b;">No stocks found</h3>
                        <p style="margin: 0; color: #64748b;">Try adjusting your filters to see more results.</p>
                    </div>
                `);
                return;
            }
            
            let html = `
                <table class="results-table">
                    <thead>
                        <tr>
                            <th class="sortable" data-field="ticker">Ticker</th>
                            <th class="sortable" data-field="company">Company</th>
                            <th class="sortable" data-field="sector">Sector</th>
                            <th class="sortable" data-field="industry">Industry</th>
                            <th class="sortable" data-field="market_cap">Market Cap</th>
                            <th class="sortable" data-field="eps_y">EPS (Y)</th>
                            <th class="sortable" data-field="ev_assets">EV/Assets</th>
                            <th class="sortable" data-field="revenue_qtr">Revenue (Qtr)</th>
                            <th class="sortable" data-field="cap_employed_ttm">Cap Employed (TTM)</th>
                            <th class="sortable" data-field="capex_rev_ttm">Capex % Rev (TTM)</th>
                            <th class="sortable" data-field="capex_ttm">Capex (TTM)</th>
                            <th class="sortable" data-field="cash_equity_y">Cash & Equity (Y)</th>
                            <th class="sortable" data-field="two_year_percent">2Y %</th>
                        </tr>
                    </thead>
                    <tbody>
            `;
            
            this.filteredStocks.forEach(stock => {
                html += `
                    <tr>
                        <td class="ticker-cell">${stock.ticker}</td>
                        <td>${stock.company}</td>
                        <td>${stock.sector}</td>
                        <td>${stock.industry}</td>
                        <td>${this.formatNumber(stock.market_cap, false, true)}</td>
                        <td>${this.formatNumber(stock.eps_y)}</td>
                        <td>${this.formatNumber(stock.ev_assets)}</td>
                        <td>${this.formatNumber(stock.revenue_qtr, false, true)}</td>
                        <td>${this.formatNumber(stock.cap_employed_ttm, false, true)}</td>
                        <td>${this.formatNumber(stock.capex_rev_ttm)}</td>
                        <td>${this.formatNumber(stock.capex_ttm, false, true)}</td>
                        <td>${this.formatNumber(stock.cash_equity_y, false, true)}</td>
                        <td class="${stock.two_year_percent > 0 ? 'positive' : 'negative'}">${this.formatNumber(stock.two_year_percent, true)}</td>
                    </tr>
                `;
            });
            
            html += '</tbody></table>';
            container.html(html);
        }
        
        formatNumber(value, isPercentage = false, isCurrency = false) {
            if (value === null || value === undefined || value === '') return '-';
            
            const num = parseFloat(value);
            if (isNaN(num)) return '-';
            
            if (isPercentage) {
                return num.toFixed(2) + '%';
            }
            
            if (isCurrency) {
                if (num >= 1000000000) {
                    return '$' + (num / 1000000000).toFixed(2) + 'B';
                } else if (num >= 1000000) {
                    return '$' + (num / 1000000).toFixed(2) + 'M';
                } else if (num >= 1000) {
                    return '$' + (num / 1000).toFixed(2) + 'K';
                }
                return '$' + num.toFixed(2);
            }
            
            if (num >= 1000000000) {
                return (num / 1000000000).toFixed(2) + 'B';
            } else if (num >= 1000000) {
                return (num / 1000000).toFixed(2) + 'M';
            } else if (num >= 1000) {
                return (num / 1000).toFixed(2) + 'K';
            }
            
            return num.toFixed(2);
        }
        
        updateResultsCount() {
            this.container.find('#results-count').text(this.filteredStocks.length);
        }
        
        sortTable(field) {
            if (this.sortField === field) {
                this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
            } else {
                this.sortField = field;
                this.sortDirection = 'asc';
            }
            
            this.filteredStocks.sort((a, b) => {
                let aVal = a[field];
                let bVal = b[field];
                
                if (typeof aVal === 'string' && typeof bVal === 'string') {
                    return this.sortDirection === 'asc' 
                        ? aVal.localeCompare(bVal)
                        : bVal.localeCompare(aVal);
                }
                
                if (typeof aVal === 'number' && typeof bVal === 'number') {
                    return this.sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
                }
                
                return 0;
            });
            
            this.renderTable();
        }
        
        exportToCSV() {
            const headers = [
                'Ticker', 'Company', 'Sector', 'Industry', 'Market Cap',
                'EPS (Y)', 'EV/Assets', 'Revenue (Qtr)', 'Cap Employed (TTM)',
                'Capex % Rev (TTM)', 'Capex (TTM)', 'Cash & Equity (Y)', '2Y %'
            ];
            
            let csvContent = headers.join(',') + '\n';
            
            this.filteredStocks.forEach(stock => {
                const row = [
                    stock.ticker,
                    `"${stock.company}"`,
                    stock.sector,
                    stock.industry,
                    stock.market_cap || '',
                    stock.eps_y || '',
                    stock.ev_assets || '',
                    stock.revenue_qtr || '',
                    stock.cap_employed_ttm || '',
                    stock.capex_rev_ttm || '',
                    stock.capex_ttm || '',
                    stock.cash_equity_y || '',
                    stock.two_year_percent || ''
                ];
                csvContent += row.join(',') + '\n';
            });
            
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `stock_screener_results_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
        
        ajaxRequest(action, data, callback) {
            $.ajax({
                url: stock_screener_ajax.ajax_url,
                type: 'POST',
                data: {
                    action: 'stock_screener_data',
                    screener_action: action,
                    nonce: stock_screener_ajax.nonce,
                    ...data
                },
                success: callback,
                error: function(xhr, status, error) {
                    console.error('AJAX Error:', error);
                }
            });
        }
    }
    
    // Initialize when DOM is ready
    $(document).ready(function() {
        $('#stock-screener-app').each(function() {
            new StockScreener($(this));
        });
    });
    
})(jQuery);