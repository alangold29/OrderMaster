import { useQuery } from "@tanstack/react-query";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface FiltersProps {
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

export default function FiltersSection({ filters, onFiltersChange }: FiltersProps) {
  const { data: clients } = useQuery({ queryKey: ["/api/clients"] });
  const { data: exporters } = useQuery({ queryKey: ["/api/exporters"] });
  const { data: importers } = useQuery({ queryKey: ["/api/importers"] });
  const { data: producers } = useQuery({ queryKey: ["/api/producers"] });

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

  const getActiveFilters = () => {
    const active = [];
    
    if (filters.situacao) {
      const statusLabels = {
        pendente: "Pendente",
        "em-transito": "Em Trânsito",
        entregue: "Entregue",
        quitado: "Quitado",
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
    
    return active;
  };

  return (
    <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <div className="relative">
          <Input
            type="text"
            placeholder="Buscar por pedido, cliente, referência..."
            value={filters.search}
            onChange={(e) => handleFilterChange("search", e.target.value)}
            className="pl-10"
          />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-text-secondary" />
        </div>
        
        <Select value={filters.situacao || "all"} onValueChange={(value) => handleFilterChange("situacao", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Todas as Situações" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as Situações</SelectItem>
            <SelectItem value="pendente">Pendente</SelectItem>
            <SelectItem value="em-transito">Em Trânsito</SelectItem>
            <SelectItem value="entregue">Entregue</SelectItem>
            <SelectItem value="quitado">Quitado</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={filters.clientId || "all"} onValueChange={(value) => handleFilterChange("clientId", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Todos os Clientes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Clientes</SelectItem>
            {clients?.map((client: any) => (
              <SelectItem key={client.id} value={client.id}>
                {client.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select value={filters.exporterId || "all"} onValueChange={(value) => handleFilterChange("exporterId", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Todos os Exportadores" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Exportadores</SelectItem>
            {exporters?.map((exporter: any) => (
              <SelectItem key={exporter.id} value={exporter.id}>
                {exporter.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {getActiveFilters().map((filter) => (
          <Badge
            key={filter.key}
            variant="secondary"
            className="bg-primary/10 text-primary hover:bg-primary/20"
          >
            {filter.label}
            <Button
              variant="ghost"
              size="sm"
              className="ml-2 h-auto p-0 text-primary hover:text-primary/80"
              onClick={() => removeFilter(filter.key)}
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        ))}
      </div>
    </div>
  );
}
