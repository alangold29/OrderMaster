-- Script para agregar algunos pedidos de prueba con diferentes monedas
-- Este script agrega pedidos de ejemplo con USD y EUR para demostrar la funcionalidad

-- Primero, vamos a actualizar algunos pedidos existentes para que tengan diferentes monedas
-- Actualizamos algunos pedidos a USD
UPDATE orders
SET moeda = 'USD', total_guia = total_guia / 5
WHERE id IN (
  SELECT id FROM orders
  WHERE moeda = 'BRL'
  LIMIT 3
);

-- Actualizamos algunos pedidos a EUR
UPDATE orders
SET moeda = 'EUR', total_guia = total_guia / 6
WHERE id IN (
  SELECT id FROM orders
  WHERE moeda = 'BRL'
  LIMIT 2
);

-- Consulta para verificar la distribución de monedas
SELECT
  moeda,
  COUNT(*) as cantidad_pedidos,
  SUM(total_guia::numeric) as total_valor
FROM orders
GROUP BY moeda
ORDER BY moeda;
