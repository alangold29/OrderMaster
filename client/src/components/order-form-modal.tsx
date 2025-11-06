import { useState, useMemo, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertOrderSchema, type InsertOrder, type OrderWithRelations } from "@shared/schema";
import { X, CheckCircle2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface OrderFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  order?: OrderWithRelations;
}

export default function OrderFormModal({ isOpen, onClose, order }: OrderFormModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [openExporter, setOpenExporter] = useState(false);
  const [openImporter, setOpenImporter] = useState(false);
  const [openClient, setOpenClient] = useState(false);
  const [openProducer, setOpenProducer] = useState(false);

  const isEditMode = !!order;

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
      itens: "",
      precoGuia: "",
      totalGuia: "",
      moeda: "BRL",
      referenciaExportador: "",
      referenciaImportador: "",
      etiqueta: "",
      portoEmbarque: "",
      portoDestino: "",
      viaTransporte: "",
      incoterm: "",
      condicao: "",
      embarque: "",
      previsao: "",
      chegada: "",
      observacao: "",
      situacao: "pendiente",
      semana: "",
    },
  });

  // Update form when order changes
  useEffect(() => {
    if (order && isOpen) {
      form.reset({
        pedido: order.pedido || "",
        data: order.data || "",
        exporterName: order.exporter?.name || "",
        importerName: order.importer?.name || "",
        clientName: order.client?.name || "",
        producerName: order.producer?.name || "",
        quantidade: order.quantidade?.toString() || "",
        itens: order.itens || "",
        precoGuia: order.precoGuia?.toString() || "",
        totalGuia: order.totalGuia?.toString() || "",
        moeda: order.moeda || "BRL",
        referenciaExportador: order.referenciaExportador || "",
        referenciaImportador: order.referenciaImportador || "",
        etiqueta: order.etiqueta || "",
        portoEmbarque: order.portoEmbarque || "",
        portoDestino: order.portoDestino || "",
        viaTransporte: order.viaTransporte || "",
        incoterm: order.incoterm || "",
        condicao: order.condicao || "",
        embarque: order.embarque || "",
        previsao: order.previsao || "",
        chegada: order.chegada || "",
        observacao: order.observacao || "",
        situacao: order.situacao || "pendiente",
        semana: order.semana || "",
      });
    } else if (!isOpen) {
      form.reset({
        pedido: "",
        data: "",
        exporterName: "",
        importerName: "",
        clientName: "",
        producerName: "",
        quantidade: "",
        itens: "",
        precoGuia: "",
        totalGuia: "",
        moeda: "BRL",
        referenciaExportador: "",
        referenciaImportador: "",
        etiqueta: "",
        portoEmbarque: "",
        portoDestino: "",
        viaTransporte: "",
        incoterm: "",
        condicao: "",
        embarque: "",
        previsao: "",
        chegada: "",
        observacao: "",
        situacao: "pendiente",
        semana: "",
      });
    }
  }, [order, isOpen, form]);

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

  const updateOrderMutation = useMutation({
    mutationFn: async (data: InsertOrder) => {
      const response = await apiRequest("PUT", `/api/orders/${order!.id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "Pedido atualizado com sucesso!",
        description: "As alterações foram salvas.",
        duration: 4000,
      });
      onClose();
    },
    onError: (error: any) => {
      console.error("Error updating order:", error);
      toast({
        title: "Erro ao atualizar pedido",
        description: error.message || "Erro ao atualizar o pedido.",
        variant: "destructive",
        duration: 6000,
      });
    },
  });

  const onSubmit = (data: InsertOrder) => {
    if (isEditMode) {
      updateOrderMutation.mutate(data);
    } else {
      createOrderMutation.mutate(data);
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{isEditMode ? "Editar Pedido" : "Novo Pedido"}</span>
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
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="basic">Datos Básicos</TabsTrigger>
                <TabsTrigger value="parties">Partes</TabsTrigger>
                <TabsTrigger value="logistics">Logística</TabsTrigger>
                <TabsTrigger value="additional">Adicional</TabsTrigger>
              </TabsList>

              {/* TAB 1: BASIC DATA */}
              <TabsContent value="basic" className="space-y-4">
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
                        <FormLabel>Fecha *</FormLabel>
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
                        <FormLabel>Situación *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || ""}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="pendiente">Pendiente</SelectItem>
                            <SelectItem value="transito">En Tránsito</SelectItem>
                            <SelectItem value="entregado">Entregado</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="moeda"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Moneda *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || ""}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccione moneda..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="BRL">BRL - Real Brasileño</SelectItem>
                            <SelectItem value="USD">USD - Dólar Estadounidense</SelectItem>
                            <SelectItem value="EUR">EUR - Euro</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="quantidade"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cantidad *</FormLabel>
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
                    name="precoGuia"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Precio Guía</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" placeholder="0.00" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="totalGuia"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Total Guía</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" placeholder="0.00" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="itens"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Items/Productos</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Descripción de los items..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              {/* TAB 2: PARTIES */}
              <TabsContent value="parties" className="space-y-4">
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
                                {field.value || "Seleccione o escriba..."}
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-full p-0">
                            <Command>
                              <CommandInput
                                placeholder="Buscar o crear exportador..."
                                onValueChange={(value) => field.onChange(value)}
                              />
                              <CommandList>
                                <CommandEmpty>Ningún exportador encontrado.</CommandEmpty>
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
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="referenciaExportador"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Referencia Exportador</FormLabel>
                        <FormControl>
                          <Input placeholder="Ref. exportador" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                {field.value || "Seleccione o escriba..."}
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-full p-0">
                            <Command>
                              <CommandInput
                                placeholder="Buscar o crear importador..."
                                onValueChange={(value) => field.onChange(value)}
                              />
                              <CommandList>
                                <CommandEmpty>Ningún importador encontrado.</CommandEmpty>
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
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="referenciaImportador"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Referencia Importador</FormLabel>
                        <FormControl>
                          <Input placeholder="Ref. importador" {...field} />
                        </FormControl>
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
                                {field.value || "Seleccione o escriba..."}
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-full p-0">
                            <Command>
                              <CommandInput
                                placeholder="Buscar o crear cliente..."
                                onValueChange={(value) => field.onChange(value)}
                              />
                              <CommandList>
                                <CommandEmpty>Ningún cliente encontrado.</CommandEmpty>
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
                              </CommandList>
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
                        <FormLabel>Productor</FormLabel>
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
                                {field.value || "Seleccione o escriba..."}
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-full p-0">
                            <Command>
                              <CommandInput
                                placeholder="Buscar o crear productor..."
                                onValueChange={(value) => field.onChange(value || "")}
                              />
                              <CommandList>
                                <CommandEmpty>Ningún productor encontrado.</CommandEmpty>
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
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>

              {/* TAB 3: LOGISTICS */}
              <TabsContent value="logistics" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="portoEmbarque"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Puerto de Embarque</FormLabel>
                        <FormControl>
                          <Input placeholder="Puerto origen" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="portoDestino"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Puerto de Destino</FormLabel>
                        <FormControl>
                          <Input placeholder="Puerto destino" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="embarque"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fecha Embarque</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="previsao"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fecha Previsión</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="chegada"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fecha Llegada</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="viaTransporte"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vía de Transporte</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || ""}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccione vía..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="">Sin especificar</SelectItem>
                            <SelectItem value="terrestre">Terrestre</SelectItem>
                            <SelectItem value="maritimo">Marítimo</SelectItem>
                            <SelectItem value="aereo">Aéreo</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="incoterm"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Incoterm</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || ""}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccione incoterm..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="">Sin especificar</SelectItem>
                            <SelectItem value="CIF">CIF - Cost, Insurance and Freight</SelectItem>
                            <SelectItem value="FOB">FOB - Free On Board</SelectItem>
                            <SelectItem value="FCA">FCA - Free Carrier</SelectItem>
                            <SelectItem value="CFR">CFR - Cost and Freight</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="condicao"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Condición de Pago</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej: 30 días, contado..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="semana"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Semana</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej: W01, W02..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>

              {/* TAB 4: ADDITIONAL */}
              <TabsContent value="additional" className="space-y-4">
                <FormField
                  control={form.control}
                  name="etiqueta"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Etiqueta</FormLabel>
                      <FormControl>
                        <Input placeholder="Etiqueta del pedido" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="observacao"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Observaciones</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Notas adicionales sobre el pedido..."
                          className="min-h-32"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
            </Tabs>

            <div className="flex justify-end space-x-3 pt-6 border-t">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={createOrderMutation.isPending || updateOrderMutation.isPending}
                className="min-w-[120px]"
              >
                {createOrderMutation.isPending || updateOrderMutation.isPending
                  ? isEditMode ? "Guardando..." : "Creando..."
                  : isEditMode ? "Guardar Cambios" : "Crear Pedido"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
