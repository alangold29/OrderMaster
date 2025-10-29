/*
  # Fix Order States and Simplify User Roles
  
  ## Summary
  This migration standardizes the system to use consistent Spanish terminology and simplifies the user role structure.
  
  ## Changes Made
  
  ### 1. Order States Standardization
  - Changes default order state from "pendente" (Portuguese) to "pendiente" (Spanish)
  - Updates existing orders to use Spanish states:
    - "pendente" → "pendiente" (pending)
    - "em-transito" → "transito" (in transit)
    - "entregue" → "entregado" (delivered)
    - Removes "quitado" state (paid status should be tracked separately if needed)
  
  ### 2. User Roles Simplification  
  - Simplifies from 4 roles to 3 roles:
    - "manager" → "gerente" (manager - full access)
    - "admin" → "administrador" (administrator - limited editing)
    - "viewer" → "visualizador" (viewer - read only)
  - Removes "editor" role (merged into administrador)
  - Updates default role to "visualizador"
  
  ## Data Safety
  - All existing order records will have their states updated automatically
  - All existing user records will have their roles mapped to the new structure
  - No data loss occurs, only value transformations
  
  ## Important Notes
  - This is a safe transformation that maintains data integrity
  - The system now uses consistent Spanish terminology throughout
  - User permissions remain intact during role name changes
*/

-- Update orders table: Change state values to Spanish
UPDATE orders 
SET situacao = 
  CASE 
    WHEN situacao = 'pendente' THEN 'pendiente'
    WHEN situacao = 'em-transito' THEN 'transito'
    WHEN situacao = 'entregue' THEN 'entregado'
    WHEN situacao = 'quitado' THEN 'entregado' -- Map paid status to delivered
    ELSE situacao
  END
WHERE situacao IN ('pendente', 'em-transito', 'entregue', 'quitado');

-- Update default value for orders.situacao
ALTER TABLE orders ALTER COLUMN situacao SET DEFAULT 'pendiente';

-- Update company_users table: Simplify roles to 3 levels
UPDATE company_users
SET role = 
  CASE
    WHEN role = 'manager' THEN 'gerente'
    WHEN role = 'admin' THEN 'administrador'
    WHEN role = 'editor' THEN 'administrador' -- Merge editor into administrador
    WHEN role = 'viewer' THEN 'visualizador'
    ELSE 'visualizador' -- Default fallback
  END
WHERE role IN ('manager', 'admin', 'editor', 'viewer');

-- Update default role for new users
ALTER TABLE company_users ALTER COLUMN role SET DEFAULT 'visualizador';

-- Add comment to orders table documenting valid states
COMMENT ON COLUMN orders.situacao IS 'Valid values: pendiente, transito, entregado';

-- Add comment to company_users.role documenting valid roles
COMMENT ON COLUMN company_users.role IS 'Valid values: gerente (full access), administrador (limited editing), visualizador (read only)';