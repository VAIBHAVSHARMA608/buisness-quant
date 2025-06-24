import React from 'react';
import { Filter } from '../types';
import { PlusIcon, XMarkIcon } from '../icons/heroicons';

interface FilterPanelProps {
  filters: Filter[];
  onAddFilter: () => void;
  onUpdateFilter: (id: string, updates: Partial<Filter>) => void;
  onRemoveFilter: (id: string) => void;
  selectedIndustry: string;
  onIndustryChange: (industry: string) => void;
}

const metrics = [
  'Revenue (Quarter)',
  'EV to Assets',
  'EPS (Basic) (Annual)',
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

const operators = [
  { value: 'greater_than', label: 'Greater than' },
  { value: 'less_than', label: 'Less than' },
  { value: 'less_than_or_equal', label: 'Less than or equal to' },
  { value: 'greater_than_or_equal', label: 'Greater than or equal to' },
  { value: 'equal', label: 'Equal to' }
];

const units = ['One', 'Thousand', 'Million', 'Billion'];

const industries = [
  'Shell Companies',
  'Biotechnology',
  'Information Technology Services'
];

const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  onAddFilter,
  onUpdateFilter,
  onRemoveFilter,
  selectedIndustry,
  onIndustryChange
}) => {
  return (
    <div className="space-y-6">
      {/* Industry Filter */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Industry Filter</h3>
        <select
          className="select"
          value={selectedIndustry}
          onChange={(e) => onIndustryChange(e.target.value)}
        >
          <option value="">Select industry</option>
          {industries.map(industry => (
            <option key={industry} value={industry}>{industry}</option>
          ))}
        </select>
      </div>

      {/* Custom Filters */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Custom Filters</h3>
          <button
            onClick={onAddFilter}
            className="btn btn-primary flex items-center space-x-2"
          >
            <PlusIcon className="h-4 w-4" />
            <span>Add Filter</span>
          </button>
        </div>

        <div className="space-y-4">
          {filters.map((filter) => (
            <div key={filter.id} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
              <div className="flex justify-between items-start mb-3">
                <span className="text-sm font-medium text-gray-700">Filter {filters.indexOf(filter) + 1}</span>
                <button
                  onClick={() => onRemoveFilter(filter.id)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-3">
                {/* Metric */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Metric
                  </label>
                  <select
                    className="select text-sm"
                    value={filter.metric}
                    onChange={(e) => onUpdateFilter(filter.id, { metric: e.target.value })}
                  >
                    {metrics.map(metric => (
                      <option key={metric} value={metric}>{metric}</option>
                    ))}
                  </select>
                </div>

                {/* Operator */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Condition
                  </label>
                  <select
                    className="select text-sm"
                    value={filter.operator}
                    onChange={(e) => onUpdateFilter(filter.id, { operator: e.target.value as any })}
                  >
                    {operators.map(op => (
                      <option key={op.value} value={op.value}>{op.label}</option>
                    ))}
                  </select>
                </div>

                {/* Value */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Value
                  </label>
                  <input
                    type="number"
                    className="input text-sm"
                    value={filter.value}
                    onChange={(e) => onUpdateFilter(filter.id, { value: e.target.value })}
                    placeholder="Enter value"
                  />
                </div>

                {/* Unit */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Unit
                  </label>
                  <select
                    className="select text-sm"
                    value={filter.unit}
                    onChange={(e) => onUpdateFilter(filter.id, { unit: e.target.value })}
                  >
                    {units.map(unit => (
                      <option key={unit} value={unit}>{unit}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          ))}

          {filters.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p className="text-sm">No filters added yet.</p>
              <p className="text-xs mt-1">Click "Add Filter" to get started.</p>
            </div>
          )}
        </div>
      </div>

      {/* Edit Columns */}
      <div className="card">
        <button className="btn btn-secondary w-full">
          Edit Columns
        </button>
      </div>

      {/* Export */}
      <div className="card">
        <button className="btn btn-success w-full">
          📊 Export
        </button>
      </div>
    </div>
  );
};

export default FilterPanel;