export interface ExcelOrder {
  PEDIDO: string;
  DATA: string;
  EXPORTADOR: string;
  "REFERÊNCIA EXPORTADOR": string;
  IMPORTADOR: string;
  "REFERÊNCIA IMPORTADOR": string;
  QUANTIDADE: number;
  ITENS: string;
  "PREÇO GUIA": number;
  "TOTAL GUIA": number;
  PRODUTOR: string;
  CLIENTE: string;
  ETIQUETA: string;
  "PORTO EMBARQUE": string;
  "PORTO DESTINO": string;
  CONDIÇÃO: string;
  EMBARQUE: string;
  PREVISÃO: string;
  CHEGADA: string;
  OBSERVAÇÃO: string;
  SITUAÇÃO: string;
  SEMANA: string;
}

export function parseExcelData(data: any[]): ExcelOrder[] {
  return data.map((row, index) => {
    try {
      return {
        PEDIDO: row.PEDIDO || row.pedido || "",
        DATA: row.DATA || row.data || "",
        EXPORTADOR: row.EXPORTADOR || row.exportador || "",
        "REFERÊNCIA EXPORTADOR": row["REFERÊNCIA EXPORTADOR"] || row.referenciaExportador || "",
        IMPORTADOR: row.IMPORTADOR || row.importador || "",
        "REFERÊNCIA IMPORTADOR": row["REFERÊNCIA IMPORTADOR"] || row.referenciaImportador || "",
        QUANTIDADE: parseFloat(row.QUANTIDADE || row.quantidade || "0"),
        ITENS: row.ITENS || row.itens || "",
        "PREÇO GUIA": parseFloat(row["PREÇO GUIA"] || row.precoGuia || "0"),
        "TOTAL GUIA": parseFloat(row["TOTAL GUIA"] || row.totalGuia || "0"),
        PRODUTOR: row.PRODUTOR || row.produtor || "",
        CLIENTE: row.CLIENTE || row.cliente || "",
        ETIQUETA: row.ETIQUETA || row.etiqueta || "",
        "PORTO EMBARQUE": row["PORTO EMBARQUE"] || row.portoEmbarque || "",
        "PORTO DESTINO": row["PORTO DESTINO"] || row.portoDestino || "",
        CONDIÇÃO: row.CONDIÇÃO || row.condicao || "",
        EMBARQUE: row.EMBARQUE || row.embarque || "",
        PREVISÃO: row.PREVISÃO || row.previsao || "",
        CHEGADA: row.CHEGADA || row.chegada || "",
        OBSERVAÇÃO: row.OBSERVAÇÃO || row.observacao || "",
        SITUAÇÃO: row.SITUAÇÃO || row.situacao || "pendente",
        SEMANA: row.SEMANA || row.semana || "",
      };
    } catch (error) {
      console.error(`Error parsing row ${index}:`, error);
      throw new Error(`Invalid data in row ${index + 1}`);
    }
  });
}

export function validateExcelOrder(order: ExcelOrder): string[] {
  const errors: string[] = [];
  
  if (!order.PEDIDO) errors.push("PEDIDO é obrigatório");
  if (!order.DATA) errors.push("DATA é obrigatória");
  if (!order.EXPORTADOR) errors.push("EXPORTADOR é obrigatório");
  if (!order.IMPORTADOR) errors.push("IMPORTADOR é obrigatório");
  if (!order.CLIENTE) errors.push("CLIENTE é obrigatório");
  if (!order.QUANTIDADE || order.QUANTIDADE <= 0) errors.push("QUANTIDADE deve ser maior que zero");
  
  return errors;
}
