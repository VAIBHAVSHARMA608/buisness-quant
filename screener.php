<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Mock database connection (replace with actual database)
class StockScreener {
    private $stocks = [
        [
            'ticker' => 'BSLK',
            'company' => 'Bolt Projects Holdings, Inc.',
            'sector' => 'Financial Services',
            'industry' => 'Shell Companies',
            'market_cap' => 3250000,
            'eps_y' => 13.59,
            'ev_assets' => 3.91,
            'revenue_qtr' => 5000000,
            'cap_employed_ttm' => 10070000,
            'capex_rev_ttm' => 19.91,
            'capex_ttm' => 701000,
            'cash_equity_y' => 934000,
            'two_year_percent' => -96.83
        ],
        [
            'ticker' => 'GLPG',
            'company' => 'Galapagos NV',
            'sector' => 'Healthcare',
            'industry' => 'Biotechnology',
            'market_cap' => 1570000000,
            'eps_y' => 3.57,
            'ev_assets' => 0.35,
            'revenue_qtr' => null,
            'cap_employed_ttm' => 4250000,
            'capex_rev_ttm' => null,
            'capex_ttm' => null,
            'cash_equity_y' => 185340000,
            'two_year_percent' => -48.64
        ],
        [
            'ticker' => 'GMM',
            'company' => 'Global Mofy AI Ltd',
            'sector' => 'Technology',
            'industry' => 'Information Technology Services',
            'market_cap' => 7030000,
            'eps_y' => 6.37,
            'ev_assets' => 0.04,
            'revenue_qtr' => null,
            'cap_employed_ttm' => 45810000,
            'capex_rev_ttm' => 0.01,
            'capex_ttm' => 3530000,
            'cash_equity_y' => 11070000,
            'two_year_percent' => null
        ],
        [
            'ticker' => 'MEIP',
            'company' => 'MEI Pharma, Inc.',
            'sector' => 'Healthcare',
            'industry' => 'Biotechnology',
            'market_cap' => 18800000,
            'eps_y' => 2.67,
            'ev_assets' => 0.36,
            'revenue_qtr' => null,
            'cap_employed_ttm' => 24880000,
            'capex_rev_ttm' => null,
            'capex_ttm' => -3000000,
            'cash_equity_y' => 3710000,
            'two_year_percent' => -45.03
        ],
        [
            'ticker' => 'NGNE',
            'company' => 'Neurogene Inc.',
            'sector' => 'Healthcare',
            'industry' => 'Biotechnology',
            'market_cap' => 264690000,
            'eps_y' => 27.76,
            'ev_assets' => 0.75,
            'revenue_qtr' => null,
            'cap_employed_ttm' => 148320000,
            'capex_rev_ttm' => null,
            'capex_ttm' => 2580000,
            'cash_equity_y' => 148720000,
            'two_year_percent' => 34.54
        ],
        [
            'ticker' => 'SER',
            'company' => 'Serina Therapeutics, Inc.',
            'sector' => 'Healthcare',
            'industry' => 'Biotechnology',
            'market_cap' => 6330000,
            'eps_y' => 2.30,
            'ev_assets' => 1.33,
            'revenue_qtr' => 14000000,
            'cap_employed_ttm' => -6080000,
            'capex_rev_ttm' => 16.61,
            'capex_ttm' => 521010000,
            'cash_equity_y' => 7620000,
            'two_year_percent' => -82.46
        ],
        [
            'ticker' => 'TECX',
            'company' => 'Tectonic Therapeutic, Inc.',
            'sector' => 'Healthcare',
            'industry' => 'Biotechnology',
            'market_cap' => 199220000,
            'eps_y' => 3.24,
            'ev_assets' => 0.43,
            'revenue_qtr' => null,
            'cap_employed_ttm' => 151400000,
            'capex_rev_ttm' => null,
            'capex_ttm' => 3000000,
            'cash_equity_y' => 29360000,
            'two_year_percent' => 290.74
        ]
    ];

    public function getStocks($filters = []) {
        $filtered_stocks = $this->stocks;

        // Apply industry filter
        if (isset($filters['industry']) && !empty($filters['industry'])) {
            $filtered_stocks = array_filter($filtered_stocks, function($stock) use ($filters) {
                return $stock['industry'] === $filters['industry'];
            });
        }

        // Apply custom filters
        if (isset($filters['custom_filters']) && is_array($filters['custom_filters'])) {
            foreach ($filters['custom_filters'] as $filter) {
                $filtered_stocks = $this->applyFilter($filtered_stocks, $filter);
            }
        }

        return array_values($filtered_stocks);
    }

    private function applyFilter($stocks, $filter) {
        $metric = $this->getMetricField($filter['metric']);
        $operator = $filter['operator'];
        $value = floatval($filter['value']);

        return array_filter($stocks, function($stock) use ($metric, $operator, $value) {
            $stock_value = $stock[$metric];
            
            if ($stock_value === null) {
                return false;
            }

            switch ($operator) {
                case 'greater_than':
                    return $stock_value > $value;
                case 'less_than':
                    return $stock_value < $value;
                case 'less_than_or_equal':
                    return $stock_value <= $value;
                case 'greater_than_or_equal':
                    return $stock_value >= $value;
                case 'equal':
                    return $stock_value == $value;
                default:
                    return true;
            }
        });
    }

    private function getMetricField($metric) {
        $mapping = [
            'Revenue (Quarter)' => 'revenue_qtr',
            'EV to Assets' => 'ev_assets',
            'EPS (Basic) (Annual)' => 'eps_y',
            'Market Cap' => 'market_cap',
            'EPS (Y)' => 'eps_y',
            'EV/Assets' => 'ev_assets',
            'Revenue (Qtr)' => 'revenue_qtr',
            'Cap Employed (TTM)' => 'cap_employed_ttm',
            'Capex % Rev (TTM)' => 'capex_rev_ttm',
            'Capex (TTM)' => 'capex_ttm',
            'Cash & Equity (Y)' => 'cash_equity_y',
            '2Y %' => 'two_year_percent'
        ];

        return $mapping[$metric] ?? 'market_cap';
    }

    public function getIndustries() {
        $industries = array_unique(array_column($this->stocks, 'industry'));
        return array_values($industries);
    }

    public function getMetrics() {
        return [
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
    }
}

// Initialize screener
$screener = new StockScreener();

// Handle different endpoints
$endpoint = $_GET['endpoint'] ?? 'stocks';

switch ($endpoint) {
    case 'stocks':
        $filters = [];
        
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $input = json_decode(file_get_contents('php://input'), true);
            $filters = $input ?? [];
        } else {
            // Handle GET parameters
            if (isset($_GET['industry'])) {
                $filters['industry'] = $_GET['industry'];
            }
        }
        
        $stocks = $screener->getStocks($filters);
        echo json_encode([
            'success' => true,
            'data' => $stocks,
            'count' => count($stocks)
        ]);
        break;

    case 'industries':
        $industries = $screener->getIndustries();
        echo json_encode([
            'success' => true,
            'data' => $industries
        ]);
        break;

    case 'metrics':
        $metrics = $screener->getMetrics();
        echo json_encode([
            'success' => true,
            'data' => $metrics
        ]);
        break;

    default:
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'error' => 'Endpoint not found'
        ]);
        break;
}
?>