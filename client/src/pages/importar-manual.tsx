import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle2, XCircle, Upload, AlertCircle, Download } from "lucide-react";

interface ImportResult {
  row: number;
  pedido: string;
  success: boolean;
  error?: string;
}

interface ImportSummary {
  total: number;
  successful: number;
  failed: number;
  results: ImportResult[];
}

export default function ImportarManual() {
  const [textData, setTextData] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [importSummary, setImportSummary] = useState<ImportSummary | null>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const queryClient = useQueryClient();

  const parseTextData = (text: string) => {
    const lines = text.trim().split('\n');
    if (lines.length === 0) {
      throw new Error("No hay datos para procesar");
    }

    const parsedData: any[] = [];
    const errors: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const columns = line.split('\t');

      if (columns.length < 22) {
        errors.push(`Fila ${i + 1}: Formato incorrecto (se esperan 22 columnas, se encontraron ${columns.length})`);
        continue;
      }

      const [
        pedido,
        data,
        exportador,
        referenciaExportador,
        importador,
        referenciaImportador,
        quantidade,
        itens,
        precoGuia,
        totalGuia,
        produtor,
        cliente,
        etiqueta,
        portoEmbarque,
        portoDestino,
        condicao,
        embarque,
        previsao,
        chegada,
        observacao,
        situacao,
        semana
      ] = columns;

      const parseDateDDMMYY = (dateStr: string) => {
        if (!dateStr || dateStr.trim() === '') return '';

        const parts = dateStr.split('/');
        if (parts.length !== 3) return dateStr;

        let [day, month, year] = parts;

        if (year.length === 2) {
          const currentYear = new Date().getFullYear();
          const century = Math.floor(currentYear / 100) * 100;
          year = `${century + parseInt(year)}`;
        }

        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      };

      parsedData.push({
        pedido: pedido?.trim() || '',
        data: parseDateDDMMYY(data?.trim() || ''),
        exporterName: exportador?.trim() || '',
        referenciaExportador: referenciaExportador?.trim() || '',
        importerName: importador?.trim() || '',
        referenciaImportador: referenciaImportador?.trim() || '',
        quantidade: quantidade?.trim() || '0',
        itens: itens?.trim() || '',
        precoGuia: precoGuia?.trim() || '',
        totalGuia: totalGuia?.trim() || '',
        producerName: produtor?.trim() || '',
        clientName: cliente?.trim() || '',
        etiqueta: etiqueta?.trim() || '',
        portoEmbarque: portoEmbarque?.trim() || '',
        portoDestino: portoDestino?.trim() || '',
        condicao: condicao?.trim() || '',
        embarque: parseDateDDMMYY(embarque?.trim() || ''),
        previsao: parseDateDDMMYY(previsao?.trim() || ''),
        chegada: parseDateDDMMYY(chegada?.trim() || ''),
        observacao: observacao?.trim() || '',
        situacao: situacao?.trim() || 'pendiente',
        semana: semana?.trim() || '',
      });
    }

    if (errors.length > 0) {
      throw new Error(`Errores encontrados:\n${errors.join('\n')}`);
    }

    return parsedData;
  };

  const handlePreview = () => {
    try {
      const parsed = parseTextData(textData);
      setPreviewData(parsed);
      setImportSummary(null);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Error al procesar los datos");
    }
  };

  const handleImport = async () => {
    if (previewData.length === 0) {
      alert("Primero debes generar una vista previa de los datos");
      return;
    }

    setIsProcessing(true);
    try {
      const { storage } = await import('@/lib/storage');
      const { insertOrderSchema } = await import('@shared/schema');

      const results = [];
      let successful = 0;
      let failed = 0;

      for (let i = 0; i < previewData.length; i++) {
        try {
          const orderData = previewData[i];
          const validatedData = insertOrderSchema.parse(orderData);
          await storage.createOrder(validatedData);

          results.push({
            row: i + 1,
            pedido: orderData.pedido,
            success: true,
          });
          successful++;
        } catch (error) {
          results.push({
            row: i + 1,
            pedido: previewData[i]?.pedido || `Fila ${i + 1}`,
            success: false,
            error: error instanceof Error ? error.message : String(error),
          });
          failed++;
        }
      }

      const result = {
        total: previewData.length,
        successful,
        failed,
        results,
      };

      setImportSummary(result);
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });

      if (result.successful > 0) {
        queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
        queryClient.invalidateQueries({ queryKey: ["/api/exporters"] });
        queryClient.invalidateQueries({ queryKey: ["/api/importers"] });
        queryClient.invalidateQueries({ queryKey: ["/api/producers"] });
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : "Error al importar los datos");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadErrors = () => {
    if (!importSummary) return;

    const failedRows = importSummary.results.filter(r => !r.success);
    const csvContent = failedRows.map(r => `${r.row},${r.pedido},${r.error}`).join('\n');
    const blob = new Blob([`Fila,Pedido,Error\n${csvContent}`], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'errores-importacion.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    setTextData("");
    setPreviewData([]);
    setImportSummary(null);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Importación Manual de Pedidos</h1>
          <p className="text-muted-foreground mt-2">
            Copia y pega tus datos de Excel directamente aquí
          </p>
        </div>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Instrucciones:</strong>
          <ol className="list-decimal ml-4 mt-2 space-y-1">
            <li>Abre tu archivo Excel</li>
            <li>Selecciona las filas que deseas importar (sin incluir el encabezado)</li>
            <li>Copia las filas (Ctrl+C o Cmd+C)</li>
            <li>Pega en el campo de texto abajo</li>
            <li>Haz clic en "Vista Previa" para verificar los datos</li>
            <li>Si todo está correcto, haz clic en "Importar Pedidos"</li>
          </ol>
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Datos de Excel</CardTitle>
          <CardDescription>
            Pega aquí las filas de tu Excel (asegúrate de que las columnas estén separadas por tabulaciones)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Pega aquí tus datos de Excel..."
            value={textData}
            onChange={(e) => setTextData(e.target.value)}
            className="min-h-[200px] font-mono text-sm"
          />

          <div className="flex gap-2">
            <Button onClick={handlePreview} disabled={!textData.trim()}>
              Vista Previa
            </Button>
            <Button
              onClick={handleImport}
              disabled={previewData.length === 0 || isProcessing}
              variant="default"
            >
              <Upload className="mr-2 h-4 w-4" />
              {isProcessing ? "Importando..." : "Importar Pedidos"}
            </Button>
            <Button onClick={handleClear} variant="outline">
              Limpiar
            </Button>
          </div>
        </CardContent>
      </Card>

      {previewData.length > 0 && !importSummary && (
        <Card>
          <CardHeader>
            <CardTitle>Vista Previa</CardTitle>
            <CardDescription>
              {previewData.length} pedido(s) listo(s) para importar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Pedido</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Exportador</TableHead>
                    <TableHead>Importador</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Cantidad</TableHead>
                    <TableHead>Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {previewData.slice(0, 10).map((order, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium">{order.pedido}</TableCell>
                      <TableCell>{order.data}</TableCell>
                      <TableCell>{order.exporterName}</TableCell>
                      <TableCell>{order.importerName}</TableCell>
                      <TableCell>{order.clientName}</TableCell>
                      <TableCell>{order.quantidade}</TableCell>
                      <TableCell>{order.totalGuia}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {previewData.length > 10 && (
                <p className="text-sm text-muted-foreground mt-2 text-center">
                  Mostrando 10 de {previewData.length} pedidos
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {importSummary && (
        <Card>
          <CardHeader>
            <CardTitle>Resultado de la Importación</CardTitle>
            <CardDescription>
              Resumen del proceso de importación
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">{importSummary.total}</div>
                  <p className="text-sm text-muted-foreground">Total Procesados</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-green-600">{importSummary.successful}</div>
                  <p className="text-sm text-muted-foreground">Exitosos</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-red-600">{importSummary.failed}</div>
                  <p className="text-sm text-muted-foreground">Fallidos</p>
                </CardContent>
              </Card>
            </div>

            {importSummary.failed > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Detalles de Errores</h3>
                  <Button onClick={handleDownloadErrors} variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Descargar Errores
                  </Button>
                </div>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Fila</TableHead>
                        <TableHead>Pedido</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Error</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {importSummary.results.map((result, idx) => (
                        <TableRow key={idx}>
                          <TableCell>{result.row}</TableCell>
                          <TableCell className="font-medium">{result.pedido}</TableCell>
                          <TableCell>
                            {result.success ? (
                              <Badge variant="default" className="bg-green-600">
                                <CheckCircle2 className="mr-1 h-3 w-3" />
                                Exitoso
                              </Badge>
                            ) : (
                              <Badge variant="destructive">
                                <XCircle className="mr-1 h-3 w-3" />
                                Error
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-sm text-red-600">
                            {result.error || '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}

            {importSummary.successful > 0 && (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  ¡Importación completada! Se importaron exitosamente {importSummary.successful} pedido(s).
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
