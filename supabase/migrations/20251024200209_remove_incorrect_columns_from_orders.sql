/*
  # Remove Incorrect Columns from Orders Table

  ## Summary
  This migration removes columns from the orders table that do not exist in the actual Excel data structure.
  The system should only work with the 22 columns that come from the Excel file.

  ## Changes Made
  
  ### Columns Removed from orders table:
  1. `cliente_rede` - Not in Excel structure
  2. `representante` - Not in Excel structure  
  3. `produto` - Not in Excel structure
  4. `data_emissao_pedido` - Not in Excel structure
  5. `cliente_final` - Not in Excel structure
  6. `data_embarque_de` - Not in Excel structure
  7. `grupo` - Not in Excel structure
  8. `pais_exportador` - Not in Excel structure
  9. `notify` - Not in Excel structure
  10. `bl_crt_awb` - Not in Excel structure
  11. `data_desembarque` - Not in Excel structure

  ## Data Safety
  - These columns are being removed as they don't match the actual data structure
  - Any data in these columns will be permanently deleted
  - The 22 core Excel columns remain intact: PEDIDO, DATA, EXPORTADOR, REFERÊNCIA (x2), IMPORTADOR, 
    QUANTIDADE, ITENS, PREÇO GUIA, TOTAL GUIA, PRODUTOR, CLIENTE, ETIQUETA, PORTO EMBARQUE, 
    PORTO DESTINO, CONDIÇÃO, EMBARQUE, PREVISÃO, CHEGADA, OBSERVAÇÃO, SITUAÇÃO, SEMANA

  ## Important Notes
  - This is a destructive operation - data in removed columns will be lost
  - Ensure this matches the intended data structure before applying
  - The system will now only accept the 22 columns from the Excel file
*/

-- Remove columns that don't exist in the Excel structure
ALTER TABLE orders DROP COLUMN IF EXISTS cliente_rede;
ALTER TABLE orders DROP COLUMN IF EXISTS representante;
ALTER TABLE orders DROP COLUMN IF EXISTS produto;
ALTER TABLE orders DROP COLUMN IF EXISTS data_emissao_pedido;
ALTER TABLE orders DROP COLUMN IF EXISTS cliente_final;
ALTER TABLE orders DROP COLUMN IF EXISTS data_embarque_de;
ALTER TABLE orders DROP COLUMN IF EXISTS grupo;
ALTER TABLE orders DROP COLUMN IF EXISTS pais_exportador;
ALTER TABLE orders DROP COLUMN IF EXISTS notify;
ALTER TABLE orders DROP COLUMN IF EXISTS bl_crt_awb;
ALTER TABLE orders DROP COLUMN IF EXISTS data_desembarque;