import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const orderSchema = z.object({
  pedido: z.string().min(1, "Pedido é obrigatório"),
  data: z.string().min(1, "Data é obrigatória"),
  clientName: z.string().min(1, "Cliente é obrigatório"),
  exporterName: z.string().min(1, "Exportador é obrigatório"),
  referenciaExportador: z.string().optional(),
  importerName: z.string().min(1, "Importador é obrigatório"),
  referenciaImportador: z.string().optional(),
  producerName: z.string().optional(),
  quantidade: z.string().min(1, "Quantidade é obrigatória"),
  itens: z.string().optional(),
  precoGuia: z.string().optional(),
  totalGuia: z.string().optional(),
  etiqueta: z.string().optional(),
  portoEmbarque: z.string().optional(),
  portoDestino: z.string().optional(),
  condicao: z.string().optional(),
  embarque: z.string().optional(),
  previsao: z.string().optional(),
  chegada: z.string().optional(),
  observacao: z.string().optional(),
  situacao: z.string().default("pendente"),
  semana: z.string().optional(),
});

type OrderFormData = z.infer<typeof orderSchema>;

interface OrderFormModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function OrderFormModal({ isOpen, onClose }: OrderFormModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const form = useForm<OrderFormData>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      pedido: "",
      data: "",
      clientName: "",
      exporterName: "",
      referenciaExportador: "",
      importerName: "",
      referenciaImportador: "",
      producerName: "",
      quantidade: "",
      itens: "",
      precoGuia: "",
      totalGuia: "",
      etiqueta: "",
      portoEmbarque: "",
      portoDestino: "",
      condicao: "",
      embarque: "",
      previsao: "",
      chegada: "",
      observacao: "",
      situacao: "pendente",
      semana: "",
    },
  });

  const createOrderMutation = useMutation({
    mutationFn: (data: OrderFormData) => apiRequest("POST", "/api/orders", data),
    onSuccess: () => {
      toast({
        title: "Sucesso",
        description: "Pedido criado com sucesso!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      onClose();
      form.reset();
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao criar pedido. Verifique os dados e tente novamente.",
        variant: "destructive",
      });
    },
  });

  const calculateTotal = () => {
    const quantidade = parseFloat(form.watch("quantidade") || "0");
    const precoGuia = parseFloat(form.watch("precoGuia") || "0");
    const total = quantidade * precoGuia;
    form.setValue("totalGuia", total.toFixed(2));
  };

  const onSubmit = (data: OrderFormData) => {
    createOrderMutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-medium text-text-primary">
            Novo Pedido
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div>
            <h4 className="text-md font-medium text-text-primary mb-4">
              Informações Básicas
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="pedido">Pedido *</Label>
                <Input
                  id="pedido"
                  placeholder="PD-2024-XXX"
                  {...form.register("pedido")}
                />
                {form.formState.errors.pedido && (
                  <p className="text-sm text-red-500 mt-1">
                    {form.formState.errors.pedido.message}
                  </p>
                )}
              </div>
              
              <div>
                <Label htmlFor="data">Data *</Label>
                <Input
                  id="data"
                  type="date"
                  {...form.register("data")}
                />
                {form.formState.errors.data && (
                  <p className="text-sm text-red-500 mt-1">
                    {form.formState.errors.data.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Parties Information */}
          <div>
            <h4 className="text-md font-medium text-text-primary mb-4">
              Partes Envolvidas
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="clientName">Cliente *</Label>
                <Input
                  id="clientName"
                  placeholder="Nome do cliente"
                  {...form.register("clientName")}
                />
                {form.formState.errors.clientName && (
                  <p className="text-sm text-red-500 mt-1">
                    {form.formState.errors.clientName.message}
                  </p>
                )}
              </div>
              
              <div>
                <Label htmlFor="exporterName">Exportador *</Label>
                <Input
                  id="exporterName"
                  placeholder="Nome do exportador"
                  {...form.register("exporterName")}
                />
                {form.formState.errors.exporterName && (
                  <p className="text-sm text-red-500 mt-1">
                    {form.formState.errors.exporterName.message}
                  </p>
                )}
              </div>
              
              <div>
                <Label htmlFor="referenciaExportador">Referência Exportador</Label>
                <Input
                  id="referenciaExportador"
                  placeholder="Referência do exportador"
                  {...form.register("referenciaExportador")}
                />
              </div>
              
              <div>
                <Label htmlFor="importerName">Importador *</Label>
                <Input
                  id="importerName"
                  placeholder="Nome do importador"
                  {...form.register("importerName")}
                />
                {form.formState.errors.importerName && (
                  <p className="text-sm text-red-500 mt-1">
                    {form.formState.errors.importerName.message}
                  </p>
                )}
              </div>
              
              <div>
                <Label htmlFor="referenciaImportador">Referência Importador</Label>
                <Input
                  id="referenciaImportador"
                  placeholder="Referência do importador"
                  {...form.register("referenciaImportador")}
                />
              </div>
              
              <div>
                <Label htmlFor="producerName">Produtor</Label>
                <Input
                  id="producerName"
                  placeholder="Nome do produtor"
                  {...form.register("producerName")}
                />
              </div>
            </div>
          </div>

          {/* Product Information */}
          <div>
            <h4 className="text-md font-medium text-text-primary mb-4">
              Informações do Produto
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="quantidade">Quantidade *</Label>
                <Input
                  id="quantidade"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  {...form.register("quantidade")}
                  onChange={(e) => {
                    form.setValue("quantidade", e.target.value);
                    calculateTotal();
                  }}
                />
                {form.formState.errors.quantidade && (
                  <p className="text-sm text-red-500 mt-1">
                    {form.formState.errors.quantidade.message}
                  </p>
                )}
              </div>
              
              <div>
                <Label htmlFor="itens">Itens</Label>
                <Input
                  id="itens"
                  placeholder="Descrição dos itens"
                  {...form.register("itens")}
                />
              </div>
              
              <div>
                <Label htmlFor="precoGuia">Preço Guia</Label>
                <Input
                  id="precoGuia"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  {...form.register("precoGuia")}
                  onChange={(e) => {
                    form.setValue("precoGuia", e.target.value);
                    calculateTotal();
                  }}
                />
              </div>
              
              <div>
                <Label htmlFor="totalGuia">Total Guia</Label>
                <Input
                  id="totalGuia"
                  type="number"
                  step="0.01"
                  placeholder="Calculado automaticamente"
                  {...form.register("totalGuia")}
                  readOnly
                  className="bg-gray-50"
                />
                <p className="text-xs text-text-secondary mt-1">
                  Calculado automaticamente (Quantidade × Preço Guia)
                </p>
              </div>
            </div>
          </div>

          {/* Shipping Information */}
          <div>
            <h4 className="text-md font-medium text-text-primary mb-4">
              Informações de Embarque
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="portoEmbarque">Porto Embarque</Label>
                <Input
                  id="portoEmbarque"
                  placeholder="Porto de embarque"
                  {...form.register("portoEmbarque")}
                />
              </div>
              
              <div>
                <Label htmlFor="portoDestino">Porto Destino</Label>
                <Input
                  id="portoDestino"
                  placeholder="Porto de destino"
                  {...form.register("portoDestino")}
                />
              </div>
              
              <div>
                <Label htmlFor="condicao">Condição</Label>
                <Select onValueChange={(value) => form.setValue("condicao", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a condição" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FOB">FOB</SelectItem>
                    <SelectItem value="CIF">CIF</SelectItem>
                    <SelectItem value="CFR">CFR</SelectItem>
                    <SelectItem value="EXW">EXW</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="etiqueta">Etiqueta</Label>
                <Input
                  id="etiqueta"
                  placeholder="Etiqueta do pedido"
                  {...form.register("etiqueta")}
                />
              </div>
            </div>
          </div>

          {/* Dates and Status */}
          <div>
            <h4 className="text-md font-medium text-text-primary mb-4">
              Datas e Status
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="embarque">Embarque</Label>
                <Input
                  id="embarque"
                  type="date"
                  {...form.register("embarque")}
                />
              </div>
              
              <div>
                <Label htmlFor="previsao">Previsão</Label>
                <Input
                  id="previsao"
                  type="date"
                  {...form.register("previsao")}
                />
              </div>
              
              <div>
                <Label htmlFor="chegada">Chegada</Label>
                <Input
                  id="chegada"
                  type="date"
                  {...form.register("chegada")}
                />
              </div>
              
              <div>
                <Label htmlFor="situacao">Situação</Label>
                <Select 
                  defaultValue="pendente"
                  onValueChange={(value) => form.setValue("situacao", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pendente">Pendente</SelectItem>
                    <SelectItem value="em-transito">Em Trânsito</SelectItem>
                    <SelectItem value="entregue">Entregue</SelectItem>
                    <SelectItem value="quitado">Quitado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="semana">Semana</Label>
                <Input
                  id="semana"
                  type="week"
                  {...form.register("semana")}
                />
              </div>
            </div>
            
            <div className="mt-4">
              <Label htmlFor="observacao">Observação</Label>
              <Textarea
                id="observacao"
                rows={3}
                placeholder="Observações adicionais sobre o pedido"
                {...form.register("observacao")}
              />
            </div>
          </div>
          
          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={createOrderMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-primary hover:bg-blue-700"
              disabled={createOrderMutation.isPending}
            >
              {createOrderMutation.isPending ? "Criando..." : "Criar Pedido"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
