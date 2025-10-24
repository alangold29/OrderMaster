import { useState, useMemo } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { manualOrderSchema, type ManualOrder } from "@shared/schema";
import { X, CheckCircle2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface OrderFormModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function OrderFormModal({ isOpen, onClose }: OrderFormModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [openExporter, setOpenExporter] = useState(false);
  const [openImporter, setOpenImporter] = useState(false);
  
  const form = useForm<ManualOrder>({
    resolver: zodResolver(manualOrderSchema),
    defaultValues: {
      exporterName: "",
      importerName: "",
      clienteRede: "",
      representante: "",
      produto: "",
      dataEmissaoPedido: "",
      situacao: "pendente",
      pedido: "",
      referenciaExportador: "",
      referenciaImportador: "",
      clienteFinal: "",
      dataEmbarqueDe: "",
      grupo: "",
      paisExportador: "",
    },
  });

  const { data: exporters, isLoading: loadingExporters } = useQuery<any[]>({
    queryKey: ["/api/exporters"],
  });

  const { data: importers, isLoading: loadingImporters } = useQuery<any[]>({
    queryKey: ["/api/importers"],
  });

  const exportersList = useMemo(() => {
    return exporters?.filter((e: any) => e.name && e.name.trim() !== "") || [];
  }, [exporters]);

  const importersList = useMemo(() => {
    return importers?.filter((i: any) => i.name && i.name.trim() !== "") || [];
  }, [importers]);

  const createOrderMutation = useMutation({
    mutationFn: async (data: ManualOrder) => {
      const response = await apiRequest("POST", "/api/orders", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/exporters"] });
      queryClient.invalidateQueries({ queryKey: ["/api/importers"] });
      toast({
        title: "Pedido criado com sucesso!",
        description: `O pedido foi adicionado ao sistema e está visível em todas as seções.`,
        duration: 4000,
      });
      form.reset();
      onClose();
    },
    onError: (error: any) => {
      console.error("Error creating order:", error);
      const errorMessage = error.message || "Erro ao criar pedido";
      toast({
        title: "Erro ao criar pedido",
        description: errorMessage.includes("unique")
          ? "Já existe um pedido com este número. Por favor, use um número diferente."
          : errorMessage,
        variant: "destructive",
        duration: 6000,
      });
    },
  });

  const onSubmit = (data: ManualOrder) => {
    createOrderMutation.mutate(data);
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Novo Pedido</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Primera fila - Información básica */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="pedido"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pedido ou ano *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: 2024/001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dataEmissaoPedido"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de emissão do pedido *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="situacao"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Situação *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="pendente">Pendente</SelectItem>
                        <SelectItem value="em-transito">Em Trânsito</SelectItem>
                        <SelectItem value="entregue">Entregue</SelectItem>
                        <SelectItem value="cancelado">Cancelado</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Segunda fila - Exportador e Importador */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="exporterName"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Exportador *</FormLabel>
                    <Popover open={openExporter} onOpenChange={setOpenExporter}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            className={cn(
                              "w-full justify-between",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value || "Selecione ou digite um exportador..."}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput
                            placeholder="Buscar ou criar exportador..."
                            onValueChange={(value) => field.onChange(value)}
                          />
                          <CommandEmpty>Nenhum exportador encontrado.</CommandEmpty>
                          <CommandGroup>
                            {exportersList.map((exporter: any) => (
                              <CommandItem
                                key={exporter.id}
                                value={exporter.name}
                                onSelect={() => {
                                  field.onChange(exporter.name);
                                  setOpenExporter(false);
                                }}
                              >
                                <CheckCircle2
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    field.value === exporter.name ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                {exporter.name}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="importerName"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Importador *</FormLabel>
                    <Popover open={openImporter} onOpenChange={setOpenImporter}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            className={cn(
                              "w-full justify-between",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value || "Selecione ou digite um importador..."}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput
                            placeholder="Buscar ou criar importador..."
                            onValueChange={(value) => field.onChange(value)}
                          />
                          <CommandEmpty>Nenhum importador encontrado.</CommandEmpty>
                          <CommandGroup>
                            {importersList.map((importer: any) => (
                              <CommandItem
                                key={importer.id}
                                value={importer.name}
                                onSelect={() => {
                                  field.onChange(importer.name);
                                  setOpenImporter(false);
                                }}
                              >
                                <CheckCircle2
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    field.value === importer.name ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                {importer.name}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Tercera fila - Cliente e Representante */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="clienteRede"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cliente Rede</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome do cliente rede" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="representante"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Representante</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome do representante" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Cuarta fila - Produto e Cliente Final */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="produto"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Produto *</FormLabel>
                    <FormControl>
                      <Input placeholder="Descrição do produto" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="clienteFinal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cliente Final</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome do cliente final" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Quinta fila - Referencias */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="referenciaExportador"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Referência Exportador</FormLabel>
                    <FormControl>
                      <Input placeholder="Referência do exportador" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="referenciaImportador"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Referência Importador</FormLabel>
                    <FormControl>
                      <Input placeholder="Referência do importador" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Sexta fila - Data embarque e Grupo */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="dataEmbarqueDe"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de embarque de</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="grupo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Grupo</FormLabel>
                    <FormControl>
                      <Input placeholder="Grupo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="paisExportador"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>País Exportador</FormLabel>
                    <FormControl>
                      <Input placeholder="País de origem" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Buttons */}
            <div className="flex justify-end space-x-3 pt-6">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={createOrderMutation.isPending}
                className="min-w-[100px]"
              >
                {createOrderMutation.isPending ? "Criando..." : "Criar Pedido"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}