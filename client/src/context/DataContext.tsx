import React, { createContext, useContext, useState, ReactNode } from "react";
import { Service, Barber, Appointment, SERVICES, BARBERS, MOCK_APPOINTMENTS, PLATFORM_FEE } from "@/lib/mockData";

interface DataContextType {
  services: Service[];
  barbers: Barber[];
  appointments: Appointment[];
  platformFee: number;
  addService: (service: Omit<Service, "id">) => void;
  updateService: (id: string, service: Partial<Service>) => void;
  deleteService: (id: string) => void;
  addBarber: (barber: Omit<Barber, "id">) => void;
  updateBarber: (id: string, barber: Partial<Barber>) => void;
  deleteBarber: (id: string) => void;
  addAppointment: (appointment: Omit<Appointment, "id" | "createdAt">) => void;
  updateAppointmentStatus: (id: string, status: Appointment["status"]) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [services, setServices] = useState<Service[]>(SERVICES);
  const [barbers, setBarbers] = useState<Barber[]>(BARBERS);
  const [appointments, setAppointments] = useState<Appointment[]>(MOCK_APPOINTMENTS);

  const addService = (serviceData: Omit<Service, "id">) => {
    const newService: Service = {
      ...serviceData,
      id: Math.random().toString(36).substring(7),
    };
    setServices([...services, newService]);
  };

  const updateService = (id: string, updatedData: Partial<Service>) => {
    setServices(services.map((s) => (s.id === id ? { ...s, ...updatedData } : s)));
  };

  const deleteService = (id: string) => {
    setServices(services.filter((s) => s.id !== id));
    // Also remove this service from barbers? Optionally, but for now let's just keep IDs.
    // Ideally we should clean up references.
    setBarbers(barbers.map(b => ({
      ...b,
      serviceIds: b.serviceIds.filter(sid => sid !== id)
    })));
  };

  const addBarber = (barberData: Omit<Barber, "id">) => {
    const newBarber: Barber = {
      ...barberData,
      id: Math.random().toString(36).substring(7),
    };
    setBarbers([...barbers, newBarber]);
  };

  const updateBarber = (id: string, updatedData: Partial<Barber>) => {
    setBarbers(barbers.map((b) => (b.id === id ? { ...b, ...updatedData } : b)));
  };

  const deleteBarber = (id: string) => {
    setBarbers(barbers.filter((b) => b.id !== id));
  };

  const addAppointment = (aptData: Omit<Appointment, "id" | "createdAt">) => {
    const newApt: Appointment = {
      ...aptData,
      id: Math.random().toString(36).substring(7),
      createdAt: new Date().toISOString(),
    };
    setAppointments([...appointments, newApt]);
  };

  const updateAppointmentStatus = (id: string, status: Appointment["status"]) => {
    setAppointments(appointments.map(a => a.id === id ? { ...a, status } : a));
  };

  return (
    <DataContext.Provider
      value={{
        services,
        barbers,
        appointments,
        platformFee: PLATFORM_FEE,
        addService,
        updateService,
        deleteService,
        addBarber,
        updateBarber,
        deleteBarber,
        addAppointment,
        updateAppointmentStatus,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
}
