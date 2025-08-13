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
    notify: string;
    portoEmbarque: string;
    portoDesembarque: string;
    representante: string;
    blCrtAwb: string;
    dataPedidoInicio: string;
    dataPedidoFim: string;
    dataEmbarqueInicio: string;
    dataEmbarqueFim: string;
    dataDesembarqueInicio: string;
    dataDesembarqueFim: string;
    situacaoPedido: string;
    grupo: string;
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
  
  const { data: exporters } = useQuery({ queryKey: ["/api/exporters"] });
  const { data: importers } = useQuery({ queryKey: ["/api/importers"] });

  const handleFilterChange = (key: string, value: string) => {
    const finalValue = value === "all" ? "" : value;
    onFiltersChange({
      ...filters,
      [key]: finalValue,
      page: 1, // Reset to first page when filtering
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
      notify: "",
      portoEmbarque: "",
      portoDesembarque: "",
      representante: "",
      blCrtAwb: "",
      dataPedidoInicio: "",
      dataPedidoFim: "",
      dataEmbarqueInicio: "",
      dataEmbarqueFim: "",
      dataDesembarqueInicio: "",
      dataDesembarqueFim: "",
      situacaoPedido: "",
      grupo: "",
      referenciaExportador: "",
      referenciaImportador: "",
      page: 1,
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder,
    });
  };

  const getActiveFilters = () => {
    const active = [];
    
    if (filters.pedidoOuAno) {
      active.push({
        key: "pedidoOuAno",
        label: `Pedido/Ano: ${filters.pedidoOuAno}`,
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

    if (filters.notify) {
      active.push({
        key: "notify",
        label: `Notify: ${filters.notify}`,
      });
    }

    if (filters.portoEmbarque) {
      active.push({
        key: "portoEmbarque",
        label: `Porto Embarque: ${filters.portoEmbarque}`,
      });
    }

    if (filters.portoDesembarque) {
      active.push({
        key: "portoDesembarque",
        label: `Porto Desembarque: ${filters.portoDesembarque}`,
      });
    }

    if (filters.representante) {
      active.push({
        key: "representante",
        label: `Representante: ${filters.representante}`,
      });
    }

    if (filters.blCrtAwb) {
      active.push({
        key: "blCrtAwb",
        label: `BL/CRT/AWB: ${filters.blCrtAwb}`,
      });
    }

    if (filters.situacaoPedido) {
      const statusLabels = {
        pendente: "Pendente",
        "em-transito": "Em Trânsito",
        entregue: "Entregue",
        cancelado: "Cancelado",
      };
      active.push({
        key: "situacaoPedido",
        label: `Situação: ${statusLabels[filters.situacaoPedido as keyof typeof statusLabels]}`,
      });
    }

    if (filters.grupo) {
      active.push({
        key: "grupo",
        label: `Grupo: ${filters.grupo}`,
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
        label: `Data Pedido: ${filters.dataPedidoInicio} - ${filters.dataPedidoFim}`,
      });
    }

    if (filters.dataEmbarqueInicio && filters.dataEmbarqueFim) {
      active.push({
        key: "dataEmbarque",
        label: `Data Embarque: ${filters.dataEmbarqueInicio} - ${filters.dataEmbarqueFim}`,
      });
    }

    if (filters.dataDesembarqueInicio && filters.dataDesembarqueFim) {
      active.push({
        key: "dataDesembarque",
        label: `Data Desembarque: ${filters.dataDesembarqueInicio} - ${filters.dataDesembarqueFim}`,
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
              placeholder="Pedido ou Ano..."
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
              <SelectValue placeholder="Importador" />
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

          {/* Situação Pedido */}
          <Select value={filters.situacaoPedido || "all"} onValueChange={(value) => handleFilterChange("situacaoPedido", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Situação Pedido" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as situações</SelectItem>
              <SelectItem value="pendente">Pendente</SelectItem>
              <SelectItem value="em-transito">Em Trânsito</SelectItem>
              <SelectItem value="entregue">Entregue</SelectItem>
              <SelectItem value="cancelado">Cancelado</SelectItem>
            </SelectContent>
          </Select>
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
                Filtros Avançados de Embarque
              </span>
              <span className="text-xs text-gray-500">
                {isExpanded ? "Ocultar" : "Mostrar"}
              </span>
            </Button>
          </CollapsibleTrigger>
          
          <CollapsibleContent className="space-y-4 mt-4">
            {/* Shipping Info Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                placeholder="Notify"
                value={filters.notify}
                onChange={(e) => handleFilterChange("notify", e.target.value)}
              />
              <Input
                placeholder="Porto de Embarque"
                value={filters.portoEmbarque}
                onChange={(e) => handleFilterChange("portoEmbarque", e.target.value)}
              />
              <Input
                placeholder="Porto de Desembarque"
                value={filters.portoDesembarque}
                onChange={(e) => handleFilterChange("portoDesembarque", e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                placeholder="Representante"
                value={filters.representante}
                onChange={(e) => handleFilterChange("representante", e.target.value)}
              />
              <Input
                placeholder="BL/CRT/AWB"
                value={filters.blCrtAwb}
                onChange={(e) => handleFilterChange("blCrtAwb", e.target.value)}
              />
              <Input
                placeholder="Grupo"
                value={filters.grupo}
                onChange={(e) => handleFilterChange("grupo", e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                placeholder="Referência Exportador"
                value={filters.referenciaExportador}
                onChange={(e) => handleFilterChange("referenciaExportador", e.target.value)}
              />
              <Input
                placeholder="Referência Importador"
                value={filters.referenciaImportador}
                onChange={(e) => handleFilterChange("referenciaImportador", e.target.value)}
              />
            </div>

            {/* Date Range Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center">
                  <Calendar className="mr-2 h-4 w-4" />
                  Data do Pedido
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
                    placeholder="Até"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center">
                  <Calendar className="mr-2 h-4 w-4" />
                  Data de Embarque
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
                    placeholder="Até"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center">
                  <Calendar className="mr-2 h-4 w-4" />
                  Data de Desembarque
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="date"
                    value={filters.dataDesembarqueInicio}
                    onChange={(e) => handleFilterChange("dataDesembarqueInicio", e.target.value)}
                    placeholder="De"
                  />
                  <Input
                    type="date"
                    value={filters.dataDesembarqueFim}
                    onChange={(e) => handleFilterChange("dataDesembarqueFim", e.target.value)}
                    placeholder="Até"
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
              <span className="text-sm text-gray-600 font-medium">Filtros ativos:</span>
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
                    } else if (filter.key === "dataDesembarque") {
                      removeFilter("dataDesembarqueInicio");
                      removeFilter("dataDesembarqueFim");
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
                Limpar todos
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}