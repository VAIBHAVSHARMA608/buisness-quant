import React from 'react';
import { Stock } from '../types';
import { ArrowDownTrayIcon } from '../icons/heroicons';

interface ExportButtonProps {
  data: Stock[];
}

const ExportButton: React.FC<ExportButtonProps> = ({ data }) => {
  const exportToCSV = () => {
    const headers = [
      'Ticker',
      'Company',
      'Sector',
      'Industry',
      'Market Cap',
      'EPS (Y)',
      'EV/Assets',
      'Revenue (Qtr)',
      'Cap Employed (TTM)',
      'Capex % Rev (TTM)',
      'Capex (TTM)',
      'Cash & Equity (Y)',
      '2Y %'
    ];

    const csvContent = [
      headers.join(','),
      ...data.map(stock => [
        stock.ticker,
        `"${stock.company}"`,
        stock.sector,
        stock.industry,
        stock.marketCap || '',
        stock.epsY || '',
        stock.evAssets || '',
        stock.revenueQtr || '',
        stock.capEmployedTTM || '',
        stock.capexRevTTM || '',
        stock.capexTTM || '',
        stock.cashEquityY || '',
        stock.twoYearPercent || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `stock_screener_results_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <button
      onClick={exportToCSV}
      className="btn btn-success flex items-center space-x-2"
      disabled={data.length === 0}
    >
      <ArrowDownTrayIcon className="h-4 w-4" />
      <span>Export</span>
    </button>
  );
};

export default ExportButton;