import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Search, Filter } from "lucide-react";

type FilterState = {
  pedidoOuAno: string;
  exportador: string;
  importador: string;
  clienteFinal: string;
  produtor: string;
  notify: string;
  blCrtAwb: string;
  portoEmbarque: string;
  dataPedidoFrom: string;
  dataPedidoTo: string;
  dataEmbarqueFrom: string;
  dataEmbarqueTo: string;
  situacaoPedidos: string;
  checkpoint: string;
  invoiceNormal: string;
  referenciaExportador: string;
  referenciaImportador: string;
  mercadoInterno: string;
  consignatario: string;
  armador: string;
  container: string;
  portoDesembarque: string;
  dataDesembarqueFrom: string;
  dataDesembarqueTo: string;
  grupo: string;
  familia: string;
};

const initialFilters: FilterState = {
  pedidoOuAno: "",
  exportador: "",
  importador: "",
  clienteFinal: "",
  produtor: "",
  notify: "",
  blCrtAwb: "",
  portoEmbarque: "",
  dataPedidoFrom: "",
  dataPedidoTo: "",
  dataEmbarqueFrom: "",
  dataEmbarqueTo: "",
  situacaoPedidos: "indiferente",
  checkpoint: "",
  invoiceNormal: "",
  referenciaExportador: "",
  referenciaImportador: "",
  mercadoInterno: "",
  consignatario: "",
  armador: "",
  container: "",
  portoDesembarque: "",
  dataDesembarqueFrom: "",
  dataDesembarqueTo: "",
  grupo: "",
  familia: "",
};

export default function Embarques() {
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [isFiltering, setIsFiltering] = useState(false);

  // Get data for dropdowns
  const { data: clients = [] } = useQuery({ queryKey: ["/api/clients"] });
  const { data: exporters = [] } = useQuery({ queryKey: ["/api/exporters"] });
  const { data: importers = [] } = useQuery({ queryKey: ["/api/importers"] });
  const { data: producers = [] } = useQuery({ queryKey: ["/api/producers"] });

  const handleFilterChange = (field: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleApplyFilters = () => {
    setIsFiltering(true);
    // Aquí implementaremos la lógica de filtrado más tarde
    console.log("Aplicando filtros:", filters);
    setTimeout(() => setIsFiltering(false), 1000); // Simular carga
  };

  const handleClearFilters = () => {
    setFilters(initialFilters);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Embarques</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Embarque - Filtro
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 gap-8">
            {/* Columna Izquierda */}
            <div className="grid grid-cols-1 gap-3">
              {/* Primera fila de campos de la columna izquierda */}
              <div className="grid grid-cols-4 gap-2">
                <div className="space-y-1">
                  <Label htmlFor="pedido-ano" className="text-sm">Pedido ou ano:</Label>
                  <Input
                    id="pedido-ano"
                    placeholder="(nnnn/aa ou /aa)"
                    value={filters.pedidoOuAno}
                    onChange={(e) => handleFilterChange("pedidoOuAno", e.target.value)}
                    className="h-7"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="exportador" className="text-sm">Exportador:</Label>
                  <Select value={filters.exportador} onValueChange={(value) => handleFilterChange("exportador", value)}>
                    <SelectTrigger className="h-7">
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                      {exporters.map((exporter: any) => (
                        <SelectItem key={exporter.id} value={exporter.id}>
                          {exporter.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="importador" className="text-sm">Importador:</Label>
                  <Select value={filters.importador} onValueChange={(value) => handleFilterChange("importador", value)}>
                    <SelectTrigger className="h-7">
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                      {importers.map((importer: any) => (
                        <SelectItem key={importer.id} value={importer.id}>
                          {importer.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="cliente-final" className="text-sm">Cliente Final:</Label>
                  <Select value={filters.clienteFinal} onValueChange={(value) => handleFilterChange("clienteFinal", value)}>
                    <SelectTrigger className="h-7">
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                      {clients.map((client: any) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2">
                <div className="space-y-1">
                  <Label htmlFor="produtor" className="text-sm">Produtor:</Label>
                  <Select value={filters.produtor} onValueChange={(value) => handleFilterChange("produtor", value)}>
                    <SelectTrigger className="h-7">
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                      {producers.map((producer: any) => (
                        <SelectItem key={producer.id} value={producer.id}>
                          {producer.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="notify" className="text-sm">Notify:</Label>
                  <Select value={filters.notify} onValueChange={(value) => handleFilterChange("notify", value)}>
                    <SelectTrigger className="h-7">
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="bl-crt-awb" className="text-sm">BL/ CRT / AWB:</Label>
                  <Input
                    id="bl-crt-awb"
                    value={filters.blCrtAwb}
                    onChange={(e) => handleFilterChange("blCrtAwb", e.target.value)}
                    className="h-7"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="porto-embarque" className="text-sm">Porto de embarque:</Label>
                  <Select value={filters.portoEmbarque} onValueChange={(value) => handleFilterChange("portoEmbarque", value)}>
                    <SelectTrigger className="h-7">
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {/* Segunda fila de campos de la columna izquierda */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-sm">Data do pedido de:</Label>
                  <div className="flex items-center gap-1">
                    <Input
                      type="date"
                      value={filters.dataPedidoFrom}
                      onChange={(e) => handleFilterChange("dataPedidoFrom", e.target.value)}
                      className="h-7 text-xs"
                    />
                    <span className="text-xs">a</span>
                    <Input
                      type="date"
                      value={filters.dataPedidoTo}
                      onChange={(e) => handleFilterChange("dataPedidoTo", e.target.value)}
                      className="h-7 text-xs"
                    />
                  </div>
                </div>
                
                <div className="space-y-1">
                  <Label className="text-sm">Data embarque de:</Label>
                  <div className="flex items-center gap-1">
                    <Input
                      type="date"
                      value={filters.dataEmbarqueFrom}
                      onChange={(e) => handleFilterChange("dataEmbarqueFrom", e.target.value)}
                      className="h-7 text-xs"
                    />
                    <span className="text-xs">a</span>
                    <Input
                      type="date"
                      value={filters.dataEmbarqueTo}
                      onChange={(e) => handleFilterChange("dataEmbarqueTo", e.target.value)}
                      className="h-7 text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Tercera fila */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-sm">Situação Pedidos:</Label>
                  <RadioGroup 
                    value={filters.situacaoPedidos} 
                    onValueChange={(value) => handleFilterChange("situacaoPedidos", value)}
                    className="flex gap-3"
                  >
                    <div className="flex items-center space-x-1">
                      <RadioGroupItem value="a-desembarcar" id="a-desembarcar" className="h-3 w-3" />
                      <Label htmlFor="a-desembarcar" className="text-xs">A desembarcar</Label>
                    </div>
                    <div className="flex items-center space-x-1">
                      <RadioGroupItem value="desembarcado" id="desembarcado" className="h-3 w-3" />
                      <Label htmlFor="desembarcado" className="text-xs">Desembarcado</Label>
                    </div>
                    <div className="flex items-center space-x-1">
                      <RadioGroupItem value="indiferente" id="indiferente" className="h-3 w-3" />
                      <Label htmlFor="indiferente" className="text-xs">Indiferente</Label>
                    </div>
                  </RadioGroup>
                </div>
                
                <div className="space-y-1">
                  <Label htmlFor="checkpoint" className="text-sm">Checkpoint:</Label>
                  <Select value={filters.checkpoint} onValueChange={(value) => handleFilterChange("checkpoint", value)}>
                    <SelectTrigger className="h-7">
                      <SelectValue placeholder="Indiferente" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="indiferente">Indiferente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Columna Derecha */}
            <div className="grid grid-cols-1 gap-3">
              {/* Primera fila de campos de la columna derecha */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label htmlFor="invoice-normal" className="text-sm">Invoice Normal ou TH:</Label>
                  <Input
                    id="invoice-normal"
                    value={filters.invoiceNormal}
                    onChange={(e) => handleFilterChange("invoiceNormal", e.target.value)}
                    className="h-7"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="ref-exportador" className="text-sm">Referência Exportador:</Label>
                  <Input
                    id="ref-exportador"
                    value={filters.referenciaExportador}
                    onChange={(e) => handleFilterChange("referenciaExportador", e.target.value)}
                    className="h-7"
                  />
                </div>
              </div>

              {/* Segunda fila */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label htmlFor="ref-importador" className="text-sm">Referência Importador:</Label>
                  <Input
                    id="ref-importador"
                    value={filters.referenciaImportador}
                    onChange={(e) => handleFilterChange("referenciaImportador", e.target.value)}
                    className="h-7"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="mercado-interno" className="text-sm">Mercado interno:</Label>
                  <Select value={filters.mercadoInterno} onValueChange={(value) => handleFilterChange("mercadoInterno", value)}>
                    <SelectTrigger className="h-7">
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Tercera fila */}
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <Label htmlFor="consignatario" className="text-sm">Consignatário:</Label>
                  <Select value={filters.consignatario} onValueChange={(value) => handleFilterChange("consignatario", value)}>
                    <SelectTrigger className="h-7">
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="armador" className="text-sm">Armador:</Label>
                  <Select value={filters.armador} onValueChange={(value) => handleFilterChange("armador", value)}>
                    <SelectTrigger className="h-7">
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="container" className="text-sm">Container:</Label>
                  <Input
                    id="container"
                    value={filters.container}
                    onChange={(e) => handleFilterChange("container", e.target.value)}
                    className="h-7"
                  />
                </div>
              </div>

              {/* Cuarta fila */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label htmlFor="porto-desembarque" className="text-sm">Porto de desembarque:</Label>
                  <Select value={filters.portoDesembarque} onValueChange={(value) => handleFilterChange("portoDesembarque", value)}>
                    <SelectTrigger className="h-7">
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="text-sm">Data desembarque de:</Label>
                  <div className="flex items-center gap-1">
                    <Input
                      type="date"
                      value={filters.dataDesembarqueFrom}
                      onChange={(e) => handleFilterChange("dataDesembarqueFrom", e.target.value)}
                      className="h-7 text-xs"
                    />
                    <span className="text-xs">a</span>
                    <Input
                      type="date"
                      value={filters.dataDesembarqueTo}
                      onChange={(e) => handleFilterChange("dataDesembarqueTo", e.target.value)}
                      className="h-7 text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Quinta fila */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label htmlFor="grupo" className="text-sm">Grupo:</Label>
                  <Select value={filters.grupo} onValueChange={(value) => handleFilterChange("grupo", value)}>
                    <SelectTrigger className="h-7">
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="familia" className="text-sm">Família:</Label>
                  <Select value={filters.familia} onValueChange={(value) => handleFilterChange("familia", value)}>
                    <SelectTrigger className="h-7">
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          {/* Botões de ação */}
          <div className="flex gap-3 pt-2 mt-2 border-t">
            <Button 
              onClick={handleApplyFilters}
              className="gap-2 h-7"
              disabled={isFiltering}
              size="sm"
            >
              <Search className="h-4 w-4" />
              {isFiltering ? "Aplicando..." : "Aplicar Filtro"}
            </Button>
            <Button 
              variant="outline" 
              onClick={handleClearFilters}
              className="h-7"
              size="sm"
            >
              Limpar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Área para resultados filtrados */}
      <Card>
        <CardHeader>
          <CardTitle>Resultados dos Embarques</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-lg">Selecione os filtros acima e clique em "Aplicar Filtro" para ver os embarques.</p>
            <p className="text-sm mt-2">A lógica de dados será implementada na próxima etapa.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}