import { useState } from "react";
import { Import, Bell, User } from "lucide-react";
import DashboardStats from "@/components/dashboard-stats";
import OrdersTable from "@/components/orders-table";
import FiltersSection from "@/components/filters-section";
import OrderFormModal from "@/components/order-form-modal";
import FileUploadModal from "@/components/file-upload-modal";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function Dashboard() {
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isFileModalOpen, setIsFileModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    search: "",
    clientId: "",
    exporterId: "",
    importerId: "",
    producerId: "",
    situacao: "",
    page: 1,
    sortBy: "data",
    sortOrder: "desc" as "asc" | "desc",
  });

  return (
    <div className="min-h-screen bg-[hsl(60,4.8%,95.9%)]">
      {/* Header */}
      <header className="bg-surface shadow-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Import className="text-primary text-3xl mr-3 h-8 w-8" />
              <h1 className="text-xl font-medium text-text-primary">
                CRM Importação & Exportação
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" className="text-text-secondary hover:text-text-primary">
                <Bell className="mr-2 h-4 w-4" />
                Notificações
              </Button>
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <User className="text-white h-4 w-4" />
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Statistics */}
        <DashboardStats />

        {/* Orders Section */}
        <Card className="bg-surface border border-gray-200">
          {/* Header with Actions */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-lg font-medium text-text-primary mb-4 sm:mb-0">
                Gestão de Pedidos
              </h2>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  variant="outline"
                  onClick={() => setIsFileModalOpen(true)}
                  className="border-gray-300 text-text-secondary hover:bg-gray-100"
                >
                  <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  Importar Excel
                </Button>
                <Button
                  onClick={() => setIsOrderModalOpen(true)}
                  className="bg-primary text-white hover:bg-blue-700"
                >
                  <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Novo Pedido
                </Button>
              </div>
            </div>
          </div>

          {/* Filters */}
          <FiltersSection filters={filters} onFiltersChange={setFilters} />

          {/* Orders Table */}
          <OrdersTable filters={filters} onFiltersChange={setFilters} />
        </Card>
      </div>

      {/* Modals */}
      <OrderFormModal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
      />
      
      <FileUploadModal
        isOpen={isFileModalOpen}
        onClose={() => setIsFileModalOpen(false)}
      />
    </div>
  );
}
