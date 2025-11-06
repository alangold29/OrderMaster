import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Package, TrendingUp, Clock } from "lucide-react";
import MultiCurrencyStats from "@/components/multi-currency-stats";

interface OrderStats {
  total: number;
  pendiente: number;
  transito: number;
  entregado: number;
}

interface CurrencyStats {
  totalReceivable: number;
  totalPaid: number;
  pendingPayment: number;
  overdueAmount: number;
}

type FinancialStats = Record<string, CurrencyStats>;

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
  });

  const { data: financialStats, isLoading: financialLoading } = useQuery<FinancialStats>({
    queryKey: ["/api/stats/financial"],
  });

  const { data: recentOrders } = useQuery<RecentOrders[]>({
    queryKey: ["/api/analytics/recent-orders"],
  });

  const { data: upcomingShipments } = useQuery<RecentOrders[]>({
    queryKey: ["/api/analytics/upcoming-shipments"],
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

      </div>

      {/* Multi-Currency Financial Stats */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Estadísticas Financieras por Moneda</h2>
        <MultiCurrencyStats stats={financialStats || {}} isLoading={financialLoading} />
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