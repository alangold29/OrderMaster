import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { eq, like, and, or, desc, asc, count, sum, isNotNull, gte } from "drizzle-orm";
import {
  orders,
  clients,
  exporters,
  importers,
  producers,
  type Order,
  type Client,
  type Exporter,
  type Importer,
  type Producer,
  type InsertOrder,
  type InsertClient,
  type InsertExporter,
  type InsertImporter,
  type InsertProducer,
  type OrderWithRelations,
  type ManualOrder,
} from "@shared/schema";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

export interface IStorage {
  // Orders
  getOrders(params: {
    page?: number;
    limit?: number;
    search?: string;
    clientId?: string;
    exporterId?: string;
    importerId?: string;
    producerId?: string;
    situacao?: string;
    clienteRede?: string;
    representante?: string;
    produto?: string;
    referenciaExportador?: string;
    referenciaImportador?: string;
    clienteFinal?: string;
    grupo?: string;
    paisExportador?: string;
    dataEmissaoInicio?: string;
    dataEmissaoFim?: string;
    dataEmbarqueInicio?: string;
    dataEmbarqueFim?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ orders: OrderWithRelations[]; total: number }>;
  getOrderById(id: string): Promise<OrderWithRelations | undefined>;
  createOrder(order: InsertOrder): Promise<OrderWithRelations>;
  createManualOrder(order: ManualOrder): Promise<OrderWithRelations>;
  updateOrder(id: string, order: Partial<InsertOrder>): Promise<OrderWithRelations>;
  deleteOrder(id: string): Promise<void>;
  
  // Clients
  getClients(): Promise<Client[]>;
  getClientByName(name: string): Promise<Client | undefined>;
  createClient(client: InsertClient): Promise<Client>;
  
  // Exporters
  getExporters(): Promise<Exporter[]>;
  getExporterByName(name: string): Promise<Exporter | undefined>;
  createExporter(exporter: InsertExporter): Promise<Exporter>;
  
  // Importers
  getImporters(): Promise<Importer[]>;
  getImporterByName(name: string): Promise<Importer | undefined>;
  createImporter(importer: InsertImporter): Promise<Importer>;
  
  // Producers
  getProducers(): Promise<Producer[]>;
  getProducerByName(name: string): Promise<Producer | undefined>;
  createProducer(producer: InsertProducer): Promise<Producer>;
  
  // Statistics
  getOrderStats(): Promise<{
    total: number;
    pendente: number;
    emTransito: number;
    entregue: number;
    quitado: number;
  }>;
  
  getFinancialStats(): Promise<{
    totalValue: number;
    pendingValue: number;
    paidValue: number;
    averageOrderValue: number;
  }>;
  
  getRecentOrders(): Promise<any[]>;
  getUpcomingShipments(): Promise<any[]>;
}

export class DatabaseStorage implements IStorage {
  async getOrders(params: {
    page?: number;
    limit?: number;
    search?: string;
    clientId?: string;
    exporterId?: string;
    importerId?: string;
    producerId?: string;
    situacao?: string;
    clienteRede?: string;
    representante?: string;
    produto?: string;
    referenciaExportador?: string;
    referenciaImportador?: string;
    clienteFinal?: string;
    grupo?: string;
    paisExportador?: string;
    dataEmissaoInicio?: string;
    dataEmissaoFim?: string;
    dataEmbarqueInicio?: string;
    dataEmbarqueFim?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}) {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const offset = (page - 1) * limit;
    
    let whereConditions = [];
    
    if (params.search) {
      whereConditions.push(
        or(
          like(orders.pedido, `%${params.search}%`),
          like(orders.itens, `%${params.search}%`),
          like(orders.produto, `%${params.search}%`),
          like(orders.referenciaExportador, `%${params.search}%`),
          like(orders.referenciaImportador, `%${params.search}%`),
          like(orders.clienteRede, `%${params.search}%`),
          like(orders.representante, `%${params.search}%`),
          like(orders.clienteFinal, `%${params.search}%`)
        )
      );
    }
    
    if (params.clientId) {
      whereConditions.push(eq(orders.clientId, params.clientId));
    }
    
    if (params.exporterId) {
      whereConditions.push(eq(orders.exporterId, params.exporterId));
    }
    
    if (params.importerId) {
      whereConditions.push(eq(orders.importerId, params.importerId));
    }
    
    if (params.producerId) {
      whereConditions.push(eq(orders.producerId, params.producerId));
    }
    
    if (params.situacao) {
      whereConditions.push(eq(orders.situacao, params.situacao));
    }

    if (params.clienteRede) {
      whereConditions.push(like(orders.clienteRede, `%${params.clienteRede}%`));
    }

    if (params.representante) {
      whereConditions.push(like(orders.representante, `%${params.representante}%`));
    }

    if (params.produto) {
      whereConditions.push(like(orders.produto, `%${params.produto}%`));
    }

    if (params.referenciaExportador) {
      whereConditions.push(like(orders.referenciaExportador, `%${params.referenciaExportador}%`));
    }

    if (params.referenciaImportador) {
      whereConditions.push(like(orders.referenciaImportador, `%${params.referenciaImportador}%`));
    }

    if (params.clienteFinal) {
      whereConditions.push(like(orders.clienteFinal, `%${params.clienteFinal}%`));
    }

    if (params.grupo) {
      whereConditions.push(like(orders.grupo, `%${params.grupo}%`));
    }

    if (params.paisExportador) {
      whereConditions.push(like(orders.paisExportador, `%${params.paisExportador}%`));
    }

    if (params.dataEmissaoInicio && params.dataEmissaoFim) {
      whereConditions.push(
        and(
          gte(orders.dataEmissaoPedido, params.dataEmissaoInicio),
          gte(params.dataEmissaoFim, orders.dataEmissaoPedido)
        )
      );
    }

    if (params.dataEmbarqueInicio && params.dataEmbarqueFim) {
      whereConditions.push(
        and(
          gte(orders.dataEmbarqueDe, params.dataEmbarqueInicio),
          gte(params.dataEmbarqueFim, orders.dataEmbarqueDe)
        )
      );
    }
    
    const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;
    
    const sortBy = params.sortBy || 'data';
    const sortOrder = params.sortOrder || 'desc';
    
    let sortColumn;
    switch (sortBy) {
      case 'pedido':
        sortColumn = orders.pedido;
        break;
      case 'dataEmissaoPedido':
        sortColumn = orders.dataEmissaoPedido;
        break;
      case 'dataEmbarqueDe':
        sortColumn = orders.dataEmbarqueDe;
        break;
      default:
        sortColumn = orders.data;
    }
    
    const orderBy = sortOrder === 'asc' ? asc(sortColumn) : desc(sortColumn);
    
    const [ordersResult, totalResult] = await Promise.all([
      db.select({
        order: orders,
        exporter: exporters,
        importer: importers,
        client: clients,
        producer: producers,
      })
      .from(orders)
      .leftJoin(exporters, eq(orders.exporterId, exporters.id))
      .leftJoin(importers, eq(orders.importerId, importers.id))
      .leftJoin(clients, eq(orders.clientId, clients.id))
      .leftJoin(producers, eq(orders.producerId, producers.id))
      .where(whereClause)
      .orderBy(orderBy)
      .limit(params.limit)
      .offset(offset),
      
      db.select({ count: count() })
      .from(orders)
      .where(whereClause)
    ]);
    
    const ordersWithRelations: OrderWithRelations[] = ordersResult.map(row => ({
      ...row.order,
      exporter: row.exporter!,
      importer: row.importer!,
      client: row.client!,
      producer: row.producer || undefined,
    }));
    
    return {
      orders: ordersWithRelations,
      total: totalResult[0].count,
    };
  }

  async getOrderById(id: string): Promise<OrderWithRelations | undefined> {
    const result = await db.select({
      order: orders,
      exporter: exporters,
      importer: importers,
      client: clients,
      producer: producers,
    })
    .from(orders)
    .leftJoin(exporters, eq(orders.exporterId, exporters.id))
    .leftJoin(importers, eq(orders.importerId, importers.id))
    .leftJoin(clients, eq(orders.clientId, clients.id))
    .leftJoin(producers, eq(orders.producerId, producers.id))
    .where(eq(orders.id, id))
    .limit(1);
    
    if (result.length === 0) return undefined;
    
    const row = result[0];
    return {
      ...row.order,
      exporter: row.exporter!,
      importer: row.importer!,
      client: row.client!,
      producer: row.producer || undefined,
    };
  }

  async createOrder(orderData: InsertOrder): Promise<OrderWithRelations> {
    // Get or create related entities
    const [exporter, importer, client, producer] = await Promise.all([
      this.getOrCreateExporter(orderData.exporterName),
      this.getOrCreateImporter(orderData.importerName),
      this.getOrCreateClient(orderData.clientName),
      orderData.producerName ? this.getOrCreateProducer(orderData.producerName) : Promise.resolve(undefined),
    ]);
    
    const insertData = {
      ...orderData,
      exporterId: exporter.id,
      importerId: importer.id,
      clientId: client.id,
      producerId: producer?.id,
      // Convert empty strings to undefined for optional date and numeric fields
      embarque: orderData.embarque && orderData.embarque.trim() !== "" ? orderData.embarque : undefined,
      previsao: orderData.previsao && orderData.previsao.trim() !== "" ? orderData.previsao : undefined,
      chegada: orderData.chegada && orderData.chegada.trim() !== "" ? orderData.chegada : undefined,
      precoGuia: orderData.precoGuia && orderData.precoGuia.trim() !== "" ? orderData.precoGuia : undefined,
      totalGuia: orderData.totalGuia && orderData.totalGuia.trim() !== "" ? orderData.totalGuia : undefined,
    };
    
    // Remove name fields before insert
    delete (insertData as any).exporterName;
    delete (insertData as any).importerName;
    delete (insertData as any).clientName;
    delete (insertData as any).producerName;
    
    const [newOrder] = await db.insert(orders).values(insertData).returning();
    
    return {
      ...newOrder,
      exporter,
      importer,
      client,
      producer,
    };
  }

  async createManualOrder(orderData: ManualOrder): Promise<OrderWithRelations> {
    // Get or create related entities
    const [exporter, importer] = await Promise.all([
      this.getOrCreateExporter(orderData.exporterName),
      this.getOrCreateImporter(orderData.importerName),
    ]);

    // Create a client based on clienteRede if provided, otherwise use a generic client
    const clientName = orderData.clienteRede || "Cliente Genérico";
    const client = await this.getOrCreateClient(clientName);
    
    const insertData = {
      pedido: orderData.pedido,
      data: orderData.dataEmissaoPedido,
      exporterId: exporter.id,
      importerId: importer.id,
      clientId: client.id,
      referenciaExportador: orderData.referenciaExportador,
      referenciaImportador: orderData.referenciaImportador,
      situacao: orderData.situacao || "pendente",
      clienteRede: orderData.clienteRede,
      representante: orderData.representante,
      produto: orderData.produto,
      dataEmissaoPedido: orderData.dataEmissaoPedido,
      clienteFinal: orderData.clienteFinal,
      dataEmbarqueDe: orderData.dataEmbarqueDe,
      grupo: orderData.grupo,
      paisExportador: orderData.paisExportador,
      // Required fields with default values for manual orders
      quantidade: "1",
      itens: orderData.produto,
    };
    
    const [newOrder] = await db.insert(orders).values(insertData).returning();
    
    return {
      ...newOrder,
      exporter,
      importer,
      client,
      producer: undefined,
    };
  }

  async updateOrder(id: string, orderData: Partial<InsertOrder>): Promise<OrderWithRelations> {
    const updateData = { ...orderData };
    
    // Handle related entities if names are provided
    if (orderData.exporterName) {
      const exporter = await this.getOrCreateExporter(orderData.exporterName);
      (updateData as any).exporterId = exporter.id;
      delete (updateData as any).exporterName;
    }
    
    if (orderData.importerName) {
      const importer = await this.getOrCreateImporter(orderData.importerName);
      (updateData as any).importerId = importer.id;
      delete (updateData as any).importerName;
    }
    
    if (orderData.clientName) {
      const client = await this.getOrCreateClient(orderData.clientName);
      (updateData as any).clientId = client.id;
      delete (updateData as any).clientName;
    }
    
    if (orderData.producerName) {
      const producer = await this.getOrCreateProducer(orderData.producerName);
      (updateData as any).producerId = producer.id;
      delete (updateData as any).producerName;
    }
    
    (updateData as any).updatedAt = new Date();
    
    await db.update(orders).set(updateData).where(eq(orders.id, id));
    
    return this.getOrderById(id) as Promise<OrderWithRelations>;
  }

  async deleteOrder(id: string): Promise<void> {
    await db.delete(orders).where(eq(orders.id, id));
  }

  private async getOrCreateExporter(name: string): Promise<Exporter> {
    let exporter = await this.getExporterByName(name);
    if (!exporter) {
      exporter = await this.createExporter({ name });
    }
    return exporter;
  }

  private async getOrCreateImporter(name: string): Promise<Importer> {
    let importer = await this.getImporterByName(name);
    if (!importer) {
      importer = await this.createImporter({ name });
    }
    return importer;
  }

  private async getOrCreateClient(name: string): Promise<Client> {
    let client = await this.getClientByName(name);
    if (!client) {
      client = await this.createClient({ name });
    }
    return client;
  }

  private async getOrCreateProducer(name: string): Promise<Producer> {
    let producer = await this.getProducerByName(name);
    if (!producer) {
      producer = await this.createProducer({ name });
    }
    return producer;
  }

  async getClients(): Promise<Client[]> {
    return db.select().from(clients).orderBy(asc(clients.name));
  }

  async getClientByName(name: string): Promise<Client | undefined> {
    const result = await db.select().from(clients).where(eq(clients.name, name)).limit(1);
    return result[0];
  }

  async createClient(client: InsertClient): Promise<Client> {
    const [newClient] = await db.insert(clients).values(client).returning();
    return newClient;
  }

  async getExporters(): Promise<Exporter[]> {
    return db.select().from(exporters).orderBy(asc(exporters.name));
  }

  async getExporterByName(name: string): Promise<Exporter | undefined> {
    const result = await db.select().from(exporters).where(eq(exporters.name, name)).limit(1);
    return result[0];
  }

  async createExporter(exporter: InsertExporter): Promise<Exporter> {
    const [newExporter] = await db.insert(exporters).values(exporter).returning();
    return newExporter;
  }

  async getImporters(): Promise<Importer[]> {
    return db.select().from(importers).orderBy(asc(importers.name));
  }

  async getImporterByName(name: string): Promise<Importer | undefined> {
    const result = await db.select().from(importers).where(eq(importers.name, name)).limit(1);
    return result[0];
  }

  async createImporter(importer: InsertImporter): Promise<Importer> {
    const [newImporter] = await db.insert(importers).values(importer).returning();
    return newImporter;
  }

  async getProducers(): Promise<Producer[]> {
    return db.select().from(producers).orderBy(asc(producers.name));
  }

  async getProducerByName(name: string): Promise<Producer | undefined> {
    const result = await db.select().from(producers).where(eq(producers.name, name)).limit(1);
    return result[0];
  }

  async createProducer(producer: InsertProducer): Promise<Producer> {
    const [newProducer] = await db.insert(producers).values(producer).returning();
    return newProducer;
  }

  async getOrderStats() {
    const result = await db.select({
      situacao: orders.situacao,
      count: count(),
    })
    .from(orders)
    .groupBy(orders.situacao);
    
    const stats = {
      total: 0,
      pendente: 0,
      emTransito: 0,
      entregue: 0,
      quitado: 0,
    };
    
    result.forEach(row => {
      stats.total += row.count;
      switch (row.situacao) {
        case 'pendente':
          stats.pendente = row.count;
          break;
        case 'em-transito':
          stats.emTransito = row.count;
          break;
        case 'entregue':
          stats.entregue = row.count;
          break;
        case 'quitado':
          stats.quitado = row.count;
          break;
      }
    });
    
    return stats;
  }

  async getFinancialStats() {
    try {
      const result = await db.select({
        totalGuia: orders.totalGuia,
        situacao: orders.situacao,
      }).from(orders);

      let totalValue = 0;
      let pendingValue = 0;
      let paidValue = 0;

      for (const row of result) {
        const value = parseFloat(row.totalGuia || '0');
        totalValue += value;
        
        if (row.situacao === 'pendente' || row.situacao === 'em-transito') {
          pendingValue += value;
        } else if (row.situacao === 'quitado') {
          paidValue += value;
        }
      }

      const totalOrders = result.length;
      const averageOrderValue = totalOrders > 0 ? totalValue / totalOrders : 0;

      return {
        totalValue,
        pendingValue,
        paidValue,
        averageOrderValue,
      };
    } catch (error) {
      console.error('Error in getFinancialStats:', error);
      return {
        totalValue: 0,
        pendingValue: 0,
        paidValue: 0,
        averageOrderValue: 0,
      };
    }
  }

  async getRecentOrders() {
    const result = await db.select({
      id: orders.id,
      pedido: orders.pedido,
      data: orders.data,
      totalGuia: orders.totalGuia,
      situacao: orders.situacao,
      clientName: clients.name,
    })
    .from(orders)
    .leftJoin(clients, eq(orders.clientId, clients.id))
    .orderBy(desc(orders.createdAt))
    .limit(10);

    return result.map(row => ({
      ...row,
      clientName: row.clientName || 'Cliente não encontrado'
    }));
  }

  async getUpcomingShipments() {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const result = await db.select({
      id: orders.id,
      pedido: orders.pedido,
      embarque: orders.embarque,
      situacao: orders.situacao,
      clientName: clients.name,
    })
    .from(orders)
    .leftJoin(clients, eq(orders.clientId, clients.id))
    .where(
      and(
        isNotNull(orders.embarque),
        gte(orders.embarque, new Date().toISOString().split('T')[0])
      )
    )
    .orderBy(asc(orders.embarque))
    .limit(10);

    return result.map(row => ({
      ...row,
      clientName: row.clientName || 'Cliente não encontrado'
    }));
  }
}

export const storage = new DatabaseStorage();
