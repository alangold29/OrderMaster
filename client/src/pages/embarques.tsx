import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import EmbarquesFilters from "@/components/embarques-filters";
import OrdersTable from "@/components/orders-table";
import OrderFormModal from "@/components/order-form-modal";

export default function Embarques() {
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  
  const [filters, setFilters] = useState({
    pedidoOuAno: "",
    exporterId: "",
    importerId: "",
    portoEmbarque: "",
    portoDestino: "",
    dataPedidoInicio: "",
    dataPedidoFim: "",
    dataEmbarqueInicio: "",
    dataEmbarqueFim: "",
    dataChegadaInicio: "",
    dataChegadaFim: "",
    situacaoPedido: "",
    referenciaExportador: "",
    referenciaImportador: "",
    page: 1,
    sortBy: "data",
    sortOrder: "desc" as "asc" | "desc",
  });

  // Convert embarques filters to orders API format
  const ordersFilters = {
    search: filters.pedidoOuAno,
    clientId: "",
    exporterId: filters.exporterId,
    importerId: filters.importerId,
    producerId: "",
    situacao: filters.situacaoPedido,
    portoEmbarque: filters.portoEmbarque,
    portoDestino: filters.portoDestino,
    referenciaExportador: filters.referenciaExportador,
    referenciaImportador: filters.referenciaImportador,
    dataPedidoInicio: filters.dataPedidoInicio,
    dataPedidoFim: filters.dataPedidoFim,
    dataEmbarqueInicio: filters.dataEmbarqueInicio,
    dataEmbarqueFim: filters.dataEmbarqueFim,
    dataChegadaInicio: filters.dataChegadaInicio,
    dataChegadaFim: filters.dataChegadaFim,
    page: filters.page,
    sortBy: filters.sortBy,
    sortOrder: filters.sortOrder,
  };

  const { data: ordersData, isLoading } = useQuery({
    queryKey: ["/api/orders", ordersFilters],
    queryFn: async () => {
      const { storage } = await import('@/lib/storage');
      return storage.getOrders(ordersFilters);
    },
  });

  const handleFiltersChange = (newFilters: any) => {
    setFilters(newFilters);
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const handleSortChange = (sortBy: string, sortOrder: "asc" | "desc") => {
    setFilters(prev => ({ ...prev, sortBy, sortOrder, page: 1 }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Embarques</h1>
        <Button onClick={() => setIsOrderModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Pedido
        </Button>
      </div>

      {/* Embarques Filters */}
      <EmbarquesFilters 
        filters={filters} 
        onFiltersChange={handleFiltersChange} 
      />

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Resultados de Embarques</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-muted-foreground">Carregando embarques...</div>
            </div>
          ) : ordersData?.orders?.length === 0 ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-muted-foreground">
                Nenhum embarque encontrado com os filtros aplicados
              </div>
            </div>
          ) : (
            <OrdersTable 
              filters={ordersFilters} 
              onFiltersChange={(newFilters) => {
                // Convert back to embarques format
                setFilters(prev => ({
                  ...prev,
                  page: newFilters.page,
                  sortBy: newFilters.sortBy,
                  sortOrder: newFilters.sortOrder,
                }));
              }} 
            />
          )}
        </CardContent>
      </Card>

      {/* Order Form Modal */}
      <OrderFormModal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        order={undefined}
      />
    </div>
  );
}