/*
  # Create CRM Initial Schema

  1. New Tables
    - `clients` - Client table
      - `id` (varchar, primary key, uuid)
      - `name` (text, unique, not null)
      - `created_at` (timestamp)
    
    - `exporters` - Exporters table
      - `id` (varchar, primary key, uuid)
      - `name` (text, unique, not null)
      - `created_at` (timestamp)
    
    - `importers` - Importers table
      - `id` (varchar, primary key, uuid)
      - `name` (text, unique, not null)
      - `created_at` (timestamp)
    
    - `producers` - Producers table
      - `id` (varchar, primary key, uuid)
      - `name` (text, unique, not null)
      - `created_at` (timestamp)
    
    - `orders` - Orders table with comprehensive shipping and product info
      - `id` (varchar, primary key, uuid)
      - `pedido` (text, unique, not null) - Order number
      - `data` (date, not null) - Order date
      - Foreign keys to exporters, importers, clients, producers
      - Product details: quantity, items, prices
      - Shipping details: ports, dates, tracking
      - Status and additional metadata
    
    - `company_users` - Company users management
      - `id` (varchar, primary key, uuid)
      - `email` (varchar, unique, not null)
      - `name` (varchar, not null)
      - `position` (varchar, not null)
      - `role` (varchar, default: 'viewer')
      - `is_active` (boolean, default: true)
      - `permissions` (jsonb, default: {})

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated access

  3. Performance
    - Create indexes on foreign keys and frequently queried columns
*/

-- Create clients table
CREATE TABLE IF NOT EXISTS clients (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT now()
);

-- Create exporters table
CREATE TABLE IF NOT EXISTS exporters (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT now()
);

-- Create importers table
CREATE TABLE IF NOT EXISTS importers (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT now()
);

-- Create producers table
CREATE TABLE IF NOT EXISTS producers (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT now()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  pedido TEXT NOT NULL UNIQUE,
  data DATE NOT NULL,
  exporter_id VARCHAR NOT NULL REFERENCES exporters(id),
  referencia_exportador TEXT,
  importer_id VARCHAR NOT NULL REFERENCES importers(id),
  referencia_importador TEXT,
  quantidade DECIMAL(10, 2) NOT NULL,
  itens TEXT,
  preco_guia DECIMAL(10, 2),
  total_guia DECIMAL(10, 2),
  producer_id VARCHAR REFERENCES producers(id),
  client_id VARCHAR NOT NULL REFERENCES clients(id),
  etiqueta TEXT,
  porto_embarque TEXT,
  porto_destino TEXT,
  condicao TEXT,
  embarque DATE,
  previsao DATE,
  chegada DATE,
  observacao TEXT,
  situacao TEXT NOT NULL DEFAULT 'pendente',
  semana TEXT,
  cliente_rede TEXT,
  representante TEXT,
  produto TEXT,
  data_emissao_pedido DATE,
  cliente_final TEXT,
  data_embarque_de DATE,
  grupo TEXT,
  pais_exportador TEXT,
  notify TEXT,
  bl_crt_awb TEXT,
  data_desembarque DATE,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Create company_users table
CREATE TABLE IF NOT EXISTS company_users (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR NOT NULL UNIQUE,
  name VARCHAR NOT NULL,
  position VARCHAR NOT NULL,
  role VARCHAR NOT NULL DEFAULT 'viewer',
  is_active BOOLEAN DEFAULT true,
  permissions JSONB DEFAULT '{}',
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_orders_client_id ON orders(client_id);
CREATE INDEX IF NOT EXISTS idx_orders_exporter_id ON orders(exporter_id);
CREATE INDEX IF NOT EXISTS idx_orders_importer_id ON orders(importer_id);
CREATE INDEX IF NOT EXISTS idx_orders_producer_id ON orders(producer_id);
CREATE INDEX IF NOT EXISTS idx_orders_situacao ON orders(situacao);
CREATE INDEX IF NOT EXISTS idx_orders_data ON orders(data);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_company_users_email ON company_users(email);
CREATE INDEX IF NOT EXISTS idx_company_users_role ON company_users(role);

-- Enable Row Level Security
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE exporters ENABLE ROW LEVEL SECURITY;
ALTER TABLE importers ENABLE ROW LEVEL SECURITY;
ALTER TABLE producers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_users ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (adjust based on your auth requirements)
-- For now, allowing all operations for development
CREATE POLICY "Allow all operations on clients"
  ON clients
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations on exporters"
  ON exporters
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations on importers"
  ON importers
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations on producers"
  ON producers
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations on orders"
  ON orders
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations on company_users"
  ON company_users
  FOR ALL
  USING (true)
  WITH CHECK (true);