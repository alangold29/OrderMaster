import { useQuery } from "@tanstack/react-query";
import { Search, X, Filter, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useState } from "react";

interface FiltersProps {
  filters: {
    search: string;
    clientId: string;
    exporterId: string;
    importerId: string;
    producerId: string;
    situacao: string;
    dataPedidoInicio?: string;
    dataPedidoFim?: string;
    dataEmbarqueInicio?: string;
    dataEmbarqueFim?: string;
    dataChegadaInicio?: string;
    dataChegadaFim?: string;
    page: number;
    sortBy: string;
    sortOrder: "asc" | "desc";
  };
  onFiltersChange: (filters: any) => void;
}

export default function FiltersSection({ filters, onFiltersChange }: FiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const { data: clients } = useQuery<any[]>({
    queryKey: ["/api/clients"],
    queryFn: async () => {
      const { storage } = await import('@/lib/storage');
      return storage.getClients();
    },
  });
  const { data: exporters } = useQuery<any[]>({
    queryKey: ["/api/exporters"],
    queryFn: async () => {
      const { storage } = await import('@/lib/storage');
      return storage.getExporters();
    },
  });
  const { data: importers } = useQuery<any[]>({
    queryKey: ["/api/importers"],
    queryFn: async () => {
      const { storage } = await import('@/lib/storage');
      return storage.getImporters();
    },
  });
  const { data: producers } = useQuery<any[]>({
    queryKey: ["/api/producers"],
    queryFn: async () => {
      const { storage } = await import('@/lib/storage');
      return storage.getProducers();
    },
  });

  const handleFilterChange = (key: string, value: string) => {
    const finalValue = value === "all" ? "" : value;
    onFiltersChange({
      ...filters,
      [key]: finalValue,
      page: 1,
    });
  };

  const removeFilter = (key: string) => {
    if (key === "dataPedido") {
      onFiltersChange({
        ...filters,
        dataPedidoInicio: "",
        dataPedidoFim: "",
        page: 1,
      });
    } else if (key === "dataEmbarque") {
      onFiltersChange({
        ...filters,
        dataEmbarqueInicio: "",
        dataEmbarqueFim: "",
        page: 1,
      });
    } else if (key === "dataChegada") {
      onFiltersChange({
        ...filters,
        dataChegadaInicio: "",
        dataChegadaFim: "",
        page: 1,
      });
    } else {
      handleFilterChange(key, "all");
    }
  };

  const clearAllFilters = () => {
    onFiltersChange({
      search: "",
      clientId: "",
      exporterId: "",
      importerId: "",
      producerId: "",
      situacao: "",
      dataPedidoInicio: "",
      dataPedidoFim: "",
      dataEmbarqueInicio: "",
      dataEmbarqueFim: "",
      dataChegadaInicio: "",
      dataChegadaFim: "",
      page: 1,
      sortBy: "data",
      sortOrder: "desc",
    });
  };

  const getActiveFilters = () => {
    const active = [];

    if (filters.search) {
      active.push({
        key: "search",
        label: `Busca: ${filters.search}`,
      });
    }

    if (filters.situacao) {
      const statusLabels = {
        pendiente: "Pendiente",
        transito: "En Tránsito",
        entregado: "Entregado",
      };
      active.push({
        key: "situacao",
        label: `Status: ${statusLabels[filters.situacao as keyof typeof statusLabels]}`,
      });
    }

    if (filters.clientId && clients) {
      const client = clients.find((c: any) => c.id === filters.clientId);
      if (client) {
        active.push({
          key: "clientId",
          label: `Cliente: ${client.name}`,
        });
      }
    }

    if (filters.exporterId && exporters) {
      const exporter = exporters.find((e: any) => e.id === filters.exporterId);
      if (exporter) {
        active.push({
          key: "exporterId",
          label: `Exportador: ${exporter.name}`,
        });
      }
    }

    if (filters.importerId && importers) {
      const importer = importers.find((i: any) => i.id === filters.importerId);
      if (importer) {
        active.push({
          key: "importerId",
          label: `Importador: ${importer.name}`,
        });
      }
    }

    if (filters.producerId && producers) {
      const producer = producers.find((p: any) => p.id === filters.producerId);
      if (producer) {
        active.push({
          key: "producerId",
          label: `Produtor: ${producer.name}`,
        });
      }
    }

    if (filters.dataPedidoInicio && filters.dataPedidoFim) {
      active.push({
        key: "dataPedido",
        label: `Fecha Pedido: ${filters.dataPedidoInicio} - ${filters.dataPedidoFim}`,
      });
    }

    if (filters.dataEmbarqueInicio && filters.dataEmbarqueFim) {
      active.push({
        key: "dataEmbarque",
        label: `Fecha Embarque: ${filters.dataEmbarqueInicio} - ${filters.dataEmbarqueFim}`,
      });
    }

    if (filters.dataChegadaInicio && filters.dataChegadaFim) {
      active.push({
        key: "dataChegada",
        label: `Fecha Llegada: ${filters.dataChegadaInicio} - ${filters.dataChegadaFim}`,
      });
    }

    return active;
  };

  const activeFilters = getActiveFilters();

  return (
    <Card className="bg-surface border border-gray-200">
      <CardContent className="p-6">
        {/* Basic Filters - Always Visible */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar pedidos..."
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Status */}
          <Select value={filters.situacao || "all"} onValueChange={(value) => handleFilterChange("situacao", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Todas as situações" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las situaciones</SelectItem>
              <SelectItem value="pendiente">Pendiente</SelectItem>
              <SelectItem value="transito">En Tránsito</SelectItem>
              <SelectItem value="entregado">Entregado</SelectItem>
            </SelectContent>
          </Select>

          {/* Cliente */}
          <Select value={filters.clientId || "all"} onValueChange={(value) => handleFilterChange("clientId", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Todos os clientes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os clientes</SelectItem>
              {clients?.filter((c: any) => c.name && c.name.trim() !== "").map((client: any) => (
                <SelectItem key={client.id} value={client.id}>
                  {client.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Exportador */}
          <Select value={filters.exporterId || "all"} onValueChange={(value) => handleFilterChange("exporterId", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Todos os exportadores" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os exportadores</SelectItem>
              {exporters?.filter((e: any) => e.name && e.name.trim() !== "").map((exporter: any) => (
                <SelectItem key={exporter.id} value={exporter.id}>
                  {exporter.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Importador */}
          <Select value={filters.importerId || "all"} onValueChange={(value) => handleFilterChange("importerId", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Todos os importadores" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os importadores</SelectItem>
              {importers?.filter((i: any) => i.name && i.name.trim() !== "").map((importer: any) => (
                <SelectItem key={importer.id} value={importer.id}>
                  {importer.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Advanced Filters Toggle */}
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-between mb-4"
              size="sm"
            >
              <span className="flex items-center">
                <Filter className="mr-2 h-4 w-4" />
                Filtros Avanzados
              </span>
              <span className="text-xs text-gray-500">
                {isExpanded ? "Ocultar" : "Mostrar"}
              </span>
            </Button>
          </CollapsibleTrigger>

          <CollapsibleContent className="space-y-4">
            {/* Date Range Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center">
                  <Calendar className="mr-2 h-4 w-4" />
                  Fecha del Pedido
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="date"
                    value={filters.dataPedidoInicio || ""}
                    onChange={(e) => handleFilterChange("dataPedidoInicio", e.target.value)}
                    placeholder="De"
                  />
                  <Input
                    type="date"
                    value={filters.dataPedidoFim || ""}
                    onChange={(e) => handleFilterChange("dataPedidoFim", e.target.value)}
                    placeholder="Hasta"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center">
                  <Calendar className="mr-2 h-4 w-4" />
                  Fecha de Embarque
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="date"
                    value={filters.dataEmbarqueInicio || ""}
                    onChange={(e) => handleFilterChange("dataEmbarqueInicio", e.target.value)}
                    placeholder="De"
                  />
                  <Input
                    type="date"
                    value={filters.dataEmbarqueFim || ""}
                    onChange={(e) => handleFilterChange("dataEmbarqueFim", e.target.value)}
                    placeholder="Hasta"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center">
                  <Calendar className="mr-2 h-4 w-4" />
                  Fecha de Llegada
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="date"
                    value={filters.dataChegadaInicio || ""}
                    onChange={(e) => handleFilterChange("dataChegadaInicio", e.target.value)}
                    placeholder="De"
                  />
                  <Input
                    type="date"
                    value={filters.dataChegadaFim || ""}
                    onChange={(e) => handleFilterChange("dataChegadaFim", e.target.value)}
                    placeholder="Hasta"
                  />
                </div>
              </div>
            </div>

            {/* Producer Filter */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Productor
              </label>
              <Select value={filters.producerId || "all"} onValueChange={(value) => handleFilterChange("producerId", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os produtores" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os produtores</SelectItem>
                  {producers?.filter((p: any) => p.name && p.name.trim() !== "").map((producer: any) => (
                    <SelectItem key={producer.id} value={producer.id}>
                      {producer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Action Buttons */}
        {activeFilters.length > 0 && (
          <div className="flex gap-2 mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={clearAllFilters}
              className="flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              Limpar Filtros
            </Button>
          </div>
        )}

        {/* Active Filters */}
        {activeFilters.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-gray-600 font-medium">Filtros activos:</span>
              {activeFilters.map((filter) => (
                <Badge
                  key={filter.key}
                  variant="secondary"
                  className="bg-blue-100 text-blue-800 hover:bg-blue-200 cursor-pointer"
                  onClick={() => removeFilter(filter.key)}
                >
                  {filter.label}
                  <X className="ml-1 h-3 w-3" />
                </Badge>
              ))}
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="text-gray-500 hover:text-gray-700"
              >
                Limpiar todos
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
