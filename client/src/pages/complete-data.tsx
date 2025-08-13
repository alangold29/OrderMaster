import CompleteDataTable from "@/components/complete-data-table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Database, FileSpreadsheet, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function CompleteData() {
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center space-x-3">
            <Database className="h-8 w-8 text-primary" />
            <span>Base de Dados Completa</span>
          </h1>
          <p className="text-muted-foreground mt-2">
            Consulta integral de pedidos e embarques para análise e revisão de dados
          </p>
        </div>
        
        <div className="flex space-x-3">
          <Button variant="outline" onClick={() => setIsImportModalOpen(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Importar Dados
          </Button>
          <Button>
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Exportar Excel
          </Button>
        </div>
      </div>

      {/* Instructions Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="h-5 w-5" />
            <span>Como usar esta tabela</span>
          </CardTitle>
          <CardDescription>
            Esta é a tabela principal para consultar todos os dados do CRM
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-start space-x-3">
              <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-lg">
                <FileSpreadsheet className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold">Consulta Completa</h3>
                <p className="text-sm text-muted-foreground">
                  Veja todos os campos de pedidos e embarques em uma única tabela
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="bg-green-100 dark:bg-green-900 p-2 rounded-lg">
                <Upload className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="font-semibold">Importação de Dados</h3>
                <p className="text-sm text-muted-foreground">
                  Faça upload de arquivos Excel/CSV para alimentar o sistema
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="bg-purple-100 dark:bg-purple-900 p-2 rounded-lg">
                <Database className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h3 className="font-semibold">Filtros Avançados</h3>
                <p className="text-sm text-muted-foreground">
                  Use filtros para encontrar rapidamente a informação que precisa
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Complete Data Table */}
      <CompleteDataTable showAllFields={true} viewType="complete" />
    </div>
  );
}