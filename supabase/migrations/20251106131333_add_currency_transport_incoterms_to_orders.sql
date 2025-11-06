/*
  # Add Multi-Currency Support and Logistics Fields to Orders
  
  ## Summary
  This migration adds support for multiple currencies (BRL, USD, EUR) and important logistics fields
  to the orders table, enabling better international trade management.
  
  ## Changes Made
  
  ### 1. New Columns Added
  
  #### Currency Field
  - `moeda` (text): Stores the currency type for each order
    - Valid values: 'BRL' (Brazilian Real), 'USD' (US Dollar), 'EUR' (Euro)
    - Default: 'BRL' (maintains backward compatibility)
    - NOT NULL constraint ensures every order has a currency
  
  #### Transport Mode Field
  - `via_transporte` (text): Stores the shipping method
    - Valid values: 'terrestre' (land), 'maritimo' (sea), 'aereo' (air)
    - Optional field (can be NULL)
    - Important for logistics planning and cost estimation
  
  #### Incoterm Field
  - `incoterm` (text): Stores the international commercial terms
    - Valid values: 'CIF', 'FOB', 'FCA', 'CFR'
    - Optional field (can be NULL)
    - Defines responsibilities between buyer and seller in international trade
  
  ### 2. Data Integrity
  - All existing orders will automatically receive 'BRL' as their currency
  - No data loss occurs
  - New orders can specify any of the three supported currencies
  - Transport mode and incoterm fields remain empty for existing orders until updated
  
  ### 3. Business Impact
  - Enables tracking orders in multiple currencies without conversion
  - Provides better visibility into shipping methods
  - Standardizes international trade term documentation
  - Supports more accurate financial reporting per currency
  
  ## Important Notes
  - The default currency 'BRL' ensures backward compatibility
  - Currency field is required for all new orders
  - Transport mode and incoterms are optional to allow flexibility
  - These fields integrate seamlessly with existing order workflow
*/

-- Add currency column with default value of BRL
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS moeda text NOT NULL DEFAULT 'BRL';

-- Add transport mode column (optional field)
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS via_transporte text;

-- Add incoterm column (optional field)
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS incoterm text;

-- Add comments to document valid values
COMMENT ON COLUMN orders.moeda IS 'Currency type - Valid values: BRL (Brazilian Real), USD (US Dollar), EUR (Euro). Default: BRL';
COMMENT ON COLUMN orders.via_transporte IS 'Transport mode - Valid values: terrestre (land), maritimo (sea), aereo (air)';
COMMENT ON COLUMN orders.incoterm IS 'International commercial terms - Valid values: CIF, FOB, FCA, CFR';

-- Create indexes for better query performance on new fields
CREATE INDEX IF NOT EXISTS idx_orders_moeda ON orders(moeda);
CREATE INDEX IF NOT EXISTS idx_orders_via_transporte ON orders(via_transporte);
CREATE INDEX IF NOT EXISTS idx_orders_incoterm ON orders(incoterm);