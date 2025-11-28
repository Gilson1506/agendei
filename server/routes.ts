import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertServiceSchema, insertBarberSchema, insertAppointmentSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // ========== SERVICES ROUTES ==========

  // Get all services
  app.get("/api/services", async (_req, res) => {
    try {
      const services = await storage.getAllServices();
      res.json(services);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch services" });
    }
  });

  // Get single service
  app.get("/api/services/:id", async (req, res) => {
    try {
      const service = await storage.getService(req.params.id);
      if (!service) {
        return res.status(404).json({ error: "Service not found" });
      }
      res.json(service);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch service" });
    }
  });

  // Create service
  app.post("/api/services", async (req, res) => {
    try {
      console.log('Received service data:', req.body);
      const validatedData = insertServiceSchema.parse(req.body);
      const service = await storage.createService(validatedData);
      res.status(201).json(service);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error('Validation error:', error.errors);
        return res.status(400).json({ error: "Invalid data", details: error.errors });
      }
      console.error('Service creation error:', error);
      res.status(500).json({ error: "Failed to create service" });
    }
  });

  // Update service
  app.patch("/api/services/:id", async (req, res) => {
    try {
      const updated = await storage.updateService(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ error: "Service not found" });
      }
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update service" });
    }
  });

  // Delete service
  app.delete("/api/services/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteService(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Service not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete service" });
    }
  });

  // ========== BARBERS ROUTES ==========

  // Get all barbers (with their service IDs)
  app.get("/api/barbers", async (_req, res) => {
    try {
      const barbers = await storage.getAllBarbers();

      // Enrich each barber with their service IDs
      const barbersWithServices = await Promise.all(
        barbers.map(async (barber) => {
          const serviceIds = await storage.getBarberServices(barber.id);
          return { ...barber, serviceIds };
        })
      );

      res.json(barbersWithServices);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch barbers" });
    }
  });

  // Get single barber
  app.get("/api/barbers/:id", async (req, res) => {
    try {
      const barber = await storage.getBarber(req.params.id);
      if (!barber) {
        return res.status(404).json({ error: "Barber not found" });
      }

      const serviceIds = await storage.getBarberServices(barber.id);
      res.json({ ...barber, serviceIds });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch barber" });
    }
  });

  // Create barber (with service associations)
  app.post("/api/barbers", async (req, res) => {
    try {
      const { serviceIds, ...barberData } = req.body;
      const validatedData = insertBarberSchema.parse(barberData);

      const barber = await storage.createBarber(validatedData);

      // Set service associations if provided
      if (serviceIds && Array.isArray(serviceIds)) {
        await storage.setBarberServices(barber.id, serviceIds);
      }

      res.status(201).json({ ...barber, serviceIds: serviceIds || [] });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create barber" });
    }
  });

  // Update barber (including service associations)
  app.patch("/api/barbers/:id", async (req, res) => {
    try {
      const { serviceIds, ...barberData } = req.body;

      // Update barber basic info if provided
      let updated = await storage.getBarber(req.params.id);
      if (!updated) {
        return res.status(404).json({ error: "Barber not found" });
      }

      if (Object.keys(barberData).length > 0) {
        updated = await storage.updateBarber(req.params.id, barberData);
      }

      // Update service associations if provided
      if (serviceIds && Array.isArray(serviceIds)) {
        await storage.setBarberServices(req.params.id, serviceIds);
      }

      const finalServiceIds = await storage.getBarberServices(req.params.id);
      res.json({ ...updated, serviceIds: finalServiceIds });
    } catch (error) {
      res.status(500).json({ error: "Failed to update barber" });
    }
  });

  // Delete barber
  app.delete("/api/barbers/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteBarber(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Barber not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete barber" });
    }
  });

  // ========== APPOINTMENTS ROUTES ==========

  // Get all appointments
  app.get("/api/appointments", async (_req, res) => {
    try {
      const appointments = await storage.getAllAppointments();
      res.json(appointments);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch appointments" });
    }
  });

  // Get single appointment
  app.get("/api/appointments/:id", async (req, res) => {
    try {
      const appointment = await storage.getAppointment(req.params.id);
      if (!appointment) {
        return res.status(404).json({ error: "Appointment not found" });
      }
      res.json(appointment);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch appointment" });
    }
  });

  // Create appointment
  app.post("/api/appointments", async (req, res) => {
    try {
      console.log('Received appointment data:', JSON.stringify(req.body, null, 2));
      const validatedData = insertAppointmentSchema.parse(req.body);
      console.log('Validated appointment data:', JSON.stringify(validatedData, null, 2));
      const appointment = await storage.createAppointment(validatedData);
      res.status(201).json(appointment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error('Appointment validation error:', JSON.stringify(error.errors, null, 2));
        return res.status(400).json({ error: "Invalid data", details: error.errors });
      }
      console.error('Appointment creation error:', error);
      res.status(500).json({ error: "Failed to create appointment" });
    }
  });

  // Update appointment
  app.patch("/api/appointments/:id", async (req, res) => {
    try {
      const updated = await storage.updateAppointment(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ error: "Appointment not found" });
      }
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update appointment" });
    }
  });

  // Delete appointment
  app.delete("/api/appointments/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteAppointment(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Appointment not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete appointment" });
    }
  });

  // ========== DASHBOARD STATS ==========
  app.get("/api/stats", async (_req, res) => {
    try {
      const [appointments, services, barbers] = await Promise.all([
        storage.getAllAppointments(),
        storage.getAllServices(),
        storage.getAllBarbers()
      ]);

      const totalRevenue = appointments.reduce((acc, apt) => acc + (apt.total_price || 0), 0);
      const confirmedCount = appointments.filter(a => a.status === 'confirmed').length;
      const pendingCount = appointments.filter(a => a.status === 'pending').length;

      res.json({
        totalRevenue,
        totalAppointments: appointments.length,
        confirmedAppointments: confirmedCount,
        pendingAppointments: pendingCount,
        totalBarbers: barbers.length,
        totalServices: services.length,
        platformFee: 5.00 // Fixed platform fee
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      res.status(500).json({ error: "Failed to fetch statistics" });
    }
  });

  // ========== FILE UPLOAD ROUTES ==========

  // Upload barber photo
  app.post("/api/upload/barber-photo/:barberId", async (req, res) => {
    try {
      const { barberId } = req.params;
      const { file, fileName, contentType } = req.body;

      if (!file || !fileName || !contentType) {
        return res.status(400).json({ error: "Missing file data, fileName, or contentType" });
      }

      // Convert base64 to Buffer
      const base64Data = file.replace(/^data:.*,/, '');
      const fileBuffer = Buffer.from(base64Data, 'base64');

      const url = await storage.uploadBarberPhoto(barberId, fileBuffer, fileName, contentType);
      res.json({ url });
    } catch (error) {
      console.error('Error uploading barber photo:', error);
      res.status(500).json({ error: "Failed to upload barber photo" });
    }
  });

  // Upload payment receipt
  app.post("/api/upload/payment-receipt/:appointmentId", async (req, res) => {
    try {
      const { appointmentId } = req.params;
      const { file, fileName, contentType } = req.body;

      if (!file || !fileName || !contentType) {
        return res.status(400).json({ error: "Missing file data, fileName, or contentType" });
      }

      // Convert base64 to Buffer
      const base64Data = file.replace(/^data:.*,/, '');
      const fileBuffer = Buffer.from(base64Data, 'base64');

      const url = await storage.uploadPaymentReceipt(appointmentId, fileBuffer, fileName, contentType);

      // Update appointment with receipt URL
      await storage.updateAppointment(appointmentId, { payment_receipt_url: url });

      res.json({ url });
    } catch (error) {
      console.error('Error uploading payment receipt:', error);
      res.status(500).json({ error: "Failed to upload payment receipt" });
    }
  });

  // Upload QR code
  app.post("/api/upload/qr-code/:serviceId", async (req, res) => {
    try {
      const { serviceId } = req.params;
      const { file, fileName, contentType } = req.body;

      if (!file || !fileName || !contentType) {
        return res.status(400).json({ error: "Missing file data, fileName, or contentType" });
      }

      // Convert base64 to Buffer
      const base64Data = file.replace(/^data:.*,/, '');
      const fileBuffer = Buffer.from(base64Data, 'base64');

      const url = await storage.uploadQRCode(serviceId, fileBuffer, fileName, contentType);

      // Update service with QR code URL
      await storage.updateService(serviceId, { qr_code_url: url });

      res.json({ url });
    } catch (error) {
      console.error('Error uploading QR code:', error);
      res.status(500).json({ error: "Failed to upload QR code" });
    }
  });

  return httpServer;
}
