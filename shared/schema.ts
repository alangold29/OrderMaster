import { sql } from "drizzle-orm";
import { pgTable, text, varchar, decimal, integer, date, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const clients = pgTable("clients", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const exporters = pgTable("exporters", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const importers = pgTable("importers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const producers = pgTable("producers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const orders = pgTable("orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  pedido: text("pedido").notNull().unique(),
  data: date("data").notNull(),
  exporterId: varchar("exporter_id").references(() => exporters.id).notNull(),
  referenciaExportador: text("referencia_exportador"),
  importerId: varchar("importer_id").references(() => importers.id).notNull(),
  referenciaImportador: text("referencia_importador"),
  quantidade: decimal("quantidade", { precision: 10, scale: 2 }).notNull(),
  itens: text("itens"),
  precoGuia: decimal("preco_guia", { precision: 10, scale: 2 }),
  totalGuia: decimal("total_guia", { precision: 10, scale: 2 }),
  producerId: varchar("producer_id").references(() => producers.id),
  clientId: varchar("client_id").references(() => clients.id).notNull(),
  etiqueta: text("etiqueta"),
  portoEmbarque: text("porto_embarque"),
  portoDestino: text("porto_destino"),
  condicao: text("condicao"),
  embarque: date("embarque"),
  previsao: date("previsao"),
  chegada: date("chegada"),
  observacao: text("observacao"),
  situacao: text("situacao").notNull().default("pendiente"),
  semana: text("semana"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertClientSchema = createInsertSchema(clients).omit({
  id: true,
  createdAt: true,
});

export const insertExporterSchema = createInsertSchema(exporters).omit({
  id: true,
  createdAt: true,
});

export const insertImporterSchema = createInsertSchema(importers).omit({
  id: true,
  createdAt: true,
});

export const insertProducerSchema = createInsertSchema(producers).omit({
  id: true,
  createdAt: true,
});

const stringTransform = z.preprocess((val) => {
  if (val === null || val === undefined) return "";
  if (typeof val === 'number') {
    // Check if it's a date serial number from Excel
    if (val > 40000 && val < 50000) {
      // Convert Excel date serial to JavaScript date
      const date = new Date((val - 25569) * 86400 * 1000);
      return date.toISOString().split('T')[0];
    }
    return val.toString();
  }
  return String(val);
}, z.string());

const optionalStringTransform = z.preprocess((val) => {
  if (val === null || val === undefined || val === "") return undefined;
  if (typeof val === 'number') {
    // Check if it's a date serial number from Excel
    if (val > 40000 && val < 50000) {
      // Convert Excel date serial to JavaScript date
      const date = new Date((val - 25569) * 86400 * 1000);
      return date.toISOString().split('T')[0];
    }
    return val.toString();
  }
  const stringVal = String(val);
  return stringVal === "" ? undefined : stringVal;
}, z.string().optional());

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  exporterId: true,
  importerId: true,
  clientId: true,
  producerId: true,
}).extend({
  exporterName: z.string(),
  importerName: z.string(),
  clientName: z.string(),
  producerName: z.string().optional(),
  // Override numeric and date fields to accept any type and transform to strings
  data: stringTransform,
  quantidade: stringTransform,
  precoGuia: optionalStringTransform,
  totalGuia: optionalStringTransform,
  embarque: optionalStringTransform,
  previsao: optionalStringTransform,
  chegada: optionalStringTransform,
  dataEmissaoPedido: optionalStringTransform,
});


export type Client = typeof clients.$inferSelect;
export type Exporter = typeof exporters.$inferSelect;
export type Importer = typeof importers.$inferSelect;
export type Producer = typeof producers.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type InsertClient = z.infer<typeof insertClientSchema>;
export type InsertExporter = z.infer<typeof insertExporterSchema>;
export type InsertImporter = z.infer<typeof insertImporterSchema>;
export type InsertProducer = z.infer<typeof insertProducerSchema>;
export type InsertOrder = z.infer<typeof insertOrderSchema>;

export type OrderWithRelations = Order & {
  exporter: Exporter;
  importer: Importer;
  client: Client;
  producer?: Producer;
};

// Company Users Management System
export const companyUsers = pgTable("company_users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").notNull().unique(),
  name: varchar("name").notNull(),
  position: varchar("position").notNull(), // cargo/posição
  role: varchar("role").notNull().default("visualizador"), // gerente, administrador, visualizador
  isActive: boolean("is_active").default(true),
  permissions: jsonb("permissions").default({}), // specific permissions object
  lastLogin: timestamp("last_login"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Zod schemas for company users
export const insertCompanyUserSchema = createInsertSchema(companyUsers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastLogin: true,
  isActive: true,
});

// Types
export type CompanyUser = typeof companyUsers.$inferSelect;
export type InsertCompanyUser = z.infer<typeof insertCompanyUserSchema>;

// User Roles enum for reference (3 levels only)
export const USER_ROLES = {
  GERENTE: 'gerente',      // Full access - can do everything
  ADMINISTRADOR: 'administrador',  // Limited editing - can edit but not delete
  VISUALIZADOR: 'visualizador'     // Read only - can only view
} as const;

// Permission structure for different areas
export const PERMISSIONS = {
  ORDERS: {
    VIEW: 'orders:view',
    CREATE: 'orders:create',
    EDIT: 'orders:edit',
    DELETE: 'orders:delete',
    EXPORT: 'orders:export'
  },
  USERS: {
    VIEW: 'users:view',
    CREATE: 'users:create',
    EDIT: 'users:edit',
    DELETE: 'users:delete',
    MANAGE_PERMISSIONS: 'users:manage_permissions'
  },
  REPORTS: {
    VIEW: 'reports:view',
    EXPORT: 'reports:export'
  },
  SETTINGS: {
    VIEW: 'settings:view',
    EDIT: 'settings:edit'
  }
} as const;
