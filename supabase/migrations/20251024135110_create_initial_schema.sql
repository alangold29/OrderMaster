/*
  # Crear esquema inicial del CRM

  1. Nuevas Tablas
    - `clients` - Tabla de clientes
      - `id` (varchar, primary key, uuid)
      - `name` (text, unique, not null)
      - `created_at` (timestamp)
    
    - `exporters` - Tabla de exportadores
      - `id` (varchar, primary key, uuid)
      - `name` (text, unique, not null)
      - `created_at` (timestamp)
    
    - `importers` - Tabla de importadores
      - `id` (varchar, primary key, uuid)
      - `name` (text, unique, not null)
      - `created_at` (timestamp)
    
    - `producers` - Tabla de productores
      - `id` (varchar, primary key, uuid)
      - `name` (text, unique, not null)
      - `created_at` (timestamp)
    
    - `orders` - Tabla de pedidos
      - `id` (varchar, primary key, uuid)
      - `pedido` (text, unique, not null)
      - `data` (date, not null)
      - `exporter_id` (varchar, foreign key)
      - `referencia_exportador` (text)
      - `importer_id` (varchar, foreign key)
      - `referencia_importador` (text)
      - `quantidade` (decimal)
      - `itens` (text)
      - `preco_guia` (decimal)
      - `total_guia` (decimal)
      - `producer_id` (varchar, foreign key)
      - `client_id` (varchar, foreign key)
      - `etiqueta` (text)
      - `porto_embarque` (text)
      - `porto_destino` (text)
      - `condicao` (text)
      - `embarque` (date)
      - `previsao` (date)
      - `chegada` (date)
      - `observacao` (text)
      - `situacao` (text, default: 'pendente')
      - `semana` (text)
      - `cliente_rede` (text)
      - `representante` (text)
      - `produto` (text)
      - `data_emissao_pedido` (date)
      - `cliente_final` (text)
      - `data_embarque_de` (date)
      - `grupo` (text)
      - `pais_exportador` (text)
      - `notify` (text)
      - `bl_crt_awb` (text)
      - `data_desembarque` (date)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `company_users` - Tabla de usuarios de la empresa
      - `id` (varchar, primary key, uuid)
      - `email` (varchar, unique, not null)
      - `name` (varchar, not null)
      - `position` (varchar, not null)
      - `role` (varchar, default: 'viewer')
      - `is_active` (boolean, default: true)
      - `permissions` (jsonb, default: {})
      - `last_login` (timestamp)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Notas Importantes
    - Se utilizan IDs UUID generados automáticamente
    - Las relaciones entre tablas están configuradas con claves foráneas
    - Los campos de fecha y decimal permiten flexibilidad en el manejo de datos
    - La tabla company_users incluye sistema de permisos basado en roles
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