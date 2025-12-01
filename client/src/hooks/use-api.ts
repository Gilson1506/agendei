import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Types
export interface Service {
    id: string;
    name: string;
    description: string;
    price: number;
    duration: number;
    pix_link?: string;
    qr_code_url?: string;
}

export interface Barber {
    id: string;
    name: string;
    avatar: string;
    profile_photo_url?: string;
    serviceIds: string[];
}

export interface Appointment {
    id: string;
    customer_name: string;
    customer_phone: string;
    service_id: string;
    barber_id: string;
    date: string;
    total_price: number;
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
    payment_receipt_url?: string;
}

export interface DashboardStats {
    totalRevenue: number;
    totalAppointments: number;
    confirmedAppointments: number;
    pendingAppointments: number;
    totalBarbers: number;
    totalServices: number;
    platformFee: number;
}

// API functions
async function fetchStats(): Promise<DashboardStats> {
    const res = await fetch('/api/stats');
    if (!res.ok) throw new Error('Failed to fetch stats');
    return res.json();
}

async function fetchServices(): Promise<Service[]> {
    const res = await fetch('/api/services');
    if (!res.ok) throw new Error('Failed to fetch services');
    return res.json();
}

async function fetchBarbers(): Promise<Barber[]> {
    const res = await fetch('/api/barbers');
    if (!res.ok) throw new Error('Failed to fetch barbers');
    return res.json();
}

async function fetchAppointments(): Promise<Appointment[]> {
    const res = await fetch('/api/appointments');
    if (!res.ok) throw new Error('Failed to fetch appointments');
    return res.json();
}

// Hooks
export function useStats() {
    return useQuery({
        queryKey: ['stats'],
        queryFn: fetchStats,
    });
}

export function useServices() {
    return useQuery({
        queryKey: ['services'],
        queryFn: fetchServices,
    });
}

export function useBarbers() {
    return useQuery({
        queryKey: ['barbers'],
        queryFn: fetchBarbers,
    });
}

export function useAppointments() {
    return useQuery({
        queryKey: ['appointments'],
        queryFn: fetchAppointments,
    });
}

// Mutations
export function useCreateService() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: Omit<Service, 'id'>) => {
            const res = await fetch('/api/services', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error('Failed to create service');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['services'] });
            queryClient.invalidateQueries({ queryKey: ['stats'] });
        },
    });
}

export function useUpdateService() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, data }: { id: string; data: Partial<Service> }) => {
            const res = await fetch(`/api/services/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error('Failed to update service');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['services'] });
        },
    });
}

export function useDeleteService() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const res = await fetch(`/api/services/${id}`, {
                method: 'DELETE',
            });
            if (!res.ok) throw new Error('Failed to delete service');
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['services'] });
            queryClient.invalidateQueries({ queryKey: ['stats'] });
        },
    });
}

export function useCreateBarber() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: Omit<Barber, 'id'>) => {
            const res = await fetch('/api/barbers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error('Failed to create barber');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['barbers'] });
            queryClient.invalidateQueries({ queryKey: ['stats'] });
        },
    });
}

export function useUpdateBarber() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, data }: { id: string; data: Partial<Barber> }) => {
            const res = await fetch(`/api/barbers/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error('Failed to update barber');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['barbers'] });
        },
    });
}

export function useDeleteBarber() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const res = await fetch(`/api/barbers/${id}`, {
                method: 'DELETE',
            });
            if (!res.ok) throw new Error('Failed to delete barber');
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['barbers'] });
            queryClient.invalidateQueries({ queryKey: ['stats'] });
        },
    });
}

export function useCreateAppointment() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: Omit<Appointment, 'id'>) => {
            const res = await fetch('/api/appointments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error('Failed to create appointment');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['appointments'] });
            queryClient.invalidateQueries({ queryKey: ['stats'] });
        },
    });
}

export function useUpdateAppointment() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, data }: { id: string; data: Partial<Appointment> }) => {
            const res = await fetch(`/api/appointments/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error('Failed to update appointment');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['appointments'] });
            queryClient.invalidateQueries({ queryKey: ['stats'] });
        },
    });
}


// Upload functions
// Helper function to compress image
async function compressImage(file: File, maxWidth = 1024, maxHeight = 1024, quality = 0.85): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                // Calculate new dimensions while maintaining aspect ratio
                if (width > height) {
                    if (width > maxWidth) {
                        height = (height * maxWidth) / width;
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width = (width * maxHeight) / height;
                        height = maxHeight;
                    }
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject(new Error('Failed to get canvas context'));
                    return;
                }

                ctx.drawImage(img, 0, 0, width, height);

                // Convert to JPEG with compression
                const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
                resolve(compressedBase64);
            };
            img.onerror = () => reject(new Error('Failed to load image'));
            img.src = e.target?.result as string;
        };
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
    });
}

export async function uploadBarberPhoto(barberId: string, file: File): Promise<string> {
    try {
        // Compress image before upload
        const base64 = await compressImage(file);

        const res = await fetch(`/api/upload/barber-photo/${barberId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                file: base64,
                fileName: file.name.replace(/\.[^/.]+$/, '.jpg'), // Change extension to .jpg
                contentType: 'image/jpeg',
            }),
        });

        if (!res.ok) throw new Error('Failed to upload photo');
        const data = await res.json();
        return data.url;
    } catch (error) {
        throw error;
    }
}

export async function uploadPaymentReceipt(appointmentId: string, file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async () => {
            try {
                const base64 = reader.result as string;
                const res = await fetch(`/api/upload/payment-receipt/${appointmentId}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        file: base64,
                        fileName: file.name,
                        contentType: file.type,
                    }),
                });
                if (!res.ok) throw new Error('Failed to upload receipt');
                const data = await res.json();
                resolve(data.url);
            } catch (error) {
                reject(error);
            }
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

export async function uploadQRCode(serviceId: string, file: File): Promise<string> {
    try {
        // Compress image before upload
        const base64 = await compressImage(file);

        const res = await fetch(`/api/upload/qr-code/${serviceId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                file: base64,
                fileName: file.name.replace(/\.[^/.]+$/, '.jpg'), // Change extension to .jpg
                contentType: 'image/jpeg',
            }),
        });

        if (!res.ok) throw new Error('Failed to upload QR code');
        const data = await res.json();
        return data.url;
    } catch (error) {
        throw error;
    }
}
