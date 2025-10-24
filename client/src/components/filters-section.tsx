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
    clienteRede: string;
    representante: string;
    produto: string;
    referenciaExportador: string;
    referenciaImportador: string;
    clienteFinal: string;
    grupo: string;
    paisExportador: string;
    dataEmissaoInicio: string;
    dataEmissaoFim: string;
    dataEmbarqueInicio: string;
    dataEmbarqueFim: string;
    page: number;
    sortBy: string;
    sortOrder: "asc" | "desc";
  };
  onFiltersChange: (filters: any) => void;
}

export default function FiltersSection({ filters, onFiltersChange }: FiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const { data: clients } = useQuery<any[]>({ queryKey: ["/api/clients"] });
  const { data: exporters } = useQuery<any[]>({ queryKey: ["/api/exporters"] });
  const { data: importers } = useQuery<any[]>({ queryKey: ["/api/importers"] });
  const { data: producers } = useQuery<any[]>({ queryKey: ["/api/producers"] });

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
      search: "",
      clientId: "",
      exporterId: "",
      importerId: "",
      producerId: "",
      situacao: "",
      clienteRede: "",
      representante: "",
      produto: "",
      referenciaExportador: "",
      referenciaImportador: "",
      clienteFinal: "",
      grupo: "",
      paisExportador: "",
      dataEmissaoInicio: "",
      dataEmissaoFim: "",
      dataEmbarqueInicio: "",
      dataEmbarqueFim: "",
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
        pendente: "Pendente",
        "em-transito": "Em Trânsito",
        entregue: "Entregue",
        cancelado: "Cancelado",
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

    if (filters.clienteRede) {
      active.push({
        key: "clienteRede",
        label: `Cliente Rede: ${filters.clienteRede}`,
      });
    }

    if (filters.representante) {
      active.push({
        key: "representante",
        label: `Representante: ${filters.representante}`,
      });
    }

    if (filters.produto) {
      active.push({
        key: "produto",
        label: `Produto: ${filters.produto}`,
      });
    }

    if (filters.grupo) {
      active.push({
        key: "grupo",
        label: `Grupo: ${filters.grupo}`,
      });
    }

    if (filters.paisExportador) {
      active.push({
        key: "paisExportador",
        label: `País: ${filters.paisExportador}`,
      });
    }

    if (filters.dataEmissaoInicio && filters.dataEmissaoFim) {
      active.push({
        key: "dataEmissao",
        label: `Data Emissão: ${filters.dataEmissaoInicio} - ${filters.dataEmissaoFim}`,
      });
    }

    if (filters.dataEmbarqueInicio && filters.dataEmbarqueFim) {
      active.push({
        key: "dataEmbarque",
        label: `Data Embarque: ${filters.dataEmbarqueInicio} - ${filters.dataEmbarqueFim}`,
      });
    }
    
    return active;
  };

  const activeFilters = getActiveFilters();

  return (
    <Card className="bg-surface border border-gray-200">
      <CardContent className="p-6">
        {/* Basic Filters - Always Visible */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
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
              <SelectValue placeholder="Situação" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as situações</SelectItem>
              <SelectItem value="pendente">Pendente</SelectItem>
              <SelectItem value="em-transito">Em Trânsito</SelectItem>
              <SelectItem value="entregue">Entregue</SelectItem>
              <SelectItem value="cancelado">Cancelado</SelectItem>
            </SelectContent>
          </Select>

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
              className="w-full mb-4 justify-between"
            >
              <span className="flex items-center">
                <Filter className="mr-2 h-4 w-4" />
                Filtros Avançados
              </span>
              <span className="text-xs text-gray-500">
                {isExpanded ? "Ocultar" : "Mostrar"}
              </span>
            </Button>
          </CollapsibleTrigger>
          
          <CollapsibleContent className="space-y-4">
            {/* Advanced Text Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                placeholder="Cliente Rede"
                value={filters.clienteRede}
                onChange={(e) => handleFilterChange("clienteRede", e.target.value)}
              />
              <Input
                placeholder="Representante"
                value={filters.representante}
                onChange={(e) => handleFilterChange("representante", e.target.value)}
              />
              <Input
                placeholder="Produto"
                value={filters.produto}
                onChange={(e) => handleFilterChange("produto", e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              <Input
                placeholder="Cliente Final"
                value={filters.clienteFinal}
                onChange={(e) => handleFilterChange("clienteFinal", e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                placeholder="Grupo"
                value={filters.grupo}
                onChange={(e) => handleFilterChange("grupo", e.target.value)}
              />
              <Input
                placeholder="País Exportador"
                value={filters.paisExportador}
                onChange={(e) => handleFilterChange("paisExportador", e.target.value)}
              />
            </div>

            {/* Date Range Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center">
                  <Calendar className="mr-2 h-4 w-4" />
                  Data de Emissão
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="date"
                    value={filters.dataEmissaoInicio}
                    onChange={(e) => handleFilterChange("dataEmissaoInicio", e.target.value)}
                    placeholder="De"
                  />
                  <Input
                    type="date"
                    value={filters.dataEmissaoFim}
                    onChange={(e) => handleFilterChange("dataEmissaoFim", e.target.value)}
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
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Active Filters */}
        {activeFilters.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-gray-600 font-medium">Filtros ativos:</span>
              {activeFilters.map((filter) => (
                <Badge
                  key={filter.key}
                  variant="secondary"
                  className="bg-blue-100 text-blue-800 hover:bg-blue-200 cursor-pointer"
                  onClick={() => {
                    if (filter.key === "dataEmissao") {
                      removeFilter("dataEmissaoInicio");
                      removeFilter("dataEmissaoFim");
                    } else if (filter.key === "dataEmbarque") {
                      removeFilter("dataEmbarqueInicio");
                      removeFilter("dataEmbarqueFim");
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