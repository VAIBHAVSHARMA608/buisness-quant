import React, { useState } from 'react';
import { Stock } from '../types';
import { ChevronUpIcon, ChevronDownIcon } from '../icons/heroicons';

interface ResultsTableProps {
  stocks: Stock[];
}

type SortField = keyof Stock;
type SortDirection = 'asc' | 'desc';

const ResultsTable: React.FC<ResultsTableProps> = ({ stocks }) => {
  const [sortField, setSortField] = useState<SortField>('ticker');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedStocks = [...stocks].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    }
    
    return 0;
  });

  const formatNumber = (value: number | null, isPercentage = false, isCurrency = false) => {
    if (value === null || value === undefined) return '-';
    
    if (isPercentage) {
      return `${value.toFixed(2)}%`;
    }
    
    if (isCurrency) {
      if (value >= 1000000000) {
        return `$${(value / 1000000000).toFixed(2)}B`;
      } else if (value >= 1000000) {
        return `$${(value / 1000000).toFixed(2)}M`;
      } else if (value >= 1000) {
        return `$${(value / 1000).toFixed(2)}K`;
      }
      return `$${value.toFixed(2)}`;
    }
    
    if (value >= 1000000000) {
      return `${(value / 1000000000).toFixed(2)}B`;
    } else if (value >= 1000000) {
      return `${(value / 1000000).toFixed(2)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(2)}K`;
    }
    
    return value.toFixed(2);
  };

  const SortIcon: React.FC<{ field: SortField }> = ({ field }) => {
    if (sortField !== field) return null;
    
    return sortDirection === 'asc' ? (
      <ChevronUpIcon className="h-4 w-4" />
    ) : (
      <ChevronDownIcon className="h-4 w-4" />
    );
  };

  if (stocks.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No stocks found</h3>
        <p className="text-gray-600">Try adjusting your filters to see more results.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th 
              className="table-header cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => handleSort('ticker')}
            >
              <div className="flex items-center space-x-1">
                <span>Ticker</span>
                <SortIcon field="ticker" />
              </div>
            </th>
            <th 
              className="table-header cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => handleSort('company')}
            >
              <div className="flex items-center space-x-1">
                <span>Company</span>
                <SortIcon field="company" />
              </div>
            </th>
            <th 
              className="table-header cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => handleSort('sector')}
            >
              <div className="flex items-center space-x-1">
                <span>Sector</span>
                <SortIcon field="sector" />
              </div>
            </th>
            <th 
              className="table-header cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => handleSort('industry')}
            >
              <div className="flex items-center space-x-1">
                <span>Industry</span>
                <SortIcon field="industry" />
              </div>
            </th>
            <th 
              className="table-header cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => handleSort('marketCap')}
            >
              <div className="flex items-center space-x-1">
                <span>Market Cap</span>
                <SortIcon field="marketCap" />
              </div>
            </th>
            <th 
              className="table-header cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => handleSort('epsY')}
            >
              <div className="flex items-center space-x-1">
                <span>EPS (Y)</span>
                <SortIcon field="epsY" />
              </div>
            </th>
            <th 
              className="table-header cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => handleSort('evAssets')}
            >
              <div className="flex items-center space-x-1">
                <span>EV/Assets</span>
                <SortIcon field="evAssets" />
              </div>
            </th>
            <th 
              className="table-header cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => handleSort('revenueQtr')}
            >
              <div className="flex items-center space-x-1">
                <span>Revenue (Qtr)</span>
                <SortIcon field="revenueQtr" />
              </div>
            </th>
            <th 
              className="table-header cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => handleSort('capEmployedTTM')}
            >
              <div className="flex items-center space-x-1">
                <span>Cap Employed (TTM)</span>
                <SortIcon field="capEmployedTTM" />
              </div>
            </th>
            <th 
              className="table-header cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => handleSort('capexRevTTM')}
            >
              <div className="flex items-center space-x-1">
                <span>Capex % Rev (TTM)</span>
                <SortIcon field="capexRevTTM" />
              </div>
            </th>
            <th 
              className="table-header cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => handleSort('capexTTM')}
            >
              <div className="flex items-center space-x-1">
                <span>Capex (TTM)</span>
                <SortIcon field="capexTTM" />
              </div>
            </th>
            <th 
              className="table-header cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => handleSort('cashEquityY')}
            >
              <div className="flex items-center space-x-1">
                <span>Cash & Equity (Y)</span>
                <SortIcon field="cashEquityY" />
              </div>
            </th>
            <th 
              className="table-header cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => handleSort('twoYearPercent')}
            >
              <div className="flex items-center space-x-1">
                <span>2Y %</span>
                <SortIcon field="twoYearPercent" />
              </div>
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sortedStocks.map((stock, index) => (
            <tr key={stock.ticker} className={`hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
              <td className="table-cell font-medium text-primary-600">{stock.ticker}</td>
              <td className="table-cell">{stock.company}</td>
              <td className="table-cell">{stock.sector}</td>
              <td className="table-cell">{stock.industry}</td>
              <td className="table-cell">{formatNumber(stock.marketCap, false, true)}</td>
              <td className="table-cell">{formatNumber(stock.epsY)}</td>
              <td className="table-cell">{formatNumber(stock.evAssets)}</td>
              <td className="table-cell">{formatNumber(stock.revenueQtr, false, true)}</td>
              <td className="table-cell">{formatNumber(stock.capEmployedTTM, false, true)}</td>
              <td className="table-cell">{formatNumber(stock.capexRevTTM)}</td>
              <td className="table-cell">{formatNumber(stock.capexTTM, false, true)}</td>
              <td className="table-cell">{formatNumber(stock.cashEquityY, false, true)}</td>
              <td className={`table-cell ${stock.twoYearPercent && stock.twoYearPercent > 0 ? 'text-success-600' : 'text-danger-600'}`}>
                {formatNumber(stock.twoYearPercent, true)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ResultsTable;