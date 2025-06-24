import React, { useState, useEffect } from 'react';
import FilterPanel from './FilterPanel';
import ResultsTable from './ResultsTable';
import ExportButton from './ExportButton';
import { Filter, Stock } from '../types';
import { mockStocks } from '../data/mockData';

const StockScreener: React.FC = () => {
  const [filters, setFilters] = useState<Filter[]>([]);
  const [filteredStocks, setFilteredStocks] = useState<Stock[]>(mockStocks);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndustry, setSelectedIndustry] = useState<string>('');

  const applyFilters = () => {
    setIsLoading(true);
    
    setTimeout(() => {
      let filtered = [...mockStocks];
      
      // Apply industry filter
      if (selectedIndustry) {
        filtered = filtered.filter(stock => stock.industry === selectedIndustry);
      }
      
      // Apply custom filters
      filters.forEach(filter => {
        filtered = filtered.filter(stock => {
          const value = getStockValue(stock, filter.metric);
          if (value === null || value === undefined) return false;
          
          switch (filter.operator) {
            case 'greater_than':
              return Number(value) > Number(filter.value);
            case 'less_than':
              return Number(value) < Number(filter.value);
            case 'less_than_or_equal':
              return Number(value) <= Number(filter.value);
            case 'greater_than_or_equal':
              return Number(value) >= Number(filter.value);
            case 'equal':
              return Number(value) === Number(filter.value);
            default:
              return true;
          }
        });
      });
      
      setFilteredStocks(filtered);
      setIsLoading(false);
    }, 500);
  };

  const getStockValue = (stock: Stock, metric: string): number | null => {
    switch (metric) {
      case 'Revenue (Quarter)':
        return stock.revenueQuarter;
      case 'EV to Assets':
        return stock.evToAssets;
      case 'EPS (Basic) (Annual)':
        return stock.epsBasicAnnual;
      case 'Market Cap':
        return stock.marketCap;
      case 'EPS (Y)':
        return stock.epsY;
      case 'EV/Assets':
        return stock.evAssets;
      case 'Revenue (Qtr)':
        return stock.revenueQtr;
      case 'Cap Employed (TTM)':
        return stock.capEmployedTTM;
      case 'Capex % Rev (TTM)':
        return stock.capexRevTTM;
      case 'Capex (TTM)':
        return stock.capexTTM;
      case 'Cash & Equity (Y)':
        return stock.cashEquityY;
      case '2Y %':
        return stock.twoYearPercent;
      default:
        return null;
    }
  };

  useEffect(() => {
    applyFilters();
  }, [filters, selectedIndustry]);

  const addFilter = () => {
    const newFilter: Filter = {
      id: Date.now().toString(),
      metric: 'Revenue (Quarter)',
      operator: 'greater_than',
      value: '',
      unit: 'One'
    };
    setFilters([...filters, newFilter]);
  };

  const updateFilter = (id: string, updates: Partial<Filter>) => {
    setFilters(filters.map(filter => 
      filter.id === id ? { ...filter, ...updates } : filter
    ));
  };

  const removeFilter = (id: string) => {
    setFilters(filters.filter(filter => filter.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-3xl font-bold text-gray-900">Stock Screener</h1>
            <p className="mt-2 text-gray-600">Filter and analyze stocks based on financial metrics</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filter Panel */}
          <div className="lg:col-span-1">
            <FilterPanel
              filters={filters}
              onAddFilter={addFilter}
              onUpdateFilter={updateFilter}
              onRemoveFilter={removeFilter}
              selectedIndustry={selectedIndustry}
              onIndustryChange={setSelectedIndustry}
            />
          </div>

          {/* Results */}
          <div className="lg:col-span-3">
            <div className="card">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Screening Results
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Showing {filteredStocks.length} of {mockStocks.length} stocks
                  </p>
                </div>
                <ExportButton data={filteredStocks} />
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                  <span className="ml-3 text-gray-600">Filtering stocks...</span>
                </div>
              ) : (
                <ResultsTable stocks={filteredStocks} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockScreener;