import { createClient, SupabaseClient } from '@supabase/supabase-js';
import session from "express-session";
import connectPg from "connect-pg-simple";
import memorystore from 'memorystore';
import {
  type User,
  type InsertUser,
  type Service,
  type InsertService,
  type Barber,
  type InsertBarber,
  type Appointment,
  type InsertAppointment,
  type BarberService,
  type InsertBarberService,
} from "@shared/schema";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  sessionStore: session.Store;
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Services
  getAllServices(): Promise<Service[]>;
  getService(id: string): Promise<Service | undefined>;
  createService(service: InsertService): Promise<Service>;
  updateService(id: string, service: Partial<InsertService>): Promise<Service | undefined>;
  deleteService(id: string): Promise<boolean>;

  // Barbers
  getAllBarbers(): Promise<Barber[]>;
  getBarber(id: string): Promise<Barber | undefined>;
  createBarber(barber: InsertBarber): Promise<Barber>;
  updateBarber(id: string, barber: Partial<InsertBarber>): Promise<Barber | undefined>;
  deleteBarber(id: string): Promise<boolean>;

  // Barber-Service Associations
  getBarberServices(barberId: string): Promise<string[]>;
  setBarberServices(barberId: string, serviceIds: string[]): Promise<void>;
  getBarbersForService(serviceId: string): Promise<string[]>;

  // Appointments
  getAllAppointments(): Promise<Appointment[]>;
  getAppointment(id: string): Promise<Appointment | undefined>;
  getAppointmentsByBarber(barberId: string, date?: Date): Promise<Appointment[]>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  updateAppointment(id: string, appointment: Partial<InsertAppointment>): Promise<Appointment | undefined>;
  deleteAppointment(id: string): Promise<boolean>;

  // File Uploads
  uploadBarberPhoto(barberId: string, file: Buffer, fileName: string, contentType: string): Promise<string>;
  uploadPaymentReceipt(appointmentId: string, file: Buffer, fileName: string, contentType: string): Promise<string>;
  uploadQRCode(serviceId: string, file: Buffer, fileName: string, contentType: string): Promise<string>;
  getPublicUrl(bucket: string, path: string): string;
  deleteFile(bucket: string, path: string): Promise<boolean>;
}

export class SupabaseStorage implements IStorage {
  private supabase: SupabaseClient;
  sessionStore: session.Store;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_ANON_KEY!;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('SUPABASE_URL and SUPABASE_ANON_KEY must be set in environment variables');
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);

    // Use memory store for sessions (simpler for development)
    // In production, you might want to use connect-pg-simple with DATABASE_URL
    const MemoryStore = memorystore(session);
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    });
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching user:', error);
      return undefined;
    }
    return data as User;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return undefined; // Not found
      console.error('Error fetching user by username:', error);
      return undefined;
    }
    return data as User;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const { data, error } = await this.supabase
      .from('users')
      .insert(insertUser)
      .select()
      .single();

    if (error) throw new Error(`Error creating user: ${error.message}`);
    return data as User;
  }

  // Services
  async getAllServices(): Promise<Service[]> {
    const { data, error } = await this.supabase
      .from('services')
      .select('*');

    if (error) throw new Error(`Error fetching services: ${error.message}`);
    return data as Service[];
  }

  async getService(id: string): Promise<Service | undefined> {
    const { data, error } = await this.supabase
      .from('services')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return undefined;
      throw new Error(`Error fetching service: ${error.message}`);
    }
    return data as Service;
  }

  async createService(service: InsertService): Promise<Service> {
    const { data, error } = await this.supabase
      .from('services')
      .insert(service)
      .select()
      .single();

    if (error) throw new Error(`Error creating service: ${error.message}`);
    return data as Service;
  }

  async updateService(id: string, service: Partial<InsertService>): Promise<Service | undefined> {
    const { data, error } = await this.supabase
      .from('services')
      .update(service)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') return undefined;
      throw new Error(`Error updating service: ${error.message}`);
    }
    return data as Service;
  }

  async deleteService(id: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('services')
      .delete()
      .eq('id', id);

    return !error;
  }

  // Barbers
  async getAllBarbers(): Promise<Barber[]> {
    const { data, error } = await this.supabase
      .from('barbers')
      .select('*');

    if (error) throw new Error(`Error fetching barbers: ${error.message}`);
    return data as Barber[];
  }

  async getBarber(id: string): Promise<Barber | undefined> {
    const { data, error } = await this.supabase
      .from('barbers')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return undefined;
      throw new Error(`Error fetching barber: ${error.message}`);
    }
    return data as Barber;
  }

  async createBarber(barber: InsertBarber): Promise<Barber> {
    const { data, error } = await this.supabase
      .from('barbers')
      .insert(barber)
      .select()
      .single();

    if (error) throw new Error(`Error creating barber: ${error.message}`);
    // Return with serviceIds as empty array since they're stored em uma tabela separada
    return { ...data, serviceIds: [] } as Barber;
  }

  async updateBarber(id: string, barber: Partial<InsertBarber>): Promise<Barber | undefined> {
    const { data, error } = await this.supabase
      .from('barbers')
      .update(barber)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') return undefined;
      throw new Error(`Error updating barber: ${error.message}`);
    }
    return data as Barber;
  }

  async deleteBarber(id: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('barbers')
      .delete()
      .eq('id', id);

    return !error;
  }

  // Barber-Service Associations
  async getBarberServices(barberId: string): Promise<string[]> {
    const { data, error } = await this.supabase
      .from('barber_services')
      .select('service_id')
      .eq('barber_id', barberId);

    if (error) throw new Error(`Error fetching barber services: ${error.message}`);
    return data.map(r => r.service_id);
  }

  async setBarberServices(barberId: string, serviceIds: string[]): Promise<void> {
    // Delete existing associations
    await this.supabase
      .from('barber_services')
      .delete()
      .eq('barber_id', barberId);

    // Insert new associations
    if (serviceIds.length > 0) {
      const { error } = await this.supabase
        .from('barber_services')
        .insert(serviceIds.map(serviceId => ({ barber_id: barberId, service_id: serviceId })));

      if (error) throw new Error(`Error setting barber services: ${error.message}`);
    }
  }

  async getBarbersForService(serviceId: string): Promise<string[]> {
    const { data, error } = await this.supabase
      .from('barber_services')
      .select('barber_id')
      .eq('service_id', serviceId);

    if (error) throw new Error(`Error fetching barbers for service: ${error.message}`);
    return data.map(r => r.barber_id);
  }

  // Appointments
  async getAllAppointments(): Promise<Appointment[]> {
    const { data, error } = await this.supabase
      .from('appointments')
      .select('*');

    if (error) throw new Error(`Error fetching appointments: ${error.message}`);
    return data as Appointment[];
  }

  async getAppointment(id: string): Promise<Appointment | undefined> {
    const { data, error } = await this.supabase
      .from('appointments')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return undefined;
      throw new Error(`Error fetching appointment: ${error.message}`);
    }
    return data as Appointment;
  }

  async getAppointmentsByBarber(barberId: string, date?: Date): Promise<Appointment[]> {
    let query = this.supabase
      .from('appointments')
      .select('*')
      .eq('barber_id', barberId);

    // Note: Date filtering would need to be implemented based on your schema
    // This is a simplified version

    const { data, error } = await query;

    if (error) throw new Error(`Error fetching appointments by barber: ${error.message}`);
    return data as Appointment[];
  }

  async createAppointment(appointment: InsertAppointment): Promise<Appointment> {
    // Converter de camelCase para snake_case para o Supabase
    const supabaseData = {
      service_id: appointment.serviceId,
      barber_id: appointment.barberId,
      date: appointment.date,
      customer_name: appointment.customerName,
      customer_phone: appointment.customerPhone,
      status: appointment.status,
      total_price: appointment.totalPrice,
      payment_receipt_url: appointment.paymentReceiptUrl,
    };

    const { data, error } = await this.supabase
      .from('appointments')
      .insert(supabaseData)
      .select()
      .single();

    if (error) throw new Error(`Error creating appointment: ${error.message}`);
    return data as Appointment;
  }

  async updateAppointment(id: string, appointment: Partial<InsertAppointment>): Promise<Appointment | undefined> {
    // Converter de camelCase para snake_case para o Supabase
    const supabaseData: any = {};
    if (appointment.serviceId) supabaseData.service_id = appointment.serviceId;
    if (appointment.barberId) supabaseData.barber_id = appointment.barberId;
    if (appointment.date) supabaseData.date = appointment.date;
    if (appointment.customerName) supabaseData.customer_name = appointment.customerName;
    if (appointment.customerPhone) supabaseData.customer_phone = appointment.customerPhone;
    if (appointment.status) supabaseData.status = appointment.status;
    if (appointment.totalPrice) supabaseData.total_price = appointment.totalPrice;
    if (appointment.paymentReceiptUrl) supabaseData.payment_receipt_url = appointment.paymentReceiptUrl;

    const { data, error } = await this.supabase
      .from('appointments')
      .update(supabaseData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') return undefined;
      throw new Error(`Error updating appointment: ${error.message}`);
    }
    return data as Appointment;
  }

  async deleteAppointment(id: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('appointments')
      .delete()
      .eq('id', id);

    return !error;
  }


  // File Uploads
  private sanitizeFileName(fileName: string): string {
    // Remove espaços, acentos e caracteres especiais
    return fileName
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^a-zA-Z0-9.-]/g, '_') // Substitui caracteres especiais por _
      .toLowerCase();
  }

  async uploadBarberPhoto(barberId: string, file: Buffer, fileName: string, contentType: string): Promise<string> {
    const sanitizedName = this.sanitizeFileName(fileName);
    const filePath = `barbers/${barberId}/${Date.now()}-${sanitizedName}`;

    const { data, error } = await this.supabase.storage
      .from('uploads')
      .upload(filePath, file, {
        contentType,
        upsert: false
      });

    if (error) throw new Error(`Error uploading barber photo: ${error.message}`);

    return this.getPublicUrl('uploads', filePath);
  }

  async uploadPaymentReceipt(appointmentId: string, file: Buffer, fileName: string, contentType: string): Promise<string> {
    const sanitizedName = this.sanitizeFileName(fileName);
    const filePath = `receipts/${appointmentId}/${Date.now()}-${sanitizedName}`;

    const { data, error } = await this.supabase.storage
      .from('uploads')
      .upload(filePath, file, {
        contentType,
        upsert: false
      });

    if (error) throw new Error(`Error uploading payment receipt: ${error.message}`);

    return this.getPublicUrl('uploads', filePath);
  }

  async uploadQRCode(serviceId: string, file: Buffer, fileName: string, contentType: string): Promise<string> {
    const sanitizedName = this.sanitizeFileName(fileName);
    const filePath = `qrcodes/${serviceId}/${Date.now()}-${sanitizedName}`;

    const { data, error } = await this.supabase.storage
      .from('uploads')
      .upload(filePath, file, {
        contentType,
        upsert: false
      });

    if (error) throw new Error(`Error uploading QR code: ${error.message}`);

    return this.getPublicUrl('uploads', filePath);
  }

  getPublicUrl(bucket: string, path: string): string {
    const { data } = this.supabase.storage
      .from(bucket)
      .getPublicUrl(path);

    return data.publicUrl;
  }

  async deleteFile(bucket: string, path: string): Promise<boolean> {
    const { error } = await this.supabase.storage
      .from(bucket)
      .remove([path]);

    return !error;
  }
}

export const storage = new SupabaseStorage();
