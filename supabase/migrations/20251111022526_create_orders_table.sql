/*
  # Crear Tabla de Pedidos (Orders)

  1. Tabla Nueva
    - `orders` - Tabla principal para almacenar todos los pedidos
      
      ## Campos de Identificación
      - `id` (uuid, primary key) - Identificador único del pedido
      - `pedido` (text, not null, unique) - Número de pedido único
      - `data` (date, not null) - Fecha del pedido
      
      ## Campos de Relaciones (Foreign Keys)
      - `exporter_id` (uuid, not null) - Referencia al exportador
      - `importer_id` (uuid, not null) - Referencia al importador
      - `client_id` (uuid, not null) - Referencia al cliente
      - `producer_id` (uuid, nullable) - Referencia al productor (opcional)
      
      ## Campos Comerciales
      - `quantidade` (text, not null) - Cantidad del pedido
      - `itens` (text) - Descripción de items/productos
      - `preco_guia` (text) - Precio guía
      - `total_guia` (text) - Total según guía
      - `moeda` (text, not null, default 'BRL') - Moneda (BRL, USD, EUR)
      - `referencia_exportador` (text) - Referencia del exportador
      - `referencia_importador` (text) - Referencia del importador
      - `etiqueta` (text) - Etiqueta del pedido
      
      ## Campos de Logística
      - `via_transporte` (text) - Vía de transporte (terrestre, maritimo, aereo)
      - `incoterm` (text) - Incoterm (CIF, FOB, FCA, CFR)
      - `porto_embarque` (text) - Puerto de embarque
      - `porto_destino` (text) - Puerto de destino
      - `condicao` (text) - Condición de pago
      - `semana` (text) - Semana de referencia
      
      ## Campos de Fechas
      - `embarque` (date) - Fecha de embarque
      - `previsao` (date) - Fecha de previsión
      - `chegada` (date) - Fecha de llegada
      
      ## Campos de Estado y Observaciones
      - `situacao` (text, not null, default 'pendiente') - Estado del pedido
      - `observacao` (text) - Observaciones adicionales
      
      ## Campos de Auditoría
      - `created_at` (timestamptz, default now()) - Fecha de creación
      - `updated_at` (timestamptz, default now()) - Fecha de última actualización

  2. Seguridad
    - Habilitar RLS en la tabla orders
    - Políticas para lectura pública
    - Políticas para escritura autenticada
    - Políticas para actualización autenticada
    - Políticas para eliminación autenticada

  3. Índices
    - Índice en pedido para búsquedas rápidas
    - Índices en foreign keys para joins optimizados
    - Índices en campos de fecha para filtros
    - Índice en situacao para filtros por estado

  4. Notas Importantes
    - El campo pedido debe ser único para evitar duplicados
    - Los campos de moneda y situacao tienen valores por defecto
    - Las fechas son opcionales excepto la fecha del pedido
    - Los precios se almacenan como text para mayor flexibilidad
*/

-- Crear tabla de pedidos
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pedido text NOT NULL UNIQUE,
  data date NOT NULL,
  
  -- Relaciones
  exporter_id uuid NOT NULL REFERENCES exporters(id) ON DELETE RESTRICT,
  importer_id uuid NOT NULL REFERENCES importers(id) ON DELETE RESTRICT,
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
  producer_id uuid REFERENCES producers(id) ON DELETE SET NULL,
  
  -- Información comercial
  quantidade text NOT NULL,
  itens text,
  preco_guia text,
  total_guia text,
  moeda text NOT NULL DEFAULT 'BRL',
  referencia_exportador text,
  referencia_importador text,
  etiqueta text,
  
  -- Información de logística
  via_transporte text,
  incoterm text,
  porto_embarque text,
  porto_destino text,
  condicao text,
  semana text,
  
  -- Fechas logísticas
  embarque date,
  previsao date,
  chegada date,
  
  -- Estado y observaciones
  situacao text NOT NULL DEFAULT 'pendiente',
  observacao text,
  
  -- Auditoría
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Crear índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_orders_pedido ON orders(pedido);
CREATE INDEX IF NOT EXISTS idx_orders_data ON orders(data DESC);
CREATE INDEX IF NOT EXISTS idx_orders_client_id ON orders(client_id);
CREATE INDEX IF NOT EXISTS idx_orders_exporter_id ON orders(exporter_id);
CREATE INDEX IF NOT EXISTS idx_orders_importer_id ON orders(importer_id);
CREATE INDEX IF NOT EXISTS idx_orders_producer_id ON orders(producer_id);
CREATE INDEX IF NOT EXISTS idx_orders_situacao ON orders(situacao);
CREATE INDEX IF NOT EXISTS idx_orders_embarque ON orders(embarque);
CREATE INDEX IF NOT EXISTS idx_orders_chegada ON orders(chegada);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

-- Crear índice compuesto para búsquedas por texto
CREATE INDEX IF NOT EXISTS idx_orders_search ON orders USING gin(to_tsvector('spanish', coalesce(pedido, '') || ' ' || coalesce(itens, '')));

-- Habilitar Row Level Security
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Política para permitir lectura pública
CREATE POLICY "Allow public read access to orders"
  ON orders
  FOR SELECT
  TO public
  USING (true);

-- Política para permitir inserción a usuarios autenticados
CREATE POLICY "Allow authenticated users to insert orders"
  ON orders
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Política para permitir actualización a usuarios autenticados
CREATE POLICY "Allow authenticated users to update orders"
  ON orders
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Política para permitir eliminación a usuarios autenticados
CREATE POLICY "Allow authenticated users to delete orders"
  ON orders
  FOR DELETE
  TO authenticated
  USING (true);

-- Función para actualizar automáticamente updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at automáticamente
DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();