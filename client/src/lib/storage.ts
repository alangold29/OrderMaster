import { supabase } from './supabase';
import type {
  Order,
  Client,
  Exporter,
  Importer,
  Producer,
  CompanyUser,
} from "@shared/schema";

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

export const storage = {
  async getOrders(params: any) {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from('orders')
      .select(`
        *,
        exporter:exporters!orders_exporter_id_fkey(id, name),
        importer:importers!orders_importer_id_fkey(id, name),
        client:clients!orders_client_id_fkey(id, name),
        producer:producers!orders_producer_id_fkey(id, name)
      `, { count: 'exact' });

    if (params.search && params.search.trim()) {
      query = query.or(`pedido.ilike.%${params.search}%,itens.ilike.%${params.search}%`);
    }

    if (params.clientId && params.clientId.trim()) {
      query = query.eq('client_id', params.clientId);
    }

    if (params.exporterId && params.exporterId.trim()) {
      query = query.eq('exporter_id', params.exporterId);
    }

    if (params.importerId && params.importerId.trim()) {
      query = query.eq('importer_id', params.importerId);
    }

    if (params.producerId && params.producerId.trim()) {
      query = query.eq('producer_id', params.producerId);
    }

    if (params.situacao && params.situacao.trim()) {
      query = query.eq('situacao', params.situacao);
    }

    if (params.portoEmbarque && params.portoEmbarque.trim()) {
      query = query.ilike('porto_embarque', `%${params.portoEmbarque}%`);
    }

    if (params.portoDestino && params.portoDestino.trim()) {
      query = query.ilike('porto_destino', `%${params.portoDestino}%`);
    }

    if (params.referenciaExportador && params.referenciaExportador.trim()) {
      query = query.ilike('referencia_exportador', `%${params.referenciaExportador}%`);
    }

    if (params.referenciaImportador && params.referenciaImportador.trim()) {
      query = query.ilike('referencia_importador', `%${params.referenciaImportador}%`);
    }

    if (params.dataPedidoInicio && params.dataPedidoFim) {
      query = query.gte('data', params.dataPedidoInicio).lte('data', params.dataPedidoFim);
    }

    if (params.dataEmbarqueInicio && params.dataEmbarqueFim) {
      query = query.gte('embarque', params.dataEmbarqueInicio).lte('embarque', params.dataEmbarqueFim);
    }

    if (params.dataChegadaInicio && params.dataChegadaFim) {
      query = query.gte('chegada', params.dataChegadaInicio).lte('chegada', params.dataChegadaFim);
    }

    const { data: orders, error, count } = await query
      .order(params.sortBy || 'data', { ascending: params.sortOrder === 'asc' })
      .range(from, to);

    if (error) throw error;

    return {
      orders: orders || [],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    };
  },

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
  },

  async createOrder(orderData: any) {
    const { data: existingOrder } = await supabase
      .from('orders')
      .select('id, pedido')
      .eq('pedido', orderData.pedido)
      .maybeSingle();

    if (existingOrder) {
      throw new Error(`Pedido duplicado: já existe um pedido com o número ${orderData.pedido}`);
    }

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
        moeda: orderData.moeda || 'BRL',
        via_transporte: orderData.viaTransporte,
        incoterm: orderData.incoterm,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateOrder(id: string, orderData: any) {
    const { data: existingOrder } = await supabase
      .from('orders')
      .select('id, pedido')
      .eq('id', id)
      .maybeSingle();

    if (!existingOrder) {
      throw new Error('Pedido não encontrado');
    }

    if (orderData.pedido && orderData.pedido !== existingOrder.pedido) {
      const { data: duplicateOrder } = await supabase
        .from('orders')
        .select('id, pedido')
        .eq('pedido', orderData.pedido)
        .neq('id', id)
        .maybeSingle();

      if (duplicateOrder) {
        throw new Error(`Pedido duplicado: já existe um pedido com o número ${orderData.pedido}`);
      }
    }

    const clientId = orderData.clientName
      ? await getOrCreateEntity('clients', orderData.clientName)
      : undefined;
    const exporterId = orderData.exporterName
      ? await getOrCreateEntity('exporters', orderData.exporterName)
      : undefined;
    const importerId = orderData.importerName
      ? await getOrCreateEntity('importers', orderData.importerName)
      : undefined;
    const producerId = orderData.producerName
      ? await getOrCreateEntity('producers', orderData.producerName)
      : null;

    const updatePayload: any = {};

    if (orderData.pedido !== undefined) updatePayload.pedido = orderData.pedido;
    if (orderData.data !== undefined) updatePayload.data = orderData.data;
    if (exporterId !== undefined) updatePayload.exporter_id = exporterId;
    if (orderData.referenciaExportador !== undefined) updatePayload.referencia_exportador = orderData.referenciaExportador;
    if (importerId !== undefined) updatePayload.importer_id = importerId;
    if (orderData.referenciaImportador !== undefined) updatePayload.referencia_importador = orderData.referenciaImportador;
    if (orderData.quantidade !== undefined) updatePayload.quantidade = orderData.quantidade;
    if (orderData.itens !== undefined) updatePayload.itens = orderData.itens;
    if (orderData.precoGuia !== undefined) updatePayload.preco_guia = orderData.precoGuia;
    if (orderData.totalGuia !== undefined) updatePayload.total_guia = orderData.totalGuia;
    if (producerId !== undefined) updatePayload.producer_id = producerId;
    if (clientId !== undefined) updatePayload.client_id = clientId;
    if (orderData.etiqueta !== undefined) updatePayload.etiqueta = orderData.etiqueta;
    if (orderData.portoEmbarque !== undefined) updatePayload.porto_embarque = orderData.portoEmbarque;
    if (orderData.portoDestino !== undefined) updatePayload.porto_destino = orderData.portoDestino;
    if (orderData.condicao !== undefined) updatePayload.condicao = orderData.condicao;
    if (orderData.embarque !== undefined) updatePayload.embarque = orderData.embarque;
    if (orderData.previsao !== undefined) updatePayload.previsao = orderData.previsao;
    if (orderData.chegada !== undefined) updatePayload.chegada = orderData.chegada;
    if (orderData.observacao !== undefined) updatePayload.observacao = orderData.observacao;
    if (orderData.situacao !== undefined) updatePayload.situacao = orderData.situacao;
    if (orderData.semana !== undefined) updatePayload.semana = orderData.semana;
    if (orderData.moeda !== undefined) updatePayload.moeda = orderData.moeda;
    if (orderData.viaTransporte !== undefined) updatePayload.via_transporte = orderData.viaTransporte;
    if (orderData.incoterm !== undefined) updatePayload.incoterm = orderData.incoterm;

    updatePayload.updated_at = new Date().toISOString();

    const { data: updated, error } = await supabase
      .from('orders')
      .update(updatePayload)
      .eq('id', id)
      .select(`
        *,
        exporter:exporters!orders_exporter_id_fkey(id, name),
        importer:importers!orders_importer_id_fkey(id, name),
        client:clients!orders_client_id_fkey(id, name),
        producer:producers!orders_producer_id_fkey(id, name)
      `)
      .single();

    if (error) throw error;
    return updated;
  },

  async deleteOrder(id: string) {
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async getClients() {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('name');

    if (error) throw error;
    return data || [];
  },

  async getExporters() {
    const { data, error } = await supabase
      .from('exporters')
      .select('*')
      .order('name');

    if (error) throw error;
    return data || [];
  },

  async getImporters() {
    const { data, error } = await supabase
      .from('importers')
      .select('*')
      .order('name');

    if (error) throw error;
    return data || [];
  },

  async getProducers() {
    const { data, error } = await supabase
      .from('producers')
      .select('*')
      .order('name');

    if (error) throw error;
    return data || [];
  },

  async getOrderStats() {
    const { count: total, error: totalError } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true });

    if (totalError) {
      console.error('Error getting total stats:', totalError);
    }

    const { count: pendiente, error: pendienteError } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('situacao', 'pendiente');

    if (pendienteError) {
      console.error('Error getting pendiente stats:', pendienteError);
    }

    const { count: transito, error: transitoError } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('situacao', 'transito');

    if (transitoError) {
      console.error('Error getting transito stats:', transitoError);
    }

    const { count: entregado, error: entregadoError } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('situacao', 'entregado');

    if (entregadoError) {
      console.error('Error getting entregado stats:', entregadoError);
    }

    const { data: ordersData, error: ordersError } = await supabase
      .from('orders')
      .select('moeda, total_guia');

    if (ordersError) {
      console.error('Error getting orders for currency stats:', ordersError);
    }

    const currencyTotals = ordersData?.reduce((acc: any, order: any) => {
      const currency = order.moeda || 'BRL';
      const amount = parseFloat(order.total_guia || '0');
      if (!acc[currency]) {
        acc[currency] = 0;
      }
      acc[currency] += amount;
      return acc;
    }, {}) || {};

    return {
      total: total || 0,
      pendiente: pendiente || 0,
      transito: transito || 0,
      entregado: entregado || 0,
      currencyTotals,
    };
  },

  async getFinancialStats() {
    const { data: orders, error } = await supabase
      .from('orders')
      .select('total_guia, situacao');

    if (error) throw error;

    const stats = orders?.reduce((acc, order) => {
      const amount = parseFloat(order.total_guia || '0');
      acc.totalReceivable += amount;

      if (order.situacao === 'entregado') {
        acc.totalPaid += amount;
      } else if (order.situacao === 'pendiente') {
        acc.pendingPayment += amount;
      }

      return acc;
    }, { totalReceivable: 0, totalPaid: 0, pendingPayment: 0, overdueAmount: 0 }) || { totalReceivable: 0, totalPaid: 0, pendingPayment: 0, overdueAmount: 0 };

    return stats;
  },

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
  },

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
  },

  async getCompanyUsers() {
    const { data, error } = await supabase
      .from('company_users')
      .select('*')
      .order('name');

    if (error) throw error;
    return data || [];
  },

  async getCompanyUser(id: string) {
    const { data, error } = await supabase
      .from('company_users')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async createCompanyUser(userData: any) {
    const insertData = {
      email: userData.email,
      name: userData.name,
      position: userData.position,
      role: userData.role || 'viewer',
      is_active: userData.isActive ?? true,
      permissions: userData.permissions || {}
    };

    const { data, error } = await supabase
      .from('company_users')
      .insert(insertData)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateCompanyUser(id: string, userData: any) {
    const { data, error } = await supabase
      .from('company_users')
      .update(userData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteCompanyUser(id: string) {
    const { error } = await supabase
      .from('company_users')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async updateUserPermissions(id: string, permissions: any) {
    const { data, error } = await supabase
      .from('company_users')
      .update({ permissions })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateUserRole(id: string, role: string) {
    const { data, error } = await supabase
      .from('company_users')
      .update({ role })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async toggleUserActive(id: string) {
    const user = await storage.getCompanyUser(id);
    if (!user) throw new Error('User not found');

    const { data, error } = await supabase
      .from('company_users')
      .update({ is_active: !user.is_active })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getFinancialSummary() {
    const { data: orders, error } = await supabase
      .from('orders')
      .select('total_guia, situacao');

    if (error) throw error;

    const totalRevenue = orders?.reduce((sum, order) => sum + parseFloat(order.total_guia || '0'), 0) || 0;
    const totalOrders = orders?.length || 0;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    const byStatus = orders?.reduce((acc, order) => {
      const amount = parseFloat(order.total_guia || '0');
      if (order.situacao === 'pendente') acc.pendente += amount;
      else if (order.situacao === 'embarcado' || order.situacao === 'em_transito') acc.emTransito += amount;
      else if (order.situacao === 'entregue' || order.situacao === 'quitado') acc.entregue += amount;
      return acc;
    }, { pendente: 0, emTransito: 0, entregue: 0 }) || { pendente: 0, emTransito: 0, entregue: 0 };

    return {
      totalRevenue,
      totalOrders,
      averageOrderValue,
      byStatus,
    };
  },

  async getAccountsReceivable() {
    const { data: orders, error } = await supabase
      .from('orders')
      .select(`
        id,
        total_guia,
        situacao,
        client_id,
        client:clients!orders_client_id_fkey(id, name)
      `);

    if (error) throw error;

    const accountsMap = new Map<string, any>();

    orders?.forEach(order => {
      const clientId = order.client_id;
      const clientName = order.client?.name || 'Unknown';

      if (!accountsMap.has(clientId)) {
        accountsMap.set(clientId, {
          clientId,
          clientName,
          totalOrders: 0,
          totalAmount: 0,
          pendingOrders: 0,
          deliveredOrders: 0,
        });
      }

      const account = accountsMap.get(clientId);
      account.totalOrders++;
      account.totalAmount += parseFloat(order.total_guia || '0');

      if (order.situacao === 'pendente' || order.situacao === 'embarcado' || order.situacao === 'em_transito') {
        account.pendingOrders++;
      } else if (order.situacao === 'entregue' || order.situacao === 'quitado') {
        account.deliveredOrders++;
      }
    });

    return Array.from(accountsMap.values()).sort((a, b) => b.totalAmount - a.totalAmount);
  },

  async getClientFinancials(clientId: string) {
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('id, name')
      .eq('id', clientId)
      .maybeSingle();

    if (clientError) throw clientError;
    if (!client) throw new Error('Client not found');

    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select(`
        id,
        pedido,
        data,
        itens,
        total_guia,
        situacao
      `)
      .eq('client_id', clientId)
      .order('data', { ascending: false });

    if (ordersError) throw ordersError;

    const totalAmount = orders?.reduce((sum, order) => sum + parseFloat(order.total_guia || '0'), 0) || 0;
    const totalOrders = orders?.length || 0;

    return {
      client,
      orders: orders || [],
      totalAmount,
      totalOrders,
    };
  }
};
