import { supabase } from './supabase-client';
import type {
  Order,
  Client,
  Exporter,
  Importer,
  Producer,
  CompanyUser,
  OrderWithRelations,
} from "@shared/schema";

export interface IStorage {
  getOrders(params: any): Promise<any>;
  getOrderById(id: string): Promise<any>;
  createOrder(data: any): Promise<any>;
  createManualOrder(data: any): Promise<any>;
  updateOrder(id: string, data: any): Promise<any>;
  deleteOrder(id: string): Promise<void>;
  getClients(): Promise<Client[]>;
  getExporters(): Promise<Exporter[]>;
  getImporters(): Promise<Importer[]>;
  getProducers(): Promise<Producer[]>;
  getOrderStats(): Promise<any>;
  getFinancialStats(): Promise<any>;
  getRecentOrders(): Promise<any[]>;
  getUpcomingShipments(): Promise<any[]>;
  getCompanyUsers(): Promise<CompanyUser[]>;
  getCompanyUser(id: string): Promise<CompanyUser | null>;
  createCompanyUser(data: any): Promise<CompanyUser>;
  updateCompanyUser(id: string, data: any): Promise<CompanyUser>;
  deleteCompanyUser(id: string): Promise<void>;
  updateUserPermissions(id: string, permissions: any): Promise<CompanyUser>;
  updateUserRole(id: string, role: string): Promise<CompanyUser>;
  toggleUserActive(id: string): Promise<CompanyUser>;
  getFinancialSummary(): Promise<any>;
  getAccountsReceivable(): Promise<any[]>;
  getClientFinancials(clientId: string): Promise<any>;
}

async function getOrCreateEntity(
  table: string,
  name: string
): Promise<string> {
  if (!name || name.trim() === '') {
    throw new Error(`${table} name is required`);
  }

  const { data: existing, error: selectError } = await supabase
    .from(table)
    .select('id')
    .eq('name', name)
    .maybeSingle();

  if (selectError) throw selectError;
  if (existing) return existing.id;

  const { data: created, error: insertError } = await supabase
    .from(table)
    .insert({ name })
    .select('id')
    .single();

  if (insertError) throw insertError;
  return created.id;
}

class Storage implements IStorage {
  async getOrders(params: any) {
    let query = supabase
      .from('orders')
      .select(`
        *,
        exporter:exporters!orders_exporter_id_fkey(id, name),
        importer:importers!orders_importer_id_fkey(id, name),
        client:clients!orders_client_id_fkey(id, name),
        producer:producers!orders_producer_id_fkey(id, name)
      `);

    if (params.search) {
      query = query.or(`pedido.ilike.%${params.search}%,itens.ilike.%${params.search}%`);
    }

    if (params.clientId) {
      query = query.eq('client_id', params.clientId);
    }

    if (params.exporterId) {
      query = query.eq('exporter_id', params.exporterId);
    }

    if (params.situacao) {
      query = query.eq('situacao', params.situacao);
    }

    const page = params.page || 1;
    const limit = params.limit || 10;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true });

    if (error) throw error;

    const { data: orders, error: ordersError } = await query
      .order(params.sortBy || 'created_at', { ascending: params.sortOrder === 'asc' })
      .range(from, to);

    if (ordersError) throw ordersError;

    return {
      data: orders,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    };
  }

  async getOrderById(id: string) {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        exporter:exporters!orders_exporter_id_fkey(id, name),
        importer:importers!orders_importer_id_fkey(id, name),
        client:clients!orders_client_id_fkey(id, name),
        producer:producers!orders_producer_id_fkey(id, name)
      `)
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async createOrder(orderData: any) {
    const clientId = await getOrCreateEntity('clients', orderData.clientName);
    const exporterId = await getOrCreateEntity('exporters', orderData.exporterName);
    const importerId = await getOrCreateEntity('importers', orderData.importerName);
    const producerId = orderData.producerName
      ? await getOrCreateEntity('producers', orderData.producerName)
      : null;

    const { data, error } = await supabase
      .from('orders')
      .insert({
        pedido: orderData.pedido,
        data: orderData.data,
        exporter_id: exporterId,
        referencia_exportador: orderData.referenciaExportador,
        importer_id: importerId,
        referencia_importador: orderData.referenciaImportador,
        quantidade: orderData.quantidade,
        itens: orderData.itens,
        preco_guia: orderData.precoGuia,
        total_guia: orderData.totalGuia,
        producer_id: producerId,
        client_id: clientId,
        etiqueta: orderData.etiqueta,
        porto_embarque: orderData.portoEmbarque,
        porto_destino: orderData.portoDestino,
        condicao: orderData.condicao,
        embarque: orderData.embarque,
        previsao: orderData.previsao,
        chegada: orderData.chegada,
        observacao: orderData.observacao,
        situacao: orderData.situacao || 'pendente',
        semana: orderData.semana,
        cliente_rede: orderData.clienteRede,
        representante: orderData.representante,
        produto: orderData.produto,
        data_emissao_pedido: orderData.dataEmissaoPedido,
        cliente_final: orderData.clienteFinal,
        data_embarque_de: orderData.dataEmbarqueDe,
        grupo: orderData.grupo,
        pais_exportador: orderData.paisExportador,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async createManualOrder(orderData: any) {
    return this.createOrder({
      ...orderData,
      pedido: orderData.pedido || `ORD-${Date.now()}`,
      data: orderData.dataEmissaoPedido,
      quantidade: '0',
      clientName: 'Cliente General',
    });
  }

  async updateOrder(id: string, data: any) {
    const { data: updated, error } = await supabase
      .from('orders')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return updated;
  }

  async deleteOrder(id: string) {
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async getClients() {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('name');

    if (error) throw error;
    return data || [];
  }

  async getExporters() {
    const { data, error } = await supabase
      .from('exporters')
      .select('*')
      .order('name');

    if (error) throw error;
    return data || [];
  }

  async getImporters() {
    const { data, error } = await supabase
      .from('importers')
      .select('*')
      .order('name');

    if (error) throw error;
    return data || [];
  }

  async getProducers() {
    const { data, error } = await supabase
      .from('producers')
      .select('*')
      .order('name');

    if (error) throw error;
    return data || [];
  }

  async getOrderStats() {
    const { count: total } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true });

    const { count: pendentes } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('situacao', 'pendente');

    const { count: embarcados } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('situacao', 'embarcado');

    return {
      total: total || 0,
      pendentes: pendentes || 0,
      embarcados: embarcados || 0,
      completos: 0,
    };
  }

  async getFinancialStats() {
    return {
      totalReceivable: 0,
      totalPaid: 0,
      pendingPayment: 0,
      overdueAmount: 0,
    };
  }

  async getRecentOrders() {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        client:clients!orders_client_id_fkey(name)
      `)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) throw error;
    return data || [];
  }

  async getUpcomingShipments() {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        client:clients!orders_client_id_fkey(name)
      `)
      .not('embarque', 'is', null)
      .order('embarque', { ascending: true })
      .limit(10);

    if (error) throw error;
    return data || [];
  }

  async getCompanyUsers() {
    const { data, error } = await supabase
      .from('company_users')
      .select('*')
      .order('name');

    if (error) throw error;
    return data || [];
  }

  async getCompanyUser(id: string) {
    const { data, error } = await supabase
      .from('company_users')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async createCompanyUser(userData: any) {
    const { data, error } = await supabase
      .from('company_users')
      .insert(userData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateCompanyUser(id: string, userData: any) {
    const { data, error } = await supabase
      .from('company_users')
      .update(userData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteCompanyUser(id: string) {
    const { error } = await supabase
      .from('company_users')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async updateUserPermissions(id: string, permissions: any) {
    const { data, error } = await supabase
      .from('company_users')
      .update({ permissions })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateUserRole(id: string, role: string) {
    const { data, error } = await supabase
      .from('company_users')
      .update({ role })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async toggleUserActive(id: string) {
    const user = await this.getCompanyUser(id);
    if (!user) throw new Error('User not found');

    const { data, error } = await supabase
      .from('company_users')
      .update({ is_active: !user.is_active })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getFinancialSummary() {
    return {
      totalReceivable: 0,
      totalPaid: 0,
      pendingPayment: 0,
      overdueAmount: 0,
    };
  }

  async getAccountsReceivable() {
    return [];
  }

  async getClientFinancials(clientId: string) {
    return {
      clientId,
      totalOrders: 0,
      totalValue: 0,
      paidAmount: 0,
      pendingAmount: 0,
    };
  }
}

export const storage = new Storage();
