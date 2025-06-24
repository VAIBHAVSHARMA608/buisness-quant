<?php
/**
 * Plugin Name: Stock Screener
 * Plugin URI: https://yoursite.com
 * Description: A comprehensive stock screening tool with advanced filtering capabilities
 * Version: 1.0.0
 * Author: Your Name
 * License: GPL v2 or later
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

class StockScreenerPlugin {
    
    public function __construct() {
        add_action('init', array($this, 'init'));
        add_action('wp_enqueue_scripts', array($this, 'enqueue_scripts'));
        add_shortcode('stock_screener', array($this, 'render_shortcode'));
        add_action('wp_ajax_stock_screener_data', array($this, 'handle_ajax_request'));
        add_action('wp_ajax_nopriv_stock_screener_data', array($this, 'handle_ajax_request'));
        register_activation_hook(__FILE__, array($this, 'create_tables'));
    }
    
    public function init() {
        // Plugin initialization
    }
    
    public function enqueue_scripts() {
        wp_enqueue_script('stock-screener-js', plugin_dir_url(__FILE__) . 'assets/stock-screener.js', array('jquery'), '1.0.0', true);
        wp_enqueue_style('stock-screener-css', plugin_dir_url(__FILE__) . 'assets/stock-screener.css', array(), '1.0.0');
        
        // Localize script for AJAX
        wp_localize_script('stock-screener-js', 'stock_screener_ajax', array(
            'ajax_url' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('stock_screener_nonce')
        ));
    }
    
    public function render_shortcode($atts) {
        $atts = shortcode_atts(array(
            'height' => '800px',
            'theme' => 'default'
        ), $atts);
        
        ob_start();
        ?>
        <div id="stock-screener-app" style="height: <?php echo esc_attr($atts['height']); ?>;" data-theme="<?php echo esc_attr($atts['theme']); ?>">
            <div class="stock-screener-loading">
                <div class="spinner"></div>
                <p>Loading Stock Screener...</p>
            </div>
        </div>
        <?php
        return ob_get_clean();
    }
    
    public function handle_ajax_request() {
        // Verify nonce
        if (!wp_verify_nonce($_POST['nonce'], 'stock_screener_nonce')) {
            wp_die('Security check failed');
        }
        
        $action = sanitize_text_field($_POST['screener_action']);
        
        switch ($action) {
            case 'get_stocks':
                $this->get_stocks();
                break;
            case 'get_industries':
                $this->get_industries();
                break;
            case 'get_metrics':
                $this->get_metrics();
                break;
            default:
                wp_send_json_error('Invalid action');
        }
    }
    
    private function get_stocks() {
        global $wpdb;
        
        $filters = json_decode(stripslashes($_POST['filters']), true);
        $industry = sanitize_text_field($_POST['industry']);
        
        $table_name = $wpdb->prefix . 'stock_screener_data';
        
        $where_conditions = array('1=1');
        $where_values = array();
        
        // Industry filter
        if (!empty($industry)) {
            $where_conditions[] = 'industry = %s';
            $where_values[] = $industry;
        }
        
        // Custom filters
        if (!empty($filters['custom_filters'])) {
            foreach ($filters['custom_filters'] as $filter) {
                $metric_field = $this->get_metric_field($filter['metric']);
                $operator = $this->get_sql_operator($filter['operator']);
                $value = floatval($filter['value']);
                
                if ($metric_field && $operator) {
                    $where_conditions[] = "{$metric_field} {$operator} %f";
                    $where_values[] = $value;
                }
            }
        }
        
        $where_clause = implode(' AND ', $where_conditions);
        
        if (!empty($where_values)) {
            $query = $wpdb->prepare("SELECT * FROM {$table_name} WHERE {$where_clause}", $where_values);
        } else {
            $query = "SELECT * FROM {$table_name} WHERE {$where_clause}";
        }
        
        $results = $wpdb->get_results($query, ARRAY_A);
        
        wp_send_json_success(array(
            'data' => $results,
            'count' => count($results)
        ));
    }
    
    private function get_industries() {
        global $wpdb;
        
        $table_name = $wpdb->prefix . 'stock_screener_data';
        $industries = $wpdb->get_col("SELECT DISTINCT industry FROM {$table_name} ORDER BY industry");
        
        wp_send_json_success($industries);
    }
    
    private function get_metrics() {
        $metrics = array(
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
        );
        
        wp_send_json_success($metrics);
    }
    
    private function get_metric_field($metric) {
        $mapping = array(
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
        );
        
        return isset($mapping[$metric]) ? $mapping[$metric] : null;
    }
    
    private function get_sql_operator($operator) {
        $mapping = array(
            'greater_than' => '>',
            'less_than' => '<',
            'less_than_or_equal' => '<=',
            'greater_than_or_equal' => '>=',
            'equal' => '='
        );
        
        return isset($mapping[$operator]) ? $mapping[$operator] : null;
    }
    
    public function create_tables() {
        global $wpdb;
        
        $table_name = $wpdb->prefix . 'stock_screener_data';
        
        $charset_collate = $wpdb->get_charset_collate();
        
        $sql = "CREATE TABLE $table_name (
            id mediumint(9) NOT NULL AUTO_INCREMENT,
            ticker varchar(10) NOT NULL,
            company varchar(255) NOT NULL,
            sector varchar(100) NOT NULL,
            industry varchar(100) NOT NULL,
            market_cap bigint(20) DEFAULT NULL,
            eps_y decimal(10,2) DEFAULT NULL,
            ev_assets decimal(10,2) DEFAULT NULL,
            revenue_qtr bigint(20) DEFAULT NULL,
            cap_employed_ttm bigint(20) DEFAULT NULL,
            capex_rev_ttm decimal(10,2) DEFAULT NULL,
            capex_ttm bigint(20) DEFAULT NULL,
            cash_equity_y bigint(20) DEFAULT NULL,
            two_year_percent decimal(10,2) DEFAULT NULL,
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            UNIQUE KEY ticker (ticker),
            KEY industry (industry),
            KEY sector (sector)
        ) $charset_collate;";
        
        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        dbDelta($sql);
        
        // Insert sample data
        $this->insert_sample_data();
    }
    
    private function insert_sample_data() {
        global $wpdb;
        
        $table_name = $wpdb->prefix . 'stock_screener_data';
        
        $sample_data = array(
            array(
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
            ),
            array(
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
            ),
            // Add more sample data as needed
        );
        
        foreach ($sample_data as $data) {
            $wpdb->replace($table_name, $data);
        }
    }
}

// Initialize the plugin
new StockScreenerPlugin();

// Admin menu for data management
add_action('admin_menu', 'stock_screener_admin_menu');

function stock_screener_admin_menu() {
    add_menu_page(
        'Stock Screener',
        'Stock Screener',
        'manage_options',
        'stock-screener',
        'stock_screener_admin_page',
        'dashicons-chart-line',
        30
    );
}

function stock_screener_admin_page() {
    ?>
    <div class="wrap">
        <h1>Stock Screener Management</h1>
        
        <div class="card">
            <h2>Import Stock Data</h2>
            <form method="post" enctype="multipart/form-data">
                <?php wp_nonce_field('stock_screener_import', 'import_nonce'); ?>
                <table class="form-table">
                    <tr>
                        <th scope="row">CSV File</th>
                        <td>
                            <input type="file" name="stock_data_csv" accept=".csv" required>
                            <p class="description">Upload a CSV file with stock data</p>
                        </td>
                    </tr>
                </table>
                <p class="submit">
                    <input type="submit" name="import_stocks" class="button-primary" value="Import Data">
                </p>
            </form>
        </div>
        
        <div class="card">
            <h2>Usage</h2>
            <p>Use the shortcode <code>[stock_screener]</code> to display the stock screener on any page or post.</p>
            <p>Optional parameters:</p>
            <ul>
                <li><code>height</code> - Set the height of the screener (default: 800px)</li>
                <li><code>theme</code> - Set the theme (default, dark, light)</li>
            </ul>
            <p>Example: <code>[stock_screener height="600px" theme="dark"]</code></p>
        </div>
    </div>
    <?php
    
    // Handle CSV import
    if (isset($_POST['import_stocks']) && wp_verify_nonce($_POST['import_nonce'], 'stock_screener_import')) {
        stock_screener_handle_csv_import();
    }
}

function stock_screener_handle_csv_import() {
    if (!isset($_FILES['stock_data_csv']) || $_FILES['stock_data_csv']['error'] !== UPLOAD_ERR_OK) {
        echo '<div class="notice notice-error"><p>Error uploading file.</p></div>';
        return;
    }
    
    $file = $_FILES['stock_data_csv']['tmp_name'];
    $handle = fopen($file, 'r');
    
    if ($handle === false) {
        echo '<div class="notice notice-error"><p>Error reading file.</p></div>';
        return;
    }
    
    global $wpdb;
    $table_name = $wpdb->prefix . 'stock_screener_data';
    
    $headers = fgetcsv($handle);
    $imported = 0;
    
    while (($data = fgetcsv($handle)) !== false) {
        $row_data = array_combine($headers, $data);
        
        // Map CSV columns to database columns
        $stock_data = array(
            'ticker' => sanitize_text_field($row_data['ticker'] ?? ''),
            'company' => sanitize_text_field($row_data['company'] ?? ''),
            'sector' => sanitize_text_field($row_data['sector'] ?? ''),
            'industry' => sanitize_text_field($row_data['industry'] ?? ''),
            'market_cap' => !empty($row_data['market_cap']) ? intval($row_data['market_cap']) : null,
            'eps_y' => !empty($row_data['eps_y']) ? floatval($row_data['eps_y']) : null,
            'ev_assets' => !empty($row_data['ev_assets']) ? floatval($row_data['ev_assets']) : null,
            'revenue_qtr' => !empty($row_data['revenue_qtr']) ? intval($row_data['revenue_qtr']) : null,
            'cap_employed_ttm' => !empty($row_data['cap_employed_ttm']) ? intval($row_data['cap_employed_ttm']) : null,
            'capex_rev_ttm' => !empty($row_data['capex_rev_ttm']) ? floatval($row_data['capex_rev_ttm']) : null,
            'capex_ttm' => !empty($row_data['capex_ttm']) ? intval($row_data['capex_ttm']) : null,
            'cash_equity_y' => !empty($row_data['cash_equity_y']) ? intval($row_data['cash_equity_y']) : null,
            'two_year_percent' => !empty($row_data['two_year_percent']) ? floatval($row_data['two_year_percent']) : null,
        );
        
        if (!empty($stock_data['ticker'])) {
            $wpdb->replace($table_name, $stock_data);
            $imported++;
        }
    }
    
    fclose($handle);
    
    echo "<div class='notice notice-success'><p>Successfully imported {$imported} stocks.</p></div>";
}
?>