import { useState, useMemo } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertOrderSchema, type InsertOrder } from "@shared/schema";
import { X, CheckCircle2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  const [openClient, setOpenClient] = useState(false);
  const [openProducer, setOpenProducer] = useState(false);

  const form = useForm<InsertOrder>({
    resolver: zodResolver(insertOrderSchema),
    defaultValues: {
      pedido: "",
      data: "",
      exporterName: "",
      importerName: "",
      clientName: "",
      producerName: "",
      quantidade: "",
      referenciaExportador: "",
      referenciaImportador: "",
      situacao: "pendente",
    },
  });

  const { data: exporters } = useQuery<any[]>({
    queryKey: ["/api/exporters"],
  });

  const { data: importers } = useQuery<any[]>({
    queryKey: ["/api/importers"],
  });

  const { data: clients } = useQuery<any[]>({
    queryKey: ["/api/clients"],
  });

  const { data: producers } = useQuery<any[]>({
    queryKey: ["/api/producers"],
  });

  const exportersList = useMemo(() => {
    return exporters?.filter((e: any) => e.name && e.name.trim() !== "") || [];
  }, [exporters]);

  const importersList = useMemo(() => {
    return importers?.filter((i: any) => i.name && i.name.trim() !== "") || [];
  }, [importers]);

  const clientsList = useMemo(() => {
    return clients?.filter((c: any) => c.name && c.name.trim() !== "") || [];
  }, [clients]);

  const producersList = useMemo(() => {
    return producers?.filter((p: any) => p.name && p.name.trim() !== "") || [];
  }, [producers]);

  const createOrderMutation = useMutation({
    mutationFn: async (data: InsertOrder) => {
      const response = await apiRequest("POST", "/api/orders", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "Pedido criado com sucesso!",
        description: "O pedido foi adicionado ao sistema.",
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

  const onSubmit = (data: InsertOrder) => {
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="pedido"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pedido *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: 01123/24" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="data"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="quantidade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantidade *</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="clientName"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Cliente *</FormLabel>
                    <Popover open={openClient} onOpenChange={setOpenClient}>
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
                            {field.value || "Selecione ou digite um cliente..."}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput
                            placeholder="Buscar ou criar cliente..."
                            onValueChange={(value) => field.onChange(value)}
                          />
                          <CommandEmpty>Nenhum cliente encontrado.</CommandEmpty>
                          <CommandGroup>
                            {clientsList.map((client: any) => (
                              <CommandItem
                                key={client.id}
                                value={client.name}
                                onSelect={() => {
                                  field.onChange(client.name);
                                  setOpenClient(false);
                                }}
                              >
                                <CheckCircle2
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    field.value === client.name ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                {client.name}
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
                name="producerName"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Produtor</FormLabel>
                    <Popover open={openProducer} onOpenChange={setOpenProducer}>
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
                            {field.value || "Selecione ou digite um produtor..."}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput
                            placeholder="Buscar ou criar produtor..."
                            onValueChange={(value) => field.onChange(value)}
                          />
                          <CommandEmpty>Nenhum produtor encontrado.</CommandEmpty>
                          <CommandGroup>
                            {producersList.map((producer: any) => (
                              <CommandItem
                                key={producer.id}
                                value={producer.name}
                                onSelect={() => {
                                  field.onChange(producer.name);
                                  setOpenProducer(false);
                                }}
                              >
                                <CheckCircle2
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    field.value === producer.name ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                {producer.name}
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
                      <SelectItem value="quitado">Quitado</SelectItem>
                      <SelectItem value="cancelado">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

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
