import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DollarSign, TrendingUp, Package, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatCurrency } from "@/lib/utils";

interface FinancialSummary {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  byStatus: {
    pendente: number;
    emTransito: number;
    entregue: number;
  };
}

interface AccountReceivable {
  clientId: string;
  clientName: string;
  totalOrders: number;
  totalAmount: number;
  pendingOrders: number;
  deliveredOrders: number;
}

interface ClientFinancials {
  client: {
    id: string;
    name: string;
  };
  orders: any[];
  totalAmount: number;
  totalOrders: number;
}

export default function Contas() {
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);

  const { data: summary, isLoading: summaryLoading } = useQuery<FinancialSummary>({
    queryKey: ["/api/financial/summary"],
  });

  const { data: accounts, isLoading: accountsLoading } = useQuery<AccountReceivable[]>({
    queryKey: ["/api/financial/accounts-receivable"],
  });

  const { data: clientDetails } = useQuery<ClientFinancials>({
    queryKey: ["/api/financial/by-client", selectedClientId],
    enabled: !!selectedClientId,
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-text-primary" data-testid="text-page-title">
          Contas Correntes
        </h1>
        <p className="text-text-secondary mt-1" data-testid="text-page-description">
          Gestão financeira e cuentas por cobrar
        </p>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card data-testid="card-total-revenue">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Facturación Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {summaryLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <>
                <div className="text-2xl font-bold" data-testid="text-total-revenue">
                  {formatCurrency(summary?.totalRevenue || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {summary?.totalOrders || 0} pedidos totales
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card data-testid="card-average-value">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Promedio</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {summaryLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <>
                <div className="text-2xl font-bold" data-testid="text-average-value">
                  {formatCurrency(summary?.averageOrderValue || 0)}
                </div>
                <p className="text-xs text-muted-foreground">Por pedido</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card data-testid="card-pending">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendiente</CardTitle>
            <Package className="h-4 w-4 text-pending" />
          </CardHeader>
          <CardContent>
            {summaryLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <>
                <div className="text-2xl font-bold text-pending" data-testid="text-pending-value">
                  {formatCurrency(summary?.byStatus?.pendente || 0)}
                </div>
                <p className="text-xs text-muted-foreground">Pedidos pendientes</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card data-testid="card-delivered">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Entregado</CardTitle>
            <CheckCircle className="h-4 w-4 text-delivered" />
          </CardHeader>
          <CardContent>
            {summaryLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <>
                <div className="text-2xl font-bold text-delivered" data-testid="text-delivered-value">
                  {formatCurrency(summary?.byStatus?.entregue || 0)}
                </div>
                <p className="text-xs text-muted-foreground">Pedidos entregados</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Accounts Receivable Table */}
      <Card data-testid="card-accounts-table">
        <CardHeader>
          <CardTitle>Cuentas por Cobrar</CardTitle>
          <CardDescription>Resumen financiero por cliente</CardDescription>
        </CardHeader>
        <CardContent>
          {accountsLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : accounts && accounts.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead className="text-right">Total Pedidos</TableHead>
                  <TableHead className="text-right">Monto Total</TableHead>
                  <TableHead className="text-right">Pendientes</TableHead>
                  <TableHead className="text-right">Entregados</TableHead>
                  <TableHead className="text-right">Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {accounts.map((account) => (
                  <TableRow
                    key={account.clientId}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => setSelectedClientId(account.clientId)}
                    data-testid={`row-client-${account.clientId}`}
                  >
                    <TableCell className="font-medium" data-testid={`text-client-name-${account.clientId}`}>
                      {account.clientName}
                    </TableCell>
                    <TableCell className="text-right" data-testid={`text-total-orders-${account.clientId}`}>
                      {account.totalOrders}
                    </TableCell>
                    <TableCell className="text-right font-semibold" data-testid={`text-total-amount-${account.clientId}`}>
                      {formatCurrency(account.totalAmount)}
                    </TableCell>
                    <TableCell className="text-right" data-testid={`text-pending-orders-${account.clientId}`}>
                      {account.pendingOrders}
                    </TableCell>
                    <TableCell className="text-right" data-testid={`text-delivered-orders-${account.clientId}`}>
                      {account.deliveredOrders}
                    </TableCell>
                    <TableCell className="text-right">
                      {account.pendingOrders > 0 ? (
                        <Badge variant="secondary" className="bg-pending text-white">
                          Activo
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-delivered border-delivered">
                          Completado
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No hay datos financieros disponibles</p>
              <p className="text-sm text-muted-foreground mt-2">
                Importa pedidos para ver la información financiera
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Client Details Modal */}
      <Dialog open={!!selectedClientId} onOpenChange={() => setSelectedClientId(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto" data-testid="dialog-client-details">
          <DialogHeader>
            <DialogTitle data-testid="text-modal-client-name">
              {clientDetails?.client.name || "Detalles del Cliente"}
            </DialogTitle>
          </DialogHeader>
          
          {clientDetails && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Total Facturado</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold" data-testid="text-modal-total-amount">
                      {formatCurrency(clientDetails.totalAmount)}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Total Pedidos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold" data-testid="text-modal-total-orders">
                      {clientDetails.totalOrders}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Historial de Pedidos</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Pedido</TableHead>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Producto</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        <TableHead>Estado</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {clientDetails.orders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">{order.pedido}</TableCell>
                          <TableCell>{new Date(order.data).toLocaleDateString('es')}</TableCell>
                          <TableCell>{order.produto || order.itens || "-"}</TableCell>
                          <TableCell className="text-right font-semibold">
                            {formatCurrency(parseFloat(order.totalGuia || '0'))}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                order.situacao === "entregue"
                                  ? "default"
                                  : order.situacao === "pendente"
                                  ? "secondary"
                                  : "outline"
                              }
                            >
                              {order.situacao}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
