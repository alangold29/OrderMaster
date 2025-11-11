/*
  # Crear Tablas de Catálogo

  1. Tablas Nuevas
    - `clients` - Almacena información de clientes
      - `id` (uuid, primary key)
      - `name` (text, not null, unique)
      - `created_at` (timestamptz)
    
    - `exporters` - Almacena información de exportadores
      - `id` (uuid, primary key)
      - `name` (text, not null, unique)
      - `created_at` (timestamptz)
    
    - `importers` - Almacena información de importadores
      - `id` (uuid, primary key)
      - `name` (text, not null, unique)
      - `created_at` (timestamptz)
    
    - `producers` - Almacena información de productores
      - `id` (uuid, primary key)
      - `name` (text, not null, unique)
      - `created_at` (timestamptz)

  2. Seguridad
    - Habilitar RLS en todas las tablas
    - Agregar políticas para lectura pública autenticada
    - Agregar políticas para escritura autenticada

  3. Notas Importantes
    - Todas las tablas de catálogo comparten la misma estructura simple
    - Los nombres deben ser únicos para evitar duplicados
    - Se incluyen índices en el campo name para búsquedas rápidas
*/

-- Tabla de Clientes
CREATE TABLE IF NOT EXISTS clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now()
);

-- Tabla de Exportadores
CREATE TABLE IF NOT EXISTS exporters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now()
);

-- Tabla de Importadores
CREATE TABLE IF NOT EXISTS importers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now()
);

-- Tabla de Productores
CREATE TABLE IF NOT EXISTS producers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now()
);

-- Crear índices para mejorar el rendimiento de búsquedas
CREATE INDEX IF NOT EXISTS idx_clients_name ON clients(name);
CREATE INDEX IF NOT EXISTS idx_exporters_name ON exporters(name);
CREATE INDEX IF NOT EXISTS idx_importers_name ON importers(name);
CREATE INDEX IF NOT EXISTS idx_producers_name ON producers(name);

-- Habilitar Row Level Security (RLS)
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE exporters ENABLE ROW LEVEL SECURITY;
ALTER TABLE importers ENABLE ROW LEVEL SECURITY;
ALTER TABLE producers ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad para clients
CREATE POLICY "Allow public read access to clients"
  ON clients
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow authenticated users to insert clients"
  ON clients
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update clients"
  ON clients
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Políticas de seguridad para exporters
CREATE POLICY "Allow public read access to exporters"
  ON exporters
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow authenticated users to insert exporters"
  ON exporters
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update exporters"
  ON exporters
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Políticas de seguridad para importers
CREATE POLICY "Allow public read access to importers"
  ON importers
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow authenticated users to insert importers"
  ON importers
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update importers"
  ON importers
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Políticas de seguridad para producers
CREATE POLICY "Allow public read access to producers"
  ON producers
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow authenticated users to insert producers"
  ON producers
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update producers"
  ON producers
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);