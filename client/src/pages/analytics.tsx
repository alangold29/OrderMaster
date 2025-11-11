import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, DollarSign, Package, TrendingUp, AlertTriangle, Clock } from "lucide-react";

interface OrderStats {
  total: number;
  pendiente: number;
  transito: number;
  entregado: number;
  currencyTotals?: {
    BRL?: number;
    USD?: number;
    EUR?: number;
  };
}

interface FinancialStats {
  totalValue: number;
  pendingValue: number;
  paidValue: number;
  averageOrderValue: number;
}

interface RecentOrders {
  id: string;
  pedido: string;
  data: string;
  clientName: string;
  totalGuia: string;
  situacao: string;
  embarque?: string;
}

export default function Analytics() {
  const { data: orderStats } = useQuery<OrderStats>({
    queryKey: ["/api/stats"],
    queryFn: async () => {
      const { storage } = await import('@/lib/storage');
      return storage.getOrderStats();
    },
  });

  const { data: financialStats } = useQuery<FinancialStats>({
    queryKey: ["/api/stats/financial"],
    queryFn: async () => {
      const { storage } = await import('@/lib/storage');
      return storage.getFinancialStats();
    },
  });

  const { data: recentOrders } = useQuery<RecentOrders[]>({
    queryKey: ["/api/analytics/recent-orders"],
    queryFn: async () => {
      const { storage } = await import('@/lib/storage');
      return storage.getRecentOrders();
    },
  });

  const { data: upcomingShipments } = useQuery<RecentOrders[]>({
    queryKey: ["/api/analytics/upcoming-shipments"],
    queryFn: async () => {
      const { storage } = await import('@/lib/storage');
      return storage.getUpcomingShipments();
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Analítico</h1>
        <p className="text-muted-foreground">
          Visão geral dos indicadores principais do negócio
        </p>
      </div>

      {/* Estatísticas Principais */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Pedidos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orderStats?.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              {orderStats?.pendiente || 0} pendientes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Trânsito</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orderStats?.transito || 0}</div>
            <p className="text-xs text-muted-foreground">
              {orderStats?.entregado || 0} entregados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Totales por Moneda</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {orderStats?.currencyTotals?.BRL !== undefined && orderStats.currencyTotals.BRL > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">BRL:</span>
                  <span className="text-lg font-bold">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(orderStats.currencyTotals.BRL)}
                  </span>
                </div>
              )}
              {orderStats?.currencyTotals?.USD !== undefined && orderStats.currencyTotals.USD > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">USD:</span>
                  <span className="text-lg font-bold">
                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(orderStats.currencyTotals.USD)}
                  </span>
                </div>
              )}
              {orderStats?.currencyTotals?.EUR !== undefined && orderStats.currencyTotals.EUR > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">EUR:</span>
                  <span className="text-lg font-bold">
                    {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(orderStats.currencyTotals.EUR)}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Pendente</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {financialStats?.pendingValue?.toLocaleString('pt-BR') || '0'}
            </div>
            <p className="text-xs text-muted-foreground">
              Quitado: R$ {financialStats?.paidValue?.toLocaleString('pt-BR') || '0'}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Pedidos Recentes */}
        <Card>
          <CardHeader>
            <CardTitle>Pedidos Recentes</CardTitle>
            <CardDescription>
              Últimos pedidos criados no sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentOrders?.slice(0, 5).map((order) => (
              <div key={order.id} className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium">{order.pedido}</p>
                  <p className="text-xs text-muted-foreground">
                    {order.clientName} • {new Date(order.data).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div className="text-right space-y-1">
                  <p className="text-sm font-medium">
                    R$ {parseFloat(order.totalGuia || '0').toLocaleString('pt-BR')}
                  </p>
                  <Badge
                    variant={
                      order.situacao === 'entregado' ? 'default' :
                      order.situacao === 'transito' ? 'secondary' : 'outline'
                    }
                    className="text-xs"
                  >
                    {order.situacao}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Embarques Próximos */}
        <Card>
          <CardHeader>
            <CardTitle>Embarques Próximos</CardTitle>
            <CardDescription>
              Pedidos com embarque programado nos próximos 30 dias
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingShipments?.slice(0, 5).map((order) => (
              <div key={order.id} className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium">{order.pedido}</p>
                  <p className="text-xs text-muted-foreground">
                    {order.clientName}
                  </p>
                </div>
                <div className="text-right space-y-1">
                  <div className="flex items-center text-xs text-muted-foreground">
                    <CalendarDays className="h-3 w-3 mr-1" />
                    {order.embarque ? new Date(order.embarque).toLocaleDateString('pt-BR') : 'Não definido'}
                  </div>
                  <Badge variant="outline" className="text-xs">
                    <Clock className="h-3 w-3 mr-1" />
                    {order.situacao}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Distribuição por Status */}
      <Card>
        <CardHeader>
          <CardTitle>Distribuição por Status</CardTitle>
          <CardDescription>
            Proporção de pedidos por situação atual
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{orderStats?.pendiente || 0}</div>
              <div className="text-sm text-blue-600">Pendiente</div>
              <div className="text-xs text-muted-foreground">
                {orderStats?.total ? Math.round((orderStats.pendiente / orderStats.total) * 100) : 0}%
              </div>
            </div>

            <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{orderStats?.transito || 0}</div>
              <div className="text-sm text-yellow-600">En Tránsito</div>
              <div className="text-xs text-muted-foreground">
                {orderStats?.total ? Math.round((orderStats.transito / orderStats.total) * 100) : 0}%
              </div>
            </div>

            <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{orderStats?.entregado || 0}</div>
              <div className="text-sm text-green-600">Entregado</div>
              <div className="text-xs text-muted-foreground">
                {orderStats?.total ? Math.round((orderStats.entregado / orderStats.total) * 100) : 0}%
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}