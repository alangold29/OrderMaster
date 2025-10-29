import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, ChevronUp, FileText, Download, Calendar, MapPin, Package, Users, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CompleteDataTableProps {
  showAllFields?: boolean;
  viewType?: 'pedidos' | 'embarques' | 'complete';
}

const statusColors = {
  pendiente: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  transito: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  entregado: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
};

export default function CompleteDataTable({ 
  showAllFields = true, 
  viewType = 'complete' 
}: CompleteDataTableProps) {
  const [filters, setFilters] = useState({
    search: "",
    exporterId: "",
    importerId: "",
    clientId: "",
    producerId: "",
    situacao: "",
    portoEmbarque: "",
    portoDestino: "",
    page: 1,
    sortBy: "data",
    sortOrder: "desc" as "asc" | "desc",
  });

  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const { data: ordersData, isLoading } = useQuery<{ orders: any[]; total: number }>({
    queryKey: ["orders", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("page", filters.page.toString());
      params.append("limit", "20");

      if (filters.search?.trim()) params.append("search", filters.search);
      if (filters.clientId?.trim()) params.append("clientId", filters.clientId);
      if (filters.exporterId?.trim()) params.append("exporterId", filters.exporterId);
      if (filters.importerId?.trim()) params.append("importerId", filters.importerId);
      if (filters.producerId?.trim()) params.append("producerId", filters.producerId);
      if (filters.situacao?.trim() && filters.situacao !== "all") params.append("situacao", filters.situacao);
      if (filters.sortBy?.trim()) params.append("sortBy", filters.sortBy);
      if (filters.sortOrder?.trim()) params.append("sortOrder", filters.sortOrder);

      const response = await fetch(`/api/orders?${params}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    },
  });

  const { data: exporters } = useQuery<any[]>({ queryKey: ["/api/exporters"] });
  const { data: importers } = useQuery<any[]>({ queryKey: ["/api/importers"] });
  const { data: clients } = useQuery<any[]>({ queryKey: ["/api/clients"] });
  const { data: producers } = useQuery<any[]>({ queryKey: ["/api/producers"] });

  const handleSort = (column: string) => {
    const newSortOrder = 
      filters.sortBy === column && filters.sortOrder === "desc" ? "asc" : "desc";
    
    setFilters(prev => ({
      ...prev,
      sortBy: column,
      sortOrder: newSortOrder,
    }));
  };

  const toggleRowExpansion = (orderId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId);
    } else {
      newExpanded.add(orderId);
    }
    setExpandedRows(newExpanded);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    try {
      return format(new Date(dateString), "dd/MM/yyyy");
    } catch {
      return dateString;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Skeleton className="h-6 w-6" />
            <Skeleton className="h-6 w-40" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const orders = ordersData?.orders || [];
  const totalValue = orders.reduce((sum: number, order: any) => sum + (order.totalGuia || 0), 0);
  const totalOrders = orders.length;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Package className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Pedidos</p>
                <p className="text-2xl font-bold">{totalOrders}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Valor Total</p>
                <p className="text-2xl font-bold">{formatCurrency(totalValue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Clientes Ativos</p>
                <p className="text-2xl font-bold">{(clients as any)?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Exportadores</p>
                <p className="text-2xl font-bold">{(exporters as any)?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Filtros de Consulta</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <Input
              placeholder="Buscar por pedido, referência..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }))}
            />
            
            <Select 
              value={filters.exporterId || "all"} 
              onValueChange={(value) => setFilters(prev => ({ ...prev, exporterId: value === "all" ? "" : value, page: 1 }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Exportador" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {(exporters as any)?.map((exporter: any) => (
                  <SelectItem key={exporter.id} value={exporter.id}>
                    {exporter.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select 
              value={filters.importerId || "all"} 
              onValueChange={(value) => setFilters(prev => ({ ...prev, importerId: value === "all" ? "" : value, page: 1 }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Importador" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {(importers as any)?.map((importer: any) => (
                  <SelectItem key={importer.id} value={importer.id}>
                    {importer.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select 
              value={filters.clientId || "all"} 
              onValueChange={(value) => setFilters(prev => ({ ...prev, clientId: value === "all" ? "" : value, page: 1 }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Cliente" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {(clients as any)?.map((client: any) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select 
              value={filters.situacao || "all"} 
              onValueChange={(value) => setFilters(prev => ({ ...prev, situacao: value === "all" ? "" : value, page: 1 }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Situação" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="em-transito">Em Trânsito</SelectItem>
                <SelectItem value="entregue">Entregue</SelectItem>
                <SelectItem value="quitado">Quitado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Main Data Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Package className="h-5 w-5" />
                <span>Tabela Completa de Dados</span>
              </CardTitle>
              <CardDescription>
                Consulta completa de pedidos e embarques - {orders.length} registros encontrados
              </CardDescription>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]"></TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('numeroPedido')}
                  >
                    Pedido {filters.sortBy === 'numeroPedido' && (
                      filters.sortOrder === 'desc' ? <ChevronDown className="h-4 w-4 inline" /> : <ChevronUp className="h-4 w-4 inline" />
                    )}
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('data')}
                  >
                    Data {filters.sortBy === 'data' && (
                      filters.sortOrder === 'desc' ? <ChevronDown className="h-4 w-4 inline" /> : <ChevronUp className="h-4 w-4 inline" />
                    )}
                  </TableHead>
                  <TableHead>Exportador</TableHead>
                  <TableHead>Importador</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Produto</TableHead>
                  <TableHead className="text-right">Quantidade</TableHead>
                  <TableHead className="text-right">Valor Total</TableHead>
                  <TableHead>Situação</TableHead>
                  <TableHead>Porto Embarque</TableHead>
                  <TableHead>Porto Destino</TableHead>
                  <TableHead>Data Embarque</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order: any) => (
                  <>
                    <TableRow key={order.id} className="hover:bg-muted/50">
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleRowExpansion(order.id)}
                        >
                          {expandedRows.has(order.id) ? 
                            <ChevronUp className="h-4 w-4" /> : 
                            <ChevronDown className="h-4 w-4" />
                          }
                        </Button>
                      </TableCell>
                      <TableCell className="font-mono font-medium">
                        {order.numeroPedido}
                      </TableCell>
                      <TableCell>{formatDate(order.data)}</TableCell>
                      <TableCell>
                        <div className="max-w-[150px] truncate" title={order.exporter?.name}>
                          {order.exporter?.name || "-"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[150px] truncate" title={order.importer?.name}>
                          {order.importer?.name || "-"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[120px] truncate" title={order.client?.name}>
                          {order.client?.name || "-"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[200px] truncate" title={order.itens}>
                          {order.itens || "-"}
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {order.quantidade?.toLocaleString('pt-BR') || "-"}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(order.totalGuia || 0)}
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[order.situacao as keyof typeof statusColors] || "bg-gray-100 text-gray-800"}>
                          {order.situacao || "pendente"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[120px] truncate" title={order.portoEmbarque}>
                          {order.portoEmbarque || "-"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[120px] truncate" title={order.portoDestino}>
                          {order.portoDestino || "-"}
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(order.dataEmbarqueDe)}</TableCell>
                    </TableRow>
                    
                    {/* Expanded Row with Additional Details */}
                    {expandedRows.has(order.id) && (
                      <TableRow className="bg-muted/30">
                        <TableCell colSpan={12}>
                          <div className="p-4 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              <div>
                                <h4 className="font-semibold text-sm mb-2">Informações Comerciais</h4>
                                <div className="space-y-1 text-sm">
                                  <p><span className="font-medium">Ref. Exportador:</span> {order.referenciaExportador || "-"}</p>
                                  <p><span className="font-medium">Ref. Importador:</span> {order.referenciaImportador || "-"}</p>
                                  <p><span className="font-medium">Preço Guia:</span> {formatCurrency(order.precoGuia || 0)}</p>
                                  <p><span className="font-medium">Produtor:</span> {order.producer?.name || "-"}</p>
                                </div>
                              </div>
                              
                              <div>
                                <h4 className="font-semibold text-sm mb-2">Logística</h4>
                                <div className="space-y-1 text-sm">
                                  <p><span className="font-medium">Condição:</span> {order.condicao || "-"}</p>
                                  <p><span className="font-medium">Previsão:</span> {formatDate(order.previsao)}</p>
                                  <p><span className="font-medium">Chegada:</span> {formatDate(order.chegada)}</p>
                                  <p><span className="font-medium">Etiqueta:</span> {order.etiqueta || "-"}</p>
                                </div>
                              </div>
                              
                              <div>
                                <h4 className="font-semibold text-sm mb-2">Observações</h4>
                                <div className="space-y-1 text-sm">
                                  <p><span className="font-medium">Semana:</span> {order.semana || "-"}</p>
                                  <p><span className="font-medium">Observação:</span></p>
                                  <p className="text-xs text-muted-foreground bg-background p-2 rounded border max-h-20 overflow-y-auto">
                                    {order.observacao || "Nenhuma observação registrada"}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {orders.length === 0 && !isLoading && (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <div className="text-lg font-medium">Nenhum registro encontrado</div>
              <div className="text-muted-foreground">
                Tente ajustar os filtros para encontrar os dados desejados
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}