import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { eq, like, and, or, desc, asc, count, sum, isNotNull, gte } from "drizzle-orm";
import {
  orders,
  clients,
  exporters,
  importers,
  producers,
  companyUsers,
  type Order,
  type Client,
  type Exporter,
  type Importer,
  type Producer,
  type CompanyUser,
  type InsertOrder,
  type InsertClient,
  type InsertExporter,
  type InsertImporter,
  type InsertProducer,
  type InsertCompanyUser,
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
    notify?: string;
    portoEmbarque?: string;
    portoDesembarque?: string;
    blCrtAwb?: string;
    dataDesembarque?: string;
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
  
  // Company Users
  getCompanyUsers(): Promise<CompanyUser[]>;
  getCompanyUser(id: string): Promise<CompanyUser | undefined>;
  createCompanyUser(user: InsertCompanyUser): Promise<CompanyUser>;
  updateCompanyUser(id: string, user: Partial<InsertCompanyUser>): Promise<CompanyUser>;
  deleteCompanyUser(id: string): Promise<void>;
  updateUserPermissions(id: string, permissions: Record<string, boolean>): Promise<CompanyUser>;
  updateUserRole(id: string, role: string): Promise<CompanyUser>;
  toggleUserActive(id: string): Promise<CompanyUser>;

  // Financial
  getFinancialSummary(): Promise<{
    totalRevenue: number;
    totalOrders: number;
    averageOrderValue: number;
    byStatus: {
      pendente: number;
      emTransito: number;
      entregue: number;
    };
  }>;
  getAccountsReceivable(): Promise<Array<{
    clientId: string;
    clientName: string;
    totalOrders: number;
    totalAmount: number;
    pendingOrders: number;
    deliveredOrders: number;
  }>>;
  getClientFinancials(clientId: string): Promise<{
    client: Client;
    orders: OrderWithRelations[];
    totalAmount: number;
    totalOrders: number;
  }>;
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
    notify?: string;
    portoEmbarque?: string;
    portoDesembarque?: string;
    blCrtAwb?: string;
    dataDesembarque?: string;
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
          lte(orders.dataEmbarqueDe, params.dataEmbarqueFim)
        )
      );
    }

    // Additional embarque specific filters
    if (params.notify) {
      whereConditions.push(like(orders.notify, `%${params.notify}%`));
    }

    if (params.portoEmbarque) {
      whereConditions.push(like(orders.portoEmbarque, `%${params.portoEmbarque}%`));
    }

    if (params.portoDesembarque) {
      whereConditions.push(like(orders.portoDestino, `%${params.portoDesembarque}%`));
    }

    if (params.blCrtAwb) {
      whereConditions.push(like(orders.blCrtAwb, `%${params.blCrtAwb}%`));
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

  // Company Users Management
  async getCompanyUsers(): Promise<CompanyUser[]> {
    return await db.select().from(companyUsers).orderBy(desc(companyUsers.createdAt));
  }

  async getCompanyUser(id: string): Promise<CompanyUser | undefined> {
    const result = await db.select().from(companyUsers).where(eq(companyUsers.id, id));
    return result[0];
  }

  async createCompanyUser(user: InsertCompanyUser): Promise<CompanyUser> {
    const result = await db.insert(companyUsers).values({
      ...user,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();
    return result[0];
  }

  async updateCompanyUser(id: string, userData: Partial<InsertCompanyUser>): Promise<CompanyUser> {
    const result = await db.update(companyUsers)
      .set({
        ...userData,
        updatedAt: new Date(),
      })
      .where(eq(companyUsers.id, id))
      .returning();
    return result[0];
  }

  async deleteCompanyUser(id: string): Promise<void> {
    await db.delete(companyUsers).where(eq(companyUsers.id, id));
  }

  async updateUserPermissions(id: string, permissions: Record<string, boolean>): Promise<CompanyUser> {
    const result = await db.update(companyUsers)
      .set({
        permissions,
        updatedAt: new Date(),
      })
      .where(eq(companyUsers.id, id))
      .returning();
    return result[0];
  }

  async updateUserRole(id: string, role: string): Promise<CompanyUser> {
    const result = await db.update(companyUsers)
      .set({
        role,
        updatedAt: new Date(),
      })
      .where(eq(companyUsers.id, id))
      .returning();
    return result[0];
  }

  async toggleUserActive(id: string): Promise<CompanyUser> {
    const currentUser = await this.getCompanyUser(id);
    if (!currentUser) throw new Error('User not found');
    
    const result = await db.update(companyUsers)
      .set({
        isActive: !currentUser.isActive,
        updatedAt: new Date(),
      })
      .where(eq(companyUsers.id, id))
      .returning();
    return result[0];
  }

  // Financial methods
  async getFinancialSummary() {
    const allOrders = await db.select().from(orders);
    
    const totalRevenue = allOrders.reduce((acc, order) => {
      const total = parseFloat(order.totalGuia?.toString() || '0');
      return acc + total;
    }, 0);

    const byStatus = {
      pendente: allOrders.reduce((acc, order) => {
        if (order.situacao === 'pendente') {
          return acc + parseFloat(order.totalGuia?.toString() || '0');
        }
        return acc;
      }, 0),
      emTransito: allOrders.reduce((acc, order) => {
        if (order.situacao === 'em trânsito' || order.situacao === 'em transito') {
          return acc + parseFloat(order.totalGuia?.toString() || '0');
        }
        return acc;
      }, 0),
      entregue: allOrders.reduce((acc, order) => {
        if (order.situacao === 'entregue') {
          return acc + parseFloat(order.totalGuia?.toString() || '0');
        }
        return acc;
      }, 0),
    };

    return {
      totalRevenue,
      totalOrders: allOrders.length,
      averageOrderValue: allOrders.length > 0 ? totalRevenue / allOrders.length : 0,
      byStatus,
    };
  }

  async getAccountsReceivable() {
    const allOrders = await db.select({
      orderId: orders.id,
      clientId: orders.clientId,
      clientName: clients.name,
      totalGuia: orders.totalGuia,
      situacao: orders.situacao,
    })
    .from(orders)
    .leftJoin(clients, eq(orders.clientId, clients.id))
    .orderBy(desc(clients.name));

    const clientMap = new Map<string, {
      clientId: string;
      clientName: string;
      totalOrders: number;
      totalAmount: number;
      pendingOrders: number;
      deliveredOrders: number;
    }>();

    allOrders.forEach(order => {
      const clientId = order.clientId || '';
      const clientName = order.clientName || 'Cliente desconocido';
      
      if (!clientMap.has(clientId)) {
        clientMap.set(clientId, {
          clientId,
          clientName,
          totalOrders: 0,
          totalAmount: 0,
          pendingOrders: 0,
          deliveredOrders: 0,
        });
      }

      const client = clientMap.get(clientId)!;
      client.totalOrders++;
      client.totalAmount += parseFloat(order.totalGuia?.toString() || '0');
      
      if (order.situacao === 'pendente') {
        client.pendingOrders++;
      } else if (order.situacao === 'entregue') {
        client.deliveredOrders++;
      }
    });

    return Array.from(clientMap.values()).sort((a, b) => b.totalAmount - a.totalAmount);
  }

  async getClientFinancials(clientId: string) {
    const client = await db.select().from(clients).where(eq(clients.id, clientId));
    
    if (!client.length) {
      throw new Error('Client not found');
    }

    const clientOrders = await db.select()
      .from(orders)
      .leftJoin(exporters, eq(orders.exporterId, exporters.id))
      .leftJoin(importers, eq(orders.importerId, importers.id))
      .leftJoin(clients, eq(orders.clientId, clients.id))
      .leftJoin(producers, eq(orders.producerId, producers.id))
      .where(eq(orders.clientId, clientId))
      .orderBy(desc(orders.data));

    const ordersWithRelations: OrderWithRelations[] = clientOrders.map(row => ({
      ...row.orders,
      exporter: row.exporters!,
      importer: row.importers!,
      client: row.clients!,
      producer: row.producers || undefined,
    }));

    const totalAmount = ordersWithRelations.reduce((acc, order) => {
      return acc + parseFloat(order.totalGuia?.toString() || '0');
    }, 0);

    return {
      client: client[0],
      orders: ordersWithRelations,
      totalAmount,
      totalOrders: ordersWithRelations.length,
    };
  }
}

export const storage = new DatabaseStorage();
