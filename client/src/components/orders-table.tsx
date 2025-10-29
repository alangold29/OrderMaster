import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, ArrowUpDown } from "lucide-react";
import OrderFormModal from "@/components/order-form-modal";
import type { OrderWithRelations } from "@shared/schema";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";

interface OrdersTableProps {
  filters: {
    search: string;
    clientId: string;
    exporterId: string;
    importerId: string;
    producerId: string;
    situacao: string;
    page: number;
    sortBy: string;
    sortOrder: "asc" | "desc";
  };
  onFiltersChange: (filters: any) => void;
}

export default function OrdersTable({ filters, onFiltersChange }: OrdersTableProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingOrder, setEditingOrder] = useState<OrderWithRelations | undefined>(undefined);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleEdit = (order: OrderWithRelations) => {
    setEditingOrder(order);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingOrder(undefined);
  };

  const deleteOrderMutation = useMutation({
    mutationFn: async (orderId: string) => {
      return await apiRequest(`/api/orders/${orderId}`, "DELETE");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast({
        title: "Pedido excluído",
        description: "O pedido foi excluído com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Falha ao excluir o pedido.",
        variant: "destructive",
      });
    },
  });

  const handleDelete = (orderId: string, pedidoNumber: string) => {
    if (confirm(`Tem certeza que deseja excluir o pedido ${pedidoNumber}?`)) {
      deleteOrderMutation.mutate(orderId);
    }
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ["orders", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("page", filters.page.toString());
      params.append("limit", "10");

      // Only add non-empty parameters to avoid sending empty strings
      if (filters.search?.trim()) params.append("search", filters.search);
      if (filters.clientId?.trim()) params.append("clientId", filters.clientId);
      if (filters.exporterId?.trim()) params.append("exporterId", filters.exporterId);
      if (filters.importerId?.trim()) params.append("importerId", filters.importerId);
      if (filters.producerId?.trim()) params.append("producerId", filters.producerId);
      if (filters.situacao?.trim() && filters.situacao !== "all") params.append("situacao", filters.situacao);
      if (filters.sortBy?.trim()) params.append("sortBy", filters.sortBy);
      if (filters.sortOrder?.trim()) params.append("sortOrder", filters.sortOrder);

      const url = `/api/orders?${params}`;
      console.log("🔍 Fetching orders with URL:", url);
      console.log("🔍 Active filters:", filters);

      const response = await fetch(url);
      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ API Error:", errorText);
        throw new Error('Network response was not ok');
      }
      const result = await response.json();
      console.log("✅ API Response:", result);
      console.log(`📊 Found ${result.total} total orders, ${result.orders?.length || 0} on this page`);
      return result;
    },
  });

  const handleSort = (column: string) => {
    const newSortOrder = 
      filters.sortBy === column && filters.sortOrder === "desc" ? "asc" : "desc";
    
    onFiltersChange({
      ...filters,
      sortBy: column,
      sortOrder: newSortOrder,
    });
  };

  const handlePageChange = (page: number) => {
    onFiltersChange({
      ...filters,
      page,
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pendiente: { label: "Pendiente", className: "bg-pending/10 text-pending" },
      transito: { label: "En Tránsito", className: "bg-in-transit/10 text-in-transit" },
      entregado: { label: "Entregado", className: "bg-delivered/10 text-delivered" },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || {
      label: status,
      className: "bg-gray-100 text-gray-800",
    };
    
    return (
      <Badge variant="secondary" className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const formatCurrency = (value: string | number) => {
    const num = typeof value === "string" ? parseFloat(value) : value;
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(num || 0);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  if (isLoading) {
    return (
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {[...Array(12)].map((_, i) => (
                <TableHead key={i}>
                  <Skeleton className="h-4 w-20" />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, i) => (
              <TableRow key={i}>
                {[...Array(12)].map((_, j) => (
                  <TableCell key={j}>
                    <Skeleton className="h-4 w-full" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-600 mb-2">Erro ao carregar pedidos</p>
        <p className="text-sm text-gray-500">{error.message}</p>
      </div>
    );
  }

  const orders = data?.orders || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / 10);
  const startIndex = (filters.page - 1) * 10 + 1;
  const endIndex = Math.min(filters.page * 10, total);

  return (
    <>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="cursor-pointer hover:bg-gray-100" onClick={() => handleSort("pedido")}>
                <div className="flex items-center">
                  Pedido
                  <ArrowUpDown className="ml-1 h-3 w-3" />
                </div>
              </TableHead>
              <TableHead className="cursor-pointer hover:bg-gray-100" onClick={() => handleSort("data")}>
                <div className="flex items-center">
                  Data
                  <ArrowUpDown className="ml-1 h-3 w-3" />
                </div>
              </TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Exportador</TableHead>
              <TableHead>Importador</TableHead>
              <TableHead>Produtor</TableHead>
              <TableHead>Itens</TableHead>
              <TableHead>Quantidade</TableHead>
              <TableHead>Situação</TableHead>
              <TableHead>Embarque</TableHead>
              <TableHead>Previsão</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order: any) => (
              <TableRow key={order.id} className="hover:bg-gray-50">
                <TableCell className="font-medium">{order.pedido}</TableCell>
                <TableCell className="text-text-secondary">
                  {formatDate(order.data)}
                </TableCell>
                <TableCell>{order.client?.name || "-"}</TableCell>
                <TableCell className="text-text-secondary">
                  {order.exporter?.name || "-"}
                </TableCell>
                <TableCell className="text-text-secondary">
                  {order.importer?.name || "-"}
                </TableCell>
                <TableCell className="text-text-secondary">
                  {order.producer?.name || "-"}
                </TableCell>
                <TableCell>{order.itens || "-"}</TableCell>
                <TableCell className="text-text-secondary">
                  {order.quantidade || "-"}
                </TableCell>
                <TableCell>{getStatusBadge(order.situacao)}</TableCell>
                <TableCell className="text-text-secondary">
                  {formatDate(order.embarque)}
                </TableCell>
                <TableCell className="text-text-secondary">
                  {formatDate(order.previsao)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-primary hover:text-blue-700"
                      onClick={() => handleEdit(order)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-cancelled hover:text-red-700"
                      onClick={() => handleDelete(order.id, order.pedido)}
                      disabled={deleteOrderMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {orders.length === 0 && (
              <TableRow>
                <TableCell colSpan={12} className="text-center py-8 text-text-secondary">
                  Nenhum pedido encontrado
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="text-sm text-text-secondary">
            Mostrando <span className="font-medium">{startIndex}</span> a{" "}
            <span className="font-medium">{endIndex}</span> de{" "}
            <span className="font-medium">{total}</span> resultados
          </div>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => handlePageChange(Math.max(1, filters.page - 1))}
                  className={filters.page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
              
              {[...Array(Math.min(5, totalPages))].map((_, i) => {
                const page = i + 1;
                return (
                  <PaginationItem key={page}>
                    <PaginationLink
                      onClick={() => handlePageChange(page)}
                      isActive={page === filters.page}
                      className="cursor-pointer"
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}
              
              {totalPages > 5 && (
                <>
                  <PaginationItem>
                    <span className="px-2 py-1 text-sm text-text-secondary">...</span>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink
                      onClick={() => handlePageChange(totalPages)}
                      className="cursor-pointer"
                    >
                      {totalPages}
                    </PaginationLink>
                  </PaginationItem>
                </>
              )}
              
              <PaginationItem>
                <PaginationNext
                  onClick={() => handlePageChange(Math.min(totalPages, filters.page + 1))}
                  className={filters.page === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
      {/* Edit Modal */}
      <OrderFormModal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        order={editingOrder}
      />
    </>
  );
}
