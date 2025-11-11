import { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Upload, X, FileText } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FileUploadModal({ isOpen, onClose }: FileUploadModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const XLSX = await import('xlsx');
      const { storage } = await import('@/lib/storage');
      const { insertOrderSchema } = await import('@shared/schema');

      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet);

      const orders = [];
      const errors = [];

      for (let i = 0; i < data.length; i++) {
        try {
          const row = data[i] as any;

          const rowKeys = Object.keys(row);
          const referenciaExportador = rowKeys.find(key => key.includes('REFERÊNCIA') && rowKeys.indexOf(key) < rowKeys.indexOf('IMPORTADOR')) || 'REFERÊNCIA';
          const referenciaImportador = rowKeys.find(key => key.includes('REFERÊNCIA') && rowKeys.indexOf(key) > rowKeys.indexOf('IMPORTADOR')) || 'REFERÊNCIA__1';

          const toString = (value: any) => {
            if (value === null || value === undefined) return "";
            if (typeof value === 'number') {
              if (value > 40000 && value < 50000) {
                const date = new Date((value - 25569) * 86400 * 1000);
                return date.toISOString().split('T')[0];
              }
              return value.toString();
            }
            return String(value);
          };

          const orderData = {
            pedido: toString(row.PEDIDO || row.pedido),
            data: toString(row.DATA || row.data),
            exporterName: toString(row.EXPORTADOR || row.exportador),
            referenciaExportador: toString(row[referenciaExportador] || row.referenciaExportador),
            importerName: toString(row.IMPORTADOR || row.importador),
            referenciaImportador: toString(row[referenciaImportador] || row.referenciaImportador),
            quantidade: toString(row.QUANTIDADE || row.quantidade || "0"),
            itens: toString(row.ITENS || row.itens),
            precoGuia: toString(row["PREÇO GUIA"] || row.precoGuia || "0"),
            totalGuia: toString(row["TOTAL GUIA"] || row.totalGuia || "0"),
            producerName: toString(row.PRODUTOR || row.produtor),
            clientName: toString(row.CLIENTE || row.cliente),
            etiqueta: toString(row.ETIQUETA || row.etiqueta),
            portoEmbarque: toString(row["PORTO EMBARQUE"] || row.portoEmbarque),
            portoDestino: toString(row["PORTO DESTINO"] || row.portoDestino),
            condicao: toString(row["CONDIÇÃO"] || row.condicao),
            embarque: toString(row.EMBARQUE || row.embarque),
            previsao: toString(row["PREVISÃO"] || row.previsao),
            chegada: toString(row.CHEGADA || row.chegada),
            observacao: toString(row["OBSERVAÇÃO"] || row.observacao),
            situacao: toString(row["SITUAÇÃO"] || row.situacao) || "pendiente",
            semana: toString(row.SEMANA || row.semana),
          };

          const validatedData = insertOrderSchema.parse(orderData);
          const order = await storage.createOrder(validatedData);
          orders.push(order);
        } catch (error) {
          errors.push({ row: i + 1, error: error instanceof Error ? error.message : String(error) });
        }
      }

      return {
        success: true,
        imported: orders.length,
        errors,
        totalRows: data.length,
        orders,
      };
    },
    onSuccess: (data) => {
      toast({
        title: "Sucesso",
        description: `${data.imported} pedidos importados com sucesso!`,
      });
      
      if (data.errors && data.errors.length > 0) {
        toast({
          title: "Avisos",
          description: `${data.errors.length} linhas com problemas foram ignoradas.`,
          variant: "destructive",
        });
      }
      
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      setSelectedFile(null);
      onClose();
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao processar arquivo. Verifique o formato e tente novamente.",
        variant: "destructive",
      });
    },
  });

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (isValidFile(file)) {
        setSelectedFile(file);
      } else {
        toast({
          title: "Formato inválido",
          description: "Por favor, selecione um arquivo Excel (.xlsx, .xls) ou CSV.",
          variant: "destructive",
        });
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (isValidFile(file)) {
        setSelectedFile(file);
      } else {
        toast({
          title: "Formato inválido",
          description: "Por favor, selecione um arquivo Excel (.xlsx, .xls) ou CSV.",
          variant: "destructive",
        });
      }
    }
  };

  const isValidFile = (file: File) => {
    const validTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
      "text/csv",
    ];
    return validTypes.includes(file.type) || 
           file.name.endsWith(".xlsx") || 
           file.name.endsWith(".xls") || 
           file.name.endsWith(".csv");
  };

  const handleUpload = () => {
    if (selectedFile) {
      uploadMutation.mutate(selectedFile);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleClose = () => {
    setSelectedFile(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-medium text-text-primary">
            Importar Excel/CSV
          </DialogTitle>
        </DialogHeader>
        
        <div className="p-6">
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragOver
                ? "border-primary bg-primary/5"
                : "border-gray-300 hover:border-primary"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {selectedFile ? (
              <div className="space-y-4">
                <FileText className="h-12 w-12 text-primary mx-auto" />
                <div>
                  <p className="text-sm font-medium text-text-primary">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-text-secondary">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedFile(null)}
                >
                  <X className="h-4 w-4 mr-2" />
                  Remover
                </Button>
              </div>
            ) : (
              <>
                <Upload className="h-12 w-12 text-text-secondary mx-auto mb-4" />
                <p className="text-sm text-text-primary mb-2">
                  Arraste e solte seu arquivo aqui
                </p>
                <p className="text-xs text-text-secondary mb-4">ou</p>
                <Button
                  onClick={triggerFileInput}
                  className="bg-primary hover:bg-blue-700"
                >
                  Selecionar Arquivo
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  className="hidden"
                  onChange={handleFileSelect}
                />
                <p className="text-xs text-text-secondary mt-4">
                  Formatos suportados: Excel (.xlsx, .xls) e CSV
                </p>
              </>
            )}
          </div>
          
          <div className="mt-6 flex justify-end space-x-4">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={uploadMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!selectedFile || uploadMutation.isPending}
              className="bg-primary hover:bg-blue-700"
            >
              {uploadMutation.isPending ? "Processando..." : "Processar Arquivo"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
