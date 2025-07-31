import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertOrderSchema } from "@shared/schema";
import multer from "multer";
import * as XLSX from "xlsx";

const upload = multer({ storage: multer.memoryStorage() });

export async function registerRoutes(app: Express): Promise<Server> {
  // Orders routes
  app.get("/api/orders", async (req, res) => {
    try {
      const {
        page = "1",
        limit = "10",
        search,
        clientId,
        exporterId,
        importerId,
        producerId,
        situacao,
        sortBy,
        sortOrder,
      } = req.query;
      
      const result = await storage.getOrders({
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        search: search as string,
        clientId: clientId as string,
        exporterId: exporterId as string,
        importerId: importerId as string,
        producerId: producerId as string,
        situacao: situacao as string,
        sortBy: sortBy as string,
        sortOrder: sortOrder as 'asc' | 'desc',
      });
      
      res.json(result);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  });

  app.get("/api/orders/:id", async (req, res) => {
    try {
      const order = await storage.getOrderById(req.params.id);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      res.json(order);
    } catch (error) {
      console.error("Error fetching order:", error);
      res.status(500).json({ error: "Failed to fetch order" });
    }
  });

  app.post("/api/orders", async (req, res) => {
    try {
      const validatedData = insertOrderSchema.parse(req.body);
      const order = await storage.createOrder(validatedData);
      res.status(201).json(order);
    } catch (error) {
      console.error("Error creating order:", error);
      res.status(400).json({ error: "Invalid order data" });
    }
  });

  app.put("/api/orders/:id", async (req, res) => {
    try {
      const validatedData = insertOrderSchema.partial().parse(req.body);
      const order = await storage.updateOrder(req.params.id, validatedData);
      res.json(order);
    } catch (error) {
      console.error("Error updating order:", error);
      res.status(400).json({ error: "Invalid order data" });
    }
  });

  app.delete("/api/orders/:id", async (req, res) => {
    try {
      await storage.deleteOrder(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting order:", error);
      res.status(500).json({ error: "Failed to delete order" });
    }
  });

  // Entity routes
  app.get("/api/clients", async (req, res) => {
    try {
      const clients = await storage.getClients();
      res.json(clients);
    } catch (error) {
      console.error("Error fetching clients:", error);
      res.status(500).json({ error: "Failed to fetch clients" });
    }
  });

  app.get("/api/exporters", async (req, res) => {
    try {
      const exporters = await storage.getExporters();
      res.json(exporters);
    } catch (error) {
      console.error("Error fetching exporters:", error);
      res.status(500).json({ error: "Failed to fetch exporters" });
    }
  });

  app.get("/api/importers", async (req, res) => {
    try {
      const importers = await storage.getImporters();
      res.json(importers);
    } catch (error) {
      console.error("Error fetching importers:", error);
      res.status(500).json({ error: "Failed to fetch importers" });
    }
  });

  app.get("/api/producers", async (req, res) => {
    try {
      const producers = await storage.getProducers();
      res.json(producers);
    } catch (error) {
      console.error("Error fetching producers:", error);
      res.status(500).json({ error: "Failed to fetch producers" });
    }
  });

  // Statistics
  app.get("/api/stats", async (req, res) => {
    try {
      const stats = await storage.getOrderStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ error: "Failed to fetch statistics" });
    }
  });

  // Excel/CSV import
  app.post("/api/import/excel", upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet);

      const orders = [];
      const errors = [];

      for (let i = 0; i < data.length; i++) {
        try {
          const row = data[i] as any;
          
          // Map Excel columns to our schema
          const orderData = {
            pedido: row.PEDIDO || row.pedido || "",
            data: row.DATA || row.data || "",
            exporterName: row.EXPORTADOR || row.exportador || "",
            referenciaExportador: row["REFERÊNCIA EXPORTADOR"] || row.referenciaExportador || "",
            importerName: row.IMPORTADOR || row.importador || "",
            referenciaImportador: row["REFERÊNCIA IMPORTADOR"] || row.referenciaImportador || "",
            quantidade: row.QUANTIDADE || row.quantidade || "0",
            itens: row.ITENS || row.itens || "",
            precoGuia: row["PREÇO GUIA"] || row.precoGuia || "0",
            totalGuia: row["TOTAL GUIA"] || row.totalGuia || "0",
            producerName: row.PRODUTOR || row.produtor || "",
            clientName: row.CLIENTE || row.cliente || "",
            etiqueta: row.ETIQUETA || row.etiqueta || "",
            portoEmbarque: row["PORTO EMBARQUE"] || row.portoEmbarque || "",
            portoDestino: row["PORTO DESTINO"] || row.portoDestino || "",
            condicao: row.CONDIÇÃO || row.condicao || "",
            embarque: row.EMBARQUE || row.embarque || "",
            previsao: row.PREVISÃO || row.previsao || "",
            chegada: row.CHEGADA || row.chegada || "",
            observacao: row.OBSERVAÇÃO || row.observacao || "",
            situacao: row.SITUAÇÃO || row.situacao || "pendente",
            semana: row.SEMANA || row.semana || "",
          };

          const validatedData = insertOrderSchema.parse(orderData);
          const order = await storage.createOrder(validatedData);
          orders.push(order);
        } catch (error) {
          errors.push({ row: i + 1, error: error.message });
        }
      }

      res.json({
        success: true,
        imported: orders.length,
        errors,
        orders,
      });
    } catch (error) {
      console.error("Error importing Excel:", error);
      res.status(500).json({ error: "Failed to import Excel file" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
