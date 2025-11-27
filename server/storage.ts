import { drizzle } from 'drizzle-orm/neon-serverless';
import { neon } from '@neondatabase/serverless';
import { eq, and } from 'drizzle-orm';
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
  users,
  services,
  barbers,
  appointments,
  barberServices,
} from "@shared/schema";

export interface IStorage {
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
  getBarberServices(barberId: string): Promise<string[]>; // Returns service IDs
  setBarberServices(barberId: string, serviceIds: string[]): Promise<void>;
  getBarbersForService(serviceId: string): Promise<string[]>; // Returns barber IDs

  // Appointments
  getAllAppointments(): Promise<Appointment[]>;
  getAppointment(id: string): Promise<Appointment | undefined>;
  getAppointmentsByBarber(barberId: string, date?: Date): Promise<Appointment[]>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  updateAppointment(id: string, appointment: Partial<InsertAppointment>): Promise<Appointment | undefined>;
  deleteAppointment(id: string): Promise<boolean>;
}

export class DBStorage implements IStorage {
  private db;

  constructor() {
    const sql = neon(process.env.DATABASE_URL!);
    this.db = drizzle({ client: sql });
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await this.db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await this.db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await this.db.insert(users).values(insertUser).returning();
    return user;
  }

  // Services
  async getAllServices(): Promise<Service[]> {
    return await this.db.select().from(services);
  }

  async getService(id: string): Promise<Service | undefined> {
    const [service] = await this.db.select().from(services).where(eq(services.id, id));
    return service;
  }

  async createService(service: InsertService): Promise<Service> {
    const [newService] = await this.db.insert(services).values(service).returning();
    return newService;
  }

  async updateService(id: string, service: Partial<InsertService>): Promise<Service | undefined> {
    const [updated] = await this.db
      .update(services)
      .set(service)
      .where(eq(services.id, id))
      .returning();
    return updated;
  }

  async deleteService(id: string): Promise<boolean> {
    const result = await this.db.delete(services).where(eq(services.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Barbers
  async getAllBarbers(): Promise<Barber[]> {
    return await this.db.select().from(barbers);
  }

  async getBarber(id: string): Promise<Barber | undefined> {
    const [barber] = await this.db.select().from(barbers).where(eq(barbers.id, id));
    return barber;
  }

  async createBarber(barber: InsertBarber): Promise<Barber> {
    const [newBarber] = await this.db.insert(barbers).values(barber).returning();
    return newBarber;
  }

  async updateBarber(id: string, barber: Partial<InsertBarber>): Promise<Barber | undefined> {
    const [updated] = await this.db
      .update(barbers)
      .set(barber)
      .where(eq(barbers.id, id))
      .returning();
    return updated;
  }

  async deleteBarber(id: string): Promise<boolean> {
    const result = await this.db.delete(barbers).where(eq(barbers.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Barber-Service Associations
  async getBarberServices(barberId: string): Promise<string[]> {
    const results = await this.db
      .select({ serviceId: barberServices.serviceId })
      .from(barberServices)
      .where(eq(barberServices.barberId, barberId));
    return results.map(r => r.serviceId);
  }

  async setBarberServices(barberId: string, serviceIds: string[]): Promise<void> {
    // Delete existing associations
    await this.db.delete(barberServices).where(eq(barberServices.barberId, barberId));
    
    // Insert new associations
    if (serviceIds.length > 0) {
      await this.db.insert(barberServices).values(
        serviceIds.map(serviceId => ({ barberId, serviceId }))
      );
    }
  }

  async getBarbersForService(serviceId: string): Promise<string[]> {
    const results = await this.db
      .select({ barberId: barberServices.barberId })
      .from(barberServices)
      .where(eq(barberServices.serviceId, serviceId));
    return results.map(r => r.barberId);
  }

  // Appointments
  async getAllAppointments(): Promise<Appointment[]> {
    return await this.db.select().from(appointments);
  }

  async getAppointment(id: string): Promise<Appointment | undefined> {
    const [appointment] = await this.db.select().from(appointments).where(eq(appointments.id, id));
    return appointment;
  }

  async getAppointmentsByBarber(barberId: string, date?: Date): Promise<Appointment[]> {
    let query = this.db.select().from(appointments).where(eq(appointments.barberId, barberId));
    
    // If date is provided, filter by date (same day)
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      
      // Note: We'll handle date filtering in the application layer for simplicity
      // since Drizzle ORM date filtering can be complex
    }
    
    return await query;
  }

  async createAppointment(appointment: InsertAppointment): Promise<Appointment> {
    const [newAppointment] = await this.db.insert(appointments).values(appointment).returning();
    return newAppointment;
  }

  async updateAppointment(id: string, appointment: Partial<InsertAppointment>): Promise<Appointment | undefined> {
    const [updated] = await this.db
      .update(appointments)
      .set(appointment)
      .where(eq(appointments.id, id))
      .returning();
    return updated;
  }

  async deleteAppointment(id: string): Promise<boolean> {
    const result = await this.db.delete(appointments).where(eq(appointments.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }
}

export const storage = new DBStorage();
