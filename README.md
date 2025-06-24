# WordPress Stock Screener Plugin

A comprehensive stock screening tool that can be easily integrated into any WordPress site.

## Installation

1. **Upload the Plugin**
   - Copy the entire `stock-screener-plugin.php` file to your WordPress plugins directory: `/wp-content/plugins/stock-screener/`
   - Copy the `assets` folder to the same directory

2. **Activate the Plugin**
   - Go to WordPress Admin → Plugins
   - Find "Stock Screener" and click "Activate"

3. **Database Setup**
   - The plugin will automatically create the necessary database tables upon activation
   - Sample data will be inserted for testing

## Usage

### Basic Shortcode
Add the stock screener to any page or post using:
```
[stock_screener]
```

### Advanced Shortcode Options
```
[stock_screener height="600px" theme="dark"]
```

**Parameters:**
- `height` - Set the height of the screener (default: 800px)
- `theme` - Choose theme: `default`, `dark`, or `light`

## Admin Features

### Data Management
- Go to WordPress Admin → Stock Screener
- Import CSV files with stock data
- View usage instructions and shortcode examples

### CSV Import Format
Your CSV file should have these columns:
- ticker
- company
- sector
- industry
- market_cap
- eps_y
- ev_assets
- revenue_qtr
- cap_employed_ttm
- capex_rev_ttm
- capex_ttm
- cash_equity_y
- two_year_percent

## Features

✅ **Industry Filtering** - Filter stocks by industry sector
✅ **Custom Filters** - Add multiple metric-based filters
✅ **Sortable Columns** - Click any column header to sort
✅ **Export to CSV** - Download filtered results
✅ **Responsive Design** - Works on all devices
✅ **WordPress Integration** - Uses WordPress AJAX and security
✅ **Theme Support** - Multiple color themes available
✅ **Admin Panel** - Easy data management interface

## Database Structure

The plugin creates a table `wp_stock_screener_data` with the following structure:

```sql
CREATE TABLE wp_stock_screener_data (
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
    UNIQUE KEY ticker (ticker)
);
```

## Customization

### Styling
- Edit `assets/stock-screener.css` to customize the appearance
- The plugin supports custom themes via the `data-theme` attribute

### Adding New Metrics
1. Add the metric to the database table
2. Update the `get_metrics()` method in the PHP file
3. Update the `get_metric_field()` mapping
4. Add the column to the frontend table

### Security
- All AJAX requests are protected with WordPress nonces
- Input sanitization and validation on all user inputs
- SQL injection protection using WordPress $wpdb methods

## Troubleshooting

### Plugin Not Working
1. Check that jQuery is loaded on your site
2. Verify the plugin files are in the correct directory
3. Check browser console for JavaScript errors

### Data Not Loading
1. Verify the database table was created
2. Check that sample data was inserted
3. Test the AJAX endpoints directly

### Styling Issues
1. Check for CSS conflicts with your theme
2. Try different theme options
3. Inspect elements to identify conflicting styles

## Support

For support and customization requests, please contact the plugin developer.

## License

This plugin is licensed under GPL v2 or later.