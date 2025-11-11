/*
  # Crear Tabla de Usuarios de la Empresa

  1. Tabla Nueva
    - `company_users` - Tabla para gestionar usuarios de la empresa con permisos
      
      ## Campos de Identificación
      - `id` (uuid, primary key) - Identificador único del usuario
      - `email` (text, not null, unique) - Email del usuario
      - `name` (text, not null) - Nombre completo del usuario
      - `position` (text, not null) - Cargo/posición del usuario
      
      ## Campos de Autorización
      - `role` (text, not null, default 'visualizador') - Rol del usuario (gerente, administrador, visualizador)
      - `is_active` (boolean, not null, default true) - Estado activo/inactivo del usuario
      - `permissions` (jsonb, not null, default '{}') - Permisos específicos del usuario
      
      ## Campos de Auditoría
      - `last_login` (timestamptz) - Última vez que el usuario inició sesión
      - `created_at` (timestamptz, default now()) - Fecha de creación
      - `updated_at` (timestamptz, default now()) - Fecha de última actualización

  2. Seguridad
    - Habilitar RLS en la tabla company_users
    - Políticas restrictivas para lectura solo de usuarios activos
    - Políticas para escritura autenticada
    - Políticas para actualización autenticada

  3. Índices
    - Índice único en email
    - Índice en role para filtros por rol
    - Índice en is_active para filtros por estado

  4. Roles Disponibles
    - gerente: Acceso completo a gestión de pedidos y reportes
    - administrador: Acceso completo incluyendo gestión de usuarios
    - visualizador: Solo lectura de pedidos y reportes

  5. Permisos en formato JSON
    Ejemplo de estructura de permisos:
    {
      "orders:view": true,
      "orders:create": true,
      "orders:edit": true,
      "orders:delete": false,
      "orders:export": true,
      "users:view": false,
      "users:create": false,
      "users:edit": false,
      "users:delete": false,
      "reports:view": true,
      "reports:export": true
    }
*/

-- Crear tabla de usuarios de la empresa
CREATE TABLE IF NOT EXISTS company_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  name text NOT NULL,
  position text NOT NULL,
  
  -- Autorización
  role text NOT NULL DEFAULT 'visualizador',
  is_active boolean NOT NULL DEFAULT true,
  permissions jsonb NOT NULL DEFAULT '{}'::jsonb,
  
  -- Auditoría
  last_login timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Constraints
  CONSTRAINT valid_role CHECK (role IN ('gerente', 'administrador', 'visualizador')),
  CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Crear índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_company_users_email ON company_users(email);
CREATE INDEX IF NOT EXISTS idx_company_users_role ON company_users(role);
CREATE INDEX IF NOT EXISTS idx_company_users_is_active ON company_users(is_active);
CREATE INDEX IF NOT EXISTS idx_company_users_created_at ON company_users(created_at DESC);

-- Habilitar Row Level Security
ALTER TABLE company_users ENABLE ROW LEVEL SECURITY;

-- Política para permitir lectura de usuarios activos
CREATE POLICY "Allow read access to active users"
  ON company_users
  FOR SELECT
  TO public
  USING (is_active = true);

-- Política para permitir inserción a usuarios autenticados
CREATE POLICY "Allow authenticated users to insert company users"
  ON company_users
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Política para permitir actualización a usuarios autenticados
CREATE POLICY "Allow authenticated users to update company users"
  ON company_users
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Política para permitir eliminación a usuarios autenticados
CREATE POLICY "Allow authenticated users to delete company users"
  ON company_users
  FOR DELETE
  TO authenticated
  USING (true);

-- Trigger para actualizar updated_at automáticamente en company_users
DROP TRIGGER IF EXISTS update_company_users_updated_at ON company_users;
CREATE TRIGGER update_company_users_updated_at
  BEFORE UPDATE ON company_users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();