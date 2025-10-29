import { useQuery } from "@tanstack/react-query";
import { Search, X, Filter, Calendar, Ship } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useState } from "react";

interface EmbarquesFiltersProps {
  filters: {
    pedidoOuAno: string;
    exporterId: string;
    importerId: string;
    portoEmbarque: string;
    portoDestino: string;
    dataPedidoInicio: string;
    dataPedidoFim: string;
    dataEmbarqueInicio: string;
    dataEmbarqueFim: string;
    dataChegadaInicio: string;
    dataChegadaFim: string;
    situacaoPedido: string;
    referenciaExportador: string;
    referenciaImportador: string;
    page: number;
    sortBy: string;
    sortOrder: "asc" | "desc";
  };
  onFiltersChange: (filters: any) => void;
}

export default function EmbarquesFilters({ filters, onFiltersChange }: EmbarquesFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const { data: exporters } = useQuery<any[]>({ queryKey: ["/api/exporters"] });
  const { data: importers } = useQuery<any[]>({ queryKey: ["/api/importers"] });

  const handleFilterChange = (key: string, value: string) => {
    const finalValue = value === "all" ? "" : value;
    onFiltersChange({
      ...filters,
      [key]: finalValue,
      page: 1,
    });
  };

  const removeFilter = (key: string) => {
    handleFilterChange(key, "all");
  };

  const clearAllFilters = () => {
    onFiltersChange({
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
      sortOrder: "desc",
    });
  };

  const getActiveFilters = () => {
    const active = [];

    if (filters.pedidoOuAno) {
      active.push({
        key: "pedidoOuAno",
        label: `Pedido/Año: ${filters.pedidoOuAno}`,
      });
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

    if (filters.portoEmbarque) {
      active.push({
        key: "portoEmbarque",
        label: `Puerto Embarque: ${filters.portoEmbarque}`,
      });
    }

    if (filters.portoDestino) {
      active.push({
        key: "portoDestino",
        label: `Puerto Destino: ${filters.portoDestino}`,
      });
    }

    if (filters.situacaoPedido) {
      const statusLabels = {
        pendiente: "Pendiente",
        transito: "En Tránsito",
        entregado: "Entregado",
      };
      active.push({
        key: "situacaoPedido",
        label: `Situación: ${statusLabels[filters.situacaoPedido as keyof typeof statusLabels]}`,
      });
    }

    if (filters.referenciaExportador) {
      active.push({
        key: "referenciaExportador",
        label: `Ref. Exportador: ${filters.referenciaExportador}`,
      });
    }

    if (filters.referenciaImportador) {
      active.push({
        key: "referenciaImportador",
        label: `Ref. Importador: ${filters.referenciaImportador}`,
      });
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
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <Ship className="mr-2 h-5 w-5" />
          Filtros de Embarque
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Basic Filters - Always Visible */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Pedido ou Ano */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Pedido o Año..."
              value={filters.pedidoOuAno}
              onChange={(e) => handleFilterChange("pedidoOuAno", e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Exportador */}
          <Select value={filters.exporterId || "all"} onValueChange={(value) => handleFilterChange("exporterId", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Exportador" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los exportadores</SelectItem>
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
              <SelectValue placeholder="Importador" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los importadores</SelectItem>
              {importers?.filter((i: any) => i.name && i.name.trim() !== "").map((importer: any) => (
                <SelectItem key={importer.id} value={importer.id}>
                  {importer.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Situação Pedido */}
          <Select value={filters.situacaoPedido || "all"} onValueChange={(value) => handleFilterChange("situacaoPedido", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Situación Pedido" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las situaciones</SelectItem>
              <SelectItem value="pendiente">Pendiente</SelectItem>
              <SelectItem value="transito">En Tránsito</SelectItem>
              <SelectItem value="entregado">Entregado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mb-4">
          <Button
            variant="default"
            size="sm"
            className="flex items-center gap-2"
          >
            <Search className="h-4 w-4" />
            Buscar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={clearAllFilters}
            className="flex items-center gap-2"
          >
            <X className="h-4 w-4" />
            Limpiar Filtros
          </Button>
        </div>

        {/* Advanced Filters Toggle */}
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-between"
            >
              <span className="flex items-center">
                <Filter className="mr-2 h-4 w-4" />
                Filtros Avanzados de Embarque
              </span>
              <span className="text-xs text-gray-500">
                {isExpanded ? "Ocultar" : "Mostrar"}
              </span>
            </Button>
          </CollapsibleTrigger>

          <CollapsibleContent className="space-y-4 mt-4">
            {/* Shipping Info Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                placeholder="Puerto de Embarque"
                value={filters.portoEmbarque}
                onChange={(e) => handleFilterChange("portoEmbarque", e.target.value)}
              />
              <Input
                placeholder="Puerto de Destino"
                value={filters.portoDestino}
                onChange={(e) => handleFilterChange("portoDestino", e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                placeholder="Referencia Exportador"
                value={filters.referenciaExportador}
                onChange={(e) => handleFilterChange("referenciaExportador", e.target.value)}
              />
              <Input
                placeholder="Referencia Importador"
                value={filters.referenciaImportador}
                onChange={(e) => handleFilterChange("referenciaImportador", e.target.value)}
              />
            </div>

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
                    value={filters.dataPedidoInicio}
                    onChange={(e) => handleFilterChange("dataPedidoInicio", e.target.value)}
                    placeholder="De"
                  />
                  <Input
                    type="date"
                    value={filters.dataPedidoFim}
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
                    value={filters.dataEmbarqueInicio}
                    onChange={(e) => handleFilterChange("dataEmbarqueInicio", e.target.value)}
                    placeholder="De"
                  />
                  <Input
                    type="date"
                    value={filters.dataEmbarqueFim}
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
                    value={filters.dataChegadaInicio}
                    onChange={(e) => handleFilterChange("dataChegadaInicio", e.target.value)}
                    placeholder="De"
                  />
                  <Input
                    type="date"
                    value={filters.dataChegadaFim}
                    onChange={(e) => handleFilterChange("dataChegadaFim", e.target.value)}
                    placeholder="Hasta"
                  />
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Active Filters */}
        {activeFilters.length > 0 && (
          <div className="pt-4 border-t border-gray-200">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-gray-600 font-medium">Filtros activos:</span>
              {activeFilters.map((filter) => (
                <Badge
                  key={filter.key}
                  variant="secondary"
                  className="bg-blue-100 text-blue-800 hover:bg-blue-200 cursor-pointer"
                  onClick={() => {
                    if (filter.key === "dataPedido") {
                      removeFilter("dataPedidoInicio");
                      removeFilter("dataPedidoFim");
                    } else if (filter.key === "dataEmbarque") {
                      removeFilter("dataEmbarqueInicio");
                      removeFilter("dataEmbarqueFim");
                    } else if (filter.key === "dataChegada") {
                      removeFilter("dataChegadaInicio");
                      removeFilter("dataChegadaFim");
                    } else {
                      removeFilter(filter.key);
                    }
                  }}
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
