import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertOrderSchema, manualOrderSchema, type ManualOrder } from "@shared/schema";
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
        clienteRede,
        representante,
        produto,
        referenciaExportador,
        referenciaImportador,
        clienteFinal,
        grupo,
        paisExportador,
        dataEmissaoInicio,
        dataEmissaoFim,
        dataEmbarqueInicio,
        dataEmbarqueFim,
        notify,
        portoEmbarque,
        portoDesembarque,
        blCrtAwb,
        dataDesembarque,
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
        clienteRede: clienteRede as string,
        representante: representante as string,
        produto: produto as string,
        referenciaExportador: referenciaExportador as string,
        referenciaImportador: referenciaImportador as string,
        clienteFinal: clienteFinal as string,
        grupo: grupo as string,
        paisExportador: paisExportador as string,
        dataEmissaoInicio: dataEmissaoInicio as string,
        dataEmissaoFim: dataEmissaoFim as string,
        dataEmbarqueInicio: dataEmbarqueInicio as string,
        dataEmbarqueFim: dataEmbarqueFim as string,
        notify: notify as string,
        portoEmbarque: portoEmbarque as string,
        portoDesembarque: portoDesembarque as string,
        blCrtAwb: blCrtAwb as string,
        dataDesembarque: dataDesembarque as string,
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
      // Check if this is a manual order creation
      if (req.body.produto && req.body.dataEmissaoPedido) {
        const validatedData = manualOrderSchema.parse(req.body);
        const order = await storage.createManualOrder(validatedData);
        res.status(201).json(order);
      } else {
        // Excel import order creation
        const validatedData = insertOrderSchema.parse(req.body);
        const order = await storage.createOrder(validatedData);
        res.status(201).json(order);
      }
    } catch (error) {
      console.error("Error creating order:", error);
      res.status(400).json({ error: "Invalid order data", details: error.message });
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

  // Financial statistics
  app.get("/api/stats/financial", async (req, res) => {
    try {
      const stats = await storage.getFinancialStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching financial stats:", error);
      res.status(500).json({ error: "Failed to fetch financial statistics" });
    }
  });

  // Recent orders
  app.get("/api/analytics/recent-orders", async (req, res) => {
    try {
      const orders = await storage.getRecentOrders();
      res.json(orders);
    } catch (error) {
      console.error("Error fetching recent orders:", error);
      res.status(500).json({ error: "Failed to fetch recent orders" });
    }
  });

  // Upcoming shipments
  app.get("/api/analytics/upcoming-shipments", async (req, res) => {
    try {
      const orders = await storage.getUpcomingShipments();
      res.json(orders);
    } catch (error) {
      console.error("Error fetching upcoming shipments:", error);
      res.status(500).json({ error: "Failed to fetch upcoming shipments" });
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
          // Handle the fact that there are two REFERÊNCIA columns in the Excel
          const rowKeys = Object.keys(row);
          const referenciaExportador = rowKeys.find(key => key.includes('REFERÊNCIA') && rowKeys.indexOf(key) < rowKeys.indexOf('IMPORTADOR')) || 'REFERÊNCIA';
          const referenciaImportador = rowKeys.find(key => key.includes('REFERÊNCIA') && rowKeys.indexOf(key) > rowKeys.indexOf('IMPORTADOR')) || 'REFERÊNCIA__1';
          
          // Helper function to convert values to strings and handle dates
          const toString = (value: any) => {
            if (value === null || value === undefined) return "";
            if (typeof value === 'number') {
              // Check if it's a date serial number from Excel
              if (value > 40000 && value < 50000) {
                // Convert Excel date serial to JavaScript date
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
            situacao: toString(row["SITUAÇÃO"] || row.situacao) || "pendente",
            semana: toString(row.SEMANA || row.semana),
          };


          const validatedData = insertOrderSchema.parse(orderData);
          const order = await storage.createOrder(validatedData);
          orders.push(order);
        } catch (error) {
          errors.push({ row: i + 1, error: error.message });
        }
      }

      console.log(`Import completed: ${orders.length} orders imported, ${errors.length} errors`);
      res.json({
        success: true,
        imported: orders.length,
        errors,
        totalRows: data.length,
        orders,
      });
    } catch (error) {
      console.error("Error importing Excel:", error);
      res.status(500).json({ error: "Failed to import Excel file" });
    }
  });

  // Company Users Management Routes
  app.get("/api/company-users", async (req, res) => {
    try {
      const users = await storage.getCompanyUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching company users:", error);
      res.status(500).json({ error: "Failed to fetch company users" });
    }
  });

  app.get("/api/company-users/:id", async (req, res) => {
    try {
      const user = await storage.getCompanyUser(req.params.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("Error fetching company user:", error);
      res.status(500).json({ error: "Failed to fetch company user" });
    }
  });

  app.post("/api/company-users", async (req, res) => {
    try {
      const userData = req.body;
      const user = await storage.createCompanyUser(userData);
      res.status(201).json(user);
    } catch (error) {
      console.error("Error creating company user:", error);
      res.status(500).json({ error: "Failed to create company user" });
    }
  });

  app.put("/api/company-users/:id", async (req, res) => {
    try {
      const userData = req.body;
      const user = await storage.updateCompanyUser(req.params.id, userData);
      res.json(user);
    } catch (error) {
      console.error("Error updating company user:", error);
      res.status(500).json({ error: "Failed to update company user" });
    }
  });

  app.delete("/api/company-users/:id", async (req, res) => {
    try {
      await storage.deleteCompanyUser(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting company user:", error);
      res.status(500).json({ error: "Failed to delete company user" });
    }
  });

  app.patch("/api/company-users/:id/permissions", async (req, res) => {
    try {
      const { permissions } = req.body;
      const user = await storage.updateUserPermissions(req.params.id, permissions);
      res.json(user);
    } catch (error) {
      console.error("Error updating user permissions:", error);
      res.status(500).json({ error: "Failed to update user permissions" });
    }
  });

  app.patch("/api/company-users/:id/role", async (req, res) => {
    try {
      const { role } = req.body;
      const user = await storage.updateUserRole(req.params.id, role);
      res.json(user);
    } catch (error) {
      console.error("Error updating user role:", error);
      res.status(500).json({ error: "Failed to update user role" });
    }
  });

  app.patch("/api/company-users/:id/toggle-active", async (req, res) => {
    try {
      const user = await storage.toggleUserActive(req.params.id);
      res.json(user);
    } catch (error) {
      console.error("Error toggling user active status:", error);
      res.status(500).json({ error: "Failed to toggle user active status" });
    }
  });

  // Financial routes
  app.get("/api/financial/summary", async (req, res) => {
    try {
      const summary = await storage.getFinancialSummary();
      res.json(summary);
    } catch (error) {
      console.error("Error fetching financial summary:", error);
      res.status(500).json({ error: "Failed to fetch financial summary" });
    }
  });

  app.get("/api/financial/accounts-receivable", async (req, res) => {
    try {
      const accounts = await storage.getAccountsReceivable();
      res.json(accounts);
    } catch (error) {
      console.error("Error fetching accounts receivable:", error);
      res.status(500).json({ error: "Failed to fetch accounts receivable" });
    }
  });

  app.get("/api/financial/by-client/:clientId", async (req, res) => {
    try {
      const clientFinancials = await storage.getClientFinancials(req.params.clientId);
      res.json(clientFinancials);
    } catch (error) {
      console.error("Error fetching client financials:", error);
      res.status(500).json({ error: "Failed to fetch client financials" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
