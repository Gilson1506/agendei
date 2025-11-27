import { addDays, format, setHours, setMinutes } from "date-fns";

export type Service = {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number; // in minutes
  image?: string;
};

export type Barber = {
  id: string;
  name: string;
  avatar: string;
};

export type Appointment = {
  id: string;
  serviceId: string;
  barberId: string;
  date: string; // ISO string
  customerName: string;
  customerPhone: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  totalPrice: number;
  createdAt: string;
};

export const SERVICES: Service[] = [
  {
    id: "1",
    name: "Corte Masculino",
    description: "Corte degradê, social ou na tesoura. Acabamento premium.",
    price: 40,
    duration: 45,
  },
  {
    id: "2",
    name: "Barba Completa",
    description: "Modelagem, toalha quente e hidratação.",
    price: 30,
    duration: 30,
  },
  {
    id: "3",
    name: "Combo Bronks (Corte + Barba)",
    description: "O pacote completo para o visual perfeito.",
    price: 60,
    duration: 75,
  },
  {
    id: "4",
    name: "Pezinho / Acabamento",
    description: "Manutenção dos contornos.",
    price: 15,
    duration: 15,
  },
  {
    id: "5",
    name: "Sobrancelha",
    description: "Design na navalha ou pinça.",
    price: 10,
    duration: 10,
  },
];

export const BARBERS: Barber[] = [
  {
    id: "1",
    name: "Matheus 'Navalha'",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Matheus&backgroundColor=b6e3f4",
  },
  {
    id: "2",
    name: "Lucas 'Fade'",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Lucas&backgroundColor=c0aede",
  },
  {
    id: "3",
    name: "João 'Bigode'",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Joao&backgroundColor=ffdfbf",
  },
];

// Generate some fake past/future appointments
export const MOCK_APPOINTMENTS: Appointment[] = [
  {
    id: "apt-1",
    serviceId: "3",
    barberId: "1",
    date: new Date().toISOString(),
    customerName: "Carlos Silva",
    customerPhone: "11999999999",
    status: "confirmed",
    totalPrice: 70, // 60 + 10 fee
    createdAt: new Date().toISOString(),
  },
  {
    id: "apt-2",
    serviceId: "1",
    barberId: "2",
    date: addDays(new Date(), 1).toISOString(),
    customerName: "Pedro Santos",
    customerPhone: "11988888888",
    status: "pending",
    totalPrice: 50, // 40 + 10 fee
    createdAt: new Date().toISOString(),
  },
];

export const PLATFORM_FEE = 10;
