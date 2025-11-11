import { z } from "zod";

const stringTransform = z.preprocess((val) => {
  if (val === null || val === undefined) return "";
  if (typeof val === 'number') {
    if (val > 40000 && val < 50000) {
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
    if (val > 40000 && val < 50000) {
      const date = new Date((val - 25569) * 86400 * 1000);
      return date.toISOString().split('T')[0];
    }
    return val.toString();
  }
  const stringVal = String(val);
  return stringVal === "" ? undefined : stringVal;
}, z.string().optional());

export const insertClientSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
});

export const insertExporterSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
});

export const insertImporterSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
});

export const insertProducerSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
});

export const insertOrderSchema = z.object({
  pedido: z.string().min(1, "Pedido é obrigatório"),
  data: stringTransform,
  exporterName: z.string().min(1, "Exportador é obrigatório"),
  importerName: z.string().min(1, "Importador é obrigatório"),
  clientName: z.string().min(1, "Cliente é obrigatório"),
  producerName: z.string().optional(),
  referenciaExportador: z.string().optional(),
  referenciaImportador: z.string().optional(),
  quantidade: stringTransform,
  itens: z.string().optional(),
  precoGuia: optionalStringTransform,
  totalGuia: optionalStringTransform,
  etiqueta: z.string().optional(),
  portoEmbarque: z.string().optional(),
  portoDestino: z.string().optional(),
  condicao: z.string().optional(),
  embarque: optionalStringTransform,
  previsao: optionalStringTransform,
  chegada: optionalStringTransform,
  observacao: z.string().optional(),
  situacao: z.string().default("pendiente"),
  semana: z.string().optional(),
  moeda: z.enum(["BRL", "USD", "EUR"]).default("BRL"),
  viaTransporte: z.enum(["terrestre", "maritimo", "aereo"]).optional(),
  incoterm: z.enum(["CIF", "FOB", "FCA", "CFR"]).optional(),
});

export const updateOrderSchema = insertOrderSchema.partial();

export const insertCompanyUserSchema = z.object({
  email: z.string().email("Email inválido"),
  name: z.string().min(1, "Nome é obrigatório"),
  position: z.string().min(1, "Posição é obrigatória"),
  role: z.string().default("visualizador"),
  permissions: z.record(z.boolean()).default({}),
});

export type Client = {
  id: string;
  name: string;
  created_at?: Date;
};

export type Exporter = {
  id: string;
  name: string;
  created_at?: Date;
};

export type Importer = {
  id: string;
  name: string;
  created_at?: Date;
};

export type Producer = {
  id: string;
  name: string;
  created_at?: Date;
};

export type Order = {
  id: string;
  pedido: string;
  data: string;
  exporter_id: string;
  referencia_exportador?: string;
  importer_id: string;
  referencia_importador?: string;
  quantidade: string;
  itens?: string;
  preco_guia?: string;
  total_guia?: string;
  producer_id?: string;
  client_id: string;
  etiqueta?: string;
  porto_embarque?: string;
  porto_destino?: string;
  condicao?: string;
  embarque?: string;
  previsao?: string;
  chegada?: string;
  observacao?: string;
  situacao: string;
  semana?: string;
  moeda: string;
  via_transporte?: string;
  incoterm?: string;
  created_at?: Date;
  updated_at?: Date;
};

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

export type CompanyUser = {
  id: string;
  email: string;
  name: string;
  position: string;
  role: string;
  is_active: boolean;
  permissions: Record<string, boolean>;
  last_login?: Date;
  created_at?: Date;
  updated_at?: Date;
};

export type InsertCompanyUser = z.infer<typeof insertCompanyUserSchema>;

export const USER_ROLES = {
  GERENTE: 'gerente',
  ADMINISTRADOR: 'administrador',
  VISUALIZADOR: 'visualizador'
} as const;

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
