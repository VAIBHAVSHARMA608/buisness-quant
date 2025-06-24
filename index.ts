export interface Stock {
  ticker: string;
  company: string;
  sector: string;
  industry: string;
  marketCap: number | null;
  epsY: number | null;
  evAssets: number | null;
  revenueQtr: number | null;
  capEmployedTTM: number | null;
  capexRevTTM: number | null;
  capexTTM: number | null;
  cashEquityY: number | null;
  twoYearPercent: number | null;
  revenueQuarter?: number | null;
  evToAssets?: number | null;
  epsBasicAnnual?: number | null;
}

export interface Filter {
  id: string;
  metric: string;
  operator: 'greater_than' | 'less_than' | 'less_than_or_equal' | 'greater_than_or_equal' | 'equal';
  value: string;
  unit: string;
}

export interface ScreenerMetric {
  name: string;
  datatype: 'int' | 'string' | 'date' | '%';
  statement: string;
}