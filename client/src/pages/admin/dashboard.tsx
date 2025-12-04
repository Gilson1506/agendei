import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format, parseISO, isSameDay, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  DollarSign, Users, CalendarCheck, Clock, Search,
  Plus, Edit, Trash2, Check, X, Scissors, User, Eye, FileText, Loader2
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import {
  useStats, useServices, useBarbers, useAppointments,
  useCreateService, useUpdateService, useDeleteService,
  useCreateBarber, useUpdateBarber, useDeleteBarber,
  useUpdateAppointment,
  uploadBarberPhoto, uploadQRCode,
  type Service, type Barber, type Appointment
} from "@/hooks/use-api";

export default function AdminDashboard() {
  const { toast } = useToast();
  const [location, setLocation] = useLocation();

  const getTabFromUrl = () => {
    if (location === "/admin/schedule") return "schedule";
    if (location === "/admin/services") return "services";
    return "dashboard";
  };

  const [activeTab, setActiveTab] = useState(getTabFromUrl());
  const [receiptViewer, setReceiptViewer] = useState<{ open: boolean; url: string | null }>({ open: false, url: null });
  const [updatingAppointment, setUpdatingAppointment] = useState<string | null>(null);
  const [cancelDialog, setCancelDialog] = useState<{ open: boolean; appointmentId: string | null }>({ open: false, appointmentId: null });

  useEffect(() => {
    setActiveTab(getTabFromUrl());
  }, [location]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (value === "dashboard") setLocation("/admin/dashboard");
    else if (value === "schedule") setLocation("/admin/schedule");
    else if (value === "services") setLocation("/admin/services");
    // Barbers tab stays on dashboard route for now or we can add a route
  };

  // Fetch data from API
  const { data: stats, isLoading: statsLoading } = useStats();
  const { data: services = [], isLoading: servicesLoading } = useServices();
  const { data: barbers = [], isLoading: barbersLoading } = useBarbers();
  const { data: appointments = [], isLoading: appointmentsLoading } = useAppointments();

  // Show loading state
  if (statsLoading || servicesLoading || barbersLoading || appointmentsLoading) {
    return (
      <div className="container mx-auto py-8 px-4 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando dados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold text-white">Admin Panel</h1>
          <p className="text-muted-foreground">Gerencie sua barbearia em um só lugar.</p>
        </div>
        <div className="flex items-center gap-2 text-sm bg-primary/10 text-primary px-3 py-1 rounded-full border border-primary/20">
          <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
          Sistema Operante
        </div>
      </div>

      <Tabs defaultValue="dashboard" value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-8 bg-card border border-border">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="services">Serviços</TabsTrigger>
          <TabsTrigger value="barbers">Profissionais</TabsTrigger>
          <TabsTrigger value="schedule">Agenda</TabsTrigger>
        </TabsList>

        {/* DASHBOARD TAB */}
        <TabsContent value="dashboard" className="space-y-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-card border-border hover:border-primary/50 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Receita Total</CardTitle>
                <DollarSign className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-mono text-white">R$ {stats?.totalRevenue.toFixed(2) || '0.00'}</div>
                <p className="text-xs text-muted-foreground">+20.1% esse mês</p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border hover:border-primary/50 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Agendamentos</CardTitle>
                <CalendarCheck className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{stats?.totalAppointments || 0}</div>
                <p className="text-xs text-muted-foreground">{stats?.pendingAppointments || 0} pendentes</p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border hover:border-primary/50 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Profissionais</CardTitle>
                <Users className="h-4 w-4 text-blue-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{stats?.totalBarbers || 0}</div>
                <p className="text-xs text-muted-foreground">Ativos</p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border hover:border-primary/50 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Taxa Atual</CardTitle>
                <Clock className="h-4 w-4 text-orange-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">R$ {stats?.platformFee.toFixed(2) || '0.00'}</div>
                <p className="text-xs text-muted-foreground">Fixa por agendamento</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Appointments Table */}
          <Card className="border-border bg-card/50">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="font-heading">Últimos Agendamentos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-muted-foreground uppercase bg-muted/30">
                    <tr>
                      <th className="px-4 py-3 rounded-l-lg">Cliente</th>
                      <th className="px-4 py-3">Serviço</th>
                      <th className="px-4 py-3">Barbeiro</th>
                      <th className="px-4 py-3">Data/Hora</th>
                      <th className="px-4 py-3">Valor</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Comprovante</th>
                      <th className="px-4 py-3 rounded-r-lg">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.slice(0, 5).map((apt: any) => {
                      const service = services.find(s => s.id === apt.service_id);
                      const barber = barbers.find(b => b.id === apt.barber_id);
                      return (
                        <tr key={apt.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                          <td className="px-4 py-4 font-medium text-white">
                            {apt.customer_name}
                            <div className="text-xs text-muted-foreground font-normal">{apt.customer_phone}</div>
                          </td>
                          <td className="px-4 py-4">{service?.name || "Serviço Removido"}</td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                              {barber && <img src={barber.avatar} className="w-6 h-6 rounded-full bg-muted" alt="" />}
                              {barber?.name || "N/A"}
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            {format(new Date(apt.date), "dd/MM", { locale: ptBR })}
                            <span className="ml-2 text-muted-foreground">{format(new Date(apt.date), "HH:mm")}</span>
                          </td>
                          <td className="px-4 py-4 font-mono">R$ {apt.total_price.toFixed(2)}</td>
                          <td className="px-4 py-4">
                            <Badge variant={apt.status === 'confirmed' ? 'default' : 'secondary'} className={apt.status === 'confirmed' ? 'bg-green-500/20 text-green-500 hover:bg-green-500/30' : 'bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/30'}>
                              {apt.status === 'confirmed' ? 'Pago' : 'Pendente'}
                            </Badge>
                          </td>
                          <td className="px-4 py-4">
                            {(apt as Appointment).payment_receipt_url ? (
                              <Button
                                size="icon"
                                variant="outline"
                                onClick={() => setReceiptViewer({ open: true, url: (apt as Appointment).payment_receipt_url || null })}
                                className="h-8 w-8"
                                title="Ver comprovante"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            ) : (
                              <Button
                                size="icon"
                                variant="outline"
                                disabled
                                className="h-8 w-8 opacity-50"
                                title="Sem comprovante"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            )}
                          </td>
                          <td className="px-4 py-4">
                            <AppointmentActions
                              appointment={apt}
                              updatingId={updatingAppointment}
                              onUpdate={setUpdatingAppointment}
                              onCancelRequest={(id) => setCancelDialog({ open: true, appointmentId: id })}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SERVICES TAB */}
        <TabsContent value="services">
          <ServicesManager services={services} />
        </TabsContent>

        {/* BARBERS TAB */}
        <TabsContent value="barbers">
          <BarbersManager barbers={barbers} services={services} />
        </TabsContent>

        {/* SCHEDULE TAB (Just a placeholder for now as requested focus was on CRUD) */}
        <TabsContent value="schedule">
          <ScheduleManager appointments={appointments} barbers={barbers} services={services} />
        </TabsContent>
      </Tabs>

      {/* Receipt Viewer Dialog */}
      <Dialog open={receiptViewer.open} onOpenChange={(open) => setReceiptViewer({ open, url: receiptViewer.url })}>
        <DialogContent className="bg-card border-border text-white max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Comprovante de Pagamento</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            {receiptViewer.url && (
              <div className="space-y-4">
                {receiptViewer.url.toLowerCase().endsWith('.pdf') ? (
                  <iframe
                    src={receiptViewer.url}
                    className="w-full h-[600px] border border-border rounded"
                    title="Comprovante PDF"
                  />
                ) : (
                  <img
                    src={receiptViewer.url}
                    alt="Comprovante de pagamento"
                    className="w-full h-auto border border-border rounded"
                  />
                )}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => window.open(receiptViewer.url || '', '_blank')}
                    className="flex-1"
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Abrir em Nova Aba
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = receiptViewer.url || '';
                      link.download = 'comprovante';
                      link.click();
                    }}
                    className="flex-1"
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Cancel Confirmation Dialog */}
      <CancelConfirmationDialog
        open={cancelDialog.open}
        appointmentId={cancelDialog.appointmentId}
        onConfirm={(id) => {
          setUpdatingAppointment(id);
          setCancelDialog({ open: false, appointmentId: null });
        }}
        onCancel={() => setCancelDialog({ open: false, appointmentId: null })}
      />
    </div>
  );
}

// Component for appointment action buttons
function AppointmentActions({ appointment, updatingId, onUpdate, onCancelRequest }: {
  appointment: Appointment;
  updatingId: string | null;
  onUpdate: (id: string | null) => void;
  onCancelRequest: (id: string) => void;
}) {
  const { toast } = useToast();
  const updateAppointment = useUpdateAppointment();
  const isUpdating = updatingId === appointment.id;

  const handleStatusUpdate = async (newStatus: string) => {
    onUpdate(appointment.id);
    updateAppointment.mutate(
      { id: appointment.id, data: { status: newStatus } },
      {
        onSuccess: () => {
          toast({
            title: "Sucesso",
            description: `Agendamento ${newStatus === 'confirmed' ? 'confirmado' : newStatus === 'completed' ? 'concluído' : 'cancelado'}.`
          });
          onUpdate(null);
        },
        onError: () => {
          toast({
            title: "Erro",
            description: "Falha ao atualizar agendamento.",
            variant: "destructive"
          });
          onUpdate(null);
        }
      }
    );
  };

  return (
    <div className="flex gap-1">
      {appointment.status === 'pending' && (
        <Button
          size="icon"
          variant="outline"
          onClick={() => handleStatusUpdate('confirmed')}
          disabled={isUpdating}
          className="h-8 w-8 text-green-500 hover:text-green-600 hover:bg-green-500/10"
          title="Confirmar pagamento"
        >
          {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
        </Button>
      )}
      {appointment.status === 'confirmed' && (
        <Button
          size="icon"
          variant="outline"
          onClick={() => handleStatusUpdate('completed')}
          disabled={isUpdating}
          className="h-8 w-8 text-blue-500 hover:text-blue-600 hover:bg-blue-500/10"
          title="Marcar como concluído"
        >
          {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
        </Button>
      )}
      <Button
        size="icon"
        variant="outline"
        onClick={() => onCancelRequest(appointment.id)}
        disabled={isUpdating}
        className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-500/10"
        title="Cancelar agendamento"
      >
        {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
      </Button>
    </div>
  );
}

// Custom cancel confirmation dialog
function CancelConfirmationDialog({ open, appointmentId, onConfirm, onCancel }: {
  open: boolean;
  appointmentId: string | null;
  onConfirm: (id: string) => void;
  onCancel: () => void;
}) {
  const { toast } = useToast();
  const updateAppointment = useUpdateAppointment();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleConfirm = () => {
    if (!appointmentId) return;

    setIsProcessing(true);
    updateAppointment.mutate(
      { id: appointmentId, data: { status: 'cancelled' } },
      {
        onSuccess: () => {
          toast({
            title: "Agendamento Cancelado",
            description: "O agendamento foi cancelado com sucesso."
          });
          setIsProcessing(false);
          onCancel();
        },
        onError: () => {
          toast({
            title: "Erro",
            description: "Falha ao cancelar agendamento.",
            variant: "destructive"
          });
          setIsProcessing(false);
        }
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !isProcessing && !open && onCancel()}>
      <DialogContent className="bg-card border-border text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-red-500 flex items-center gap-2">
            <X className="h-6 w-6" />
            Cancelar Agendamento
          </DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="text-muted-foreground mb-4">
            Tem certeza que deseja cancelar este agendamento?
          </p>
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
            <p className="text-sm text-yellow-500">
              ⚠️ Esta ação não pode ser desfeita. O cliente será notificado sobre o cancelamento.
            </p>
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isProcessing}
            className="flex-1"
          >
            Não, manter agendamento
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isProcessing}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white"
          >
            {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Sim, cancelar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


// --- SUB-COMPONENTS FOR CRUD ---

function ServicesManager({ services }: { services: Service[] }) {
  const { toast } = useToast(); // Use useToast hook directly inside the component
  const createService = useCreateService();
  const updateService = useUpdateService();
  const deleteService = useDeleteService();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState({ name: "", description: "", price: "", duration: "", pix_link: "", qr_code_url: "" });
  const [isUploadingQR, setIsUploadingQR] = useState(false);

  const openAdd = () => {
    setEditingService(null);
    setFormData({ name: "", description: "", price: "", duration: "", pix_link: "", qr_code_url: "" });
    setIsDialogOpen(true);
  };

  const openEdit = (service: Service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      description: service.description,
      price: service.price.toString(),
      duration: service.duration.toString(),
      pix_link: service.pix_link || "",
      qr_code_url: service.qr_code_url || ""
    });
    setIsDialogOpen(true);
  };

  const handleQRCodeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingService) return;

    setIsUploadingQR(true);
    try {
      const url = await uploadQRCode(editingService.id, file);
      setFormData({ ...formData, qr_code_url: url });
      toast({ title: "Sucesso", description: "QR Code enviado com sucesso." });
    } catch (error) {
      toast({ title: "Erro", description: "Falha ao enviar QR Code.", variant: "destructive" });
    } finally {
      setIsUploadingQR(false);
    }
  };

  const handleSubmit = () => {
    const price = parseFloat(formData.price);
    const duration = parseInt(formData.duration);

    if (!formData.name || isNaN(price) || isNaN(duration)) {
      toast({ title: "Erro", description: "Preencha todos os campos corretamente.", variant: "destructive" });
      return;
    }

    const serviceData: any = {
      name: formData.name,
      description: formData.description,
      price,
      duration
    };

    if (formData.pix_link) serviceData.pix_link = formData.pix_link;
    if (formData.qr_code_url) serviceData.qr_code_url = formData.qr_code_url;

    if (editingService) {
      updateService.mutate(
        { id: editingService.id, data: serviceData },
        {
          onSuccess: () => {
            toast({ title: "Sucesso", description: "Serviço atualizado." });
            setIsDialogOpen(false);
          },
          onError: () => {
            toast({ title: "Erro", description: "Falha ao atualizar serviço.", variant: "destructive" });
          }
        }
      );
    } else {
      createService.mutate(
        serviceData,
        {
          onSuccess: () => {
            toast({ title: "Sucesso", description: "Serviço criado." });
            setIsDialogOpen(false);
          },
          onError: () => {
            toast({ title: "Erro", description: "Falha ao criar serviço.", variant: "destructive" });
          }
        }
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-heading font-bold">Gerenciar Serviços</h2>
        <Button onClick={openAdd} className="bg-primary hover:bg-primary/90 text-white font-bold">
          <Plus className="mr-2 h-4 w-4" /> Novo Serviço
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map((service: Service) => (
          <Card key={service.id} className="bg-card border-border hover:border-primary/50 transition-all">
            <CardHeader className="flex flex-row justify-between items-start pb-2">
              <div>
                <CardTitle className="text-lg font-bold">{service.name}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">{service.description}</p>
              </div>
              <div className="bg-primary/10 text-primary px-2 py-1 rounded text-xs font-bold">
                {service.duration} min
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-end mt-4">
                <div className="text-2xl font-mono font-bold text-white">R$ {service.price.toFixed(2)}</div>
                <div className="flex gap-2">
                  <Button size="icon" variant="outline" onClick={() => openEdit(service)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="destructive" onClick={() => {
                    if (confirm("Tem certeza que deseja excluir este serviço?")) {
                      deleteService.mutate(service.id, {
                        onSuccess: () => toast({ title: "Serviço excluído" }),
                        onError: () => toast({ title: "Erro ao excluir", variant: "destructive" })
                      });
                    }
                  }}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-card border-border text-white">
          <DialogHeader>
            <DialogTitle>{editingService ? "Editar Serviço" : "Novo Serviço"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nome do Serviço</Label>
              <Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="bg-background border-border" />
            </div>
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Input value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="bg-background border-border" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Preço (R$)</Label>
                <Input type="number" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} className="bg-background border-border" />
              </div>
              <div className="space-y-2">
                <Label>Duração (min)</Label>
                <Input type="number" value={formData.duration} onChange={e => setFormData({ ...formData, duration: e.target.value })} className="bg-background border-border" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Link PIX</Label>
              <Input value={formData.pix_link} onChange={e => setFormData({ ...formData, pix_link: e.target.value })} placeholder="https://..." className="bg-background border-border" />
            </div>
            <div className="space-y-2">
              <Label>QR Code PIX</Label>
              {editingService && (
                <div className="space-y-2">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleQRCodeUpload}
                    disabled={isUploadingQR}
                    className="bg-background border-border"
                  />
                  {isUploadingQR && <p className="text-xs text-muted-foreground">Enviando...</p>}
                  {formData.qr_code_url && (
                    <div className="mt-2">
                      <img src={formData.qr_code_url} alt="QR Code" className="w-32 h-32 border border-border rounded" />
                    </div>
                  )}
                </div>
              )}
              {!editingService && (
                <p className="text-xs text-muted-foreground">Salve o serviço primeiro para fazer upload do QR Code</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
            <Button
              onClick={handleSubmit}
              disabled={createService.isPending || updateService.isPending}
              className="bg-primary hover:bg-primary/90"
            >
              {(createService.isPending || updateService.isPending) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {editingService ? "Atualizar" : "Criar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function BarbersManager({ barbers, services }: any) {
  const { toast } = useToast();
  const createBarber = useCreateBarber();
  const updateBarber = useUpdateBarber();
  const deleteBarber = useDeleteBarber();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBarber, setEditingBarber] = useState<Barber | null>(null);
  const [formData, setFormData] = useState({ name: "", avatar: "" });
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  const openAdd = () => {
    setEditingBarber(null);
    setFormData({ name: "", avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${Math.random()}&backgroundColor=b6e3f4` });
    setSelectedServices([]);
    setIsDialogOpen(true);
  };

  const openEdit = (barber: Barber) => {
    setEditingBarber(barber);
    setFormData({
      name: barber.name,
      avatar: barber.profile_photo_url || barber.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${Math.random()}&backgroundColor=b6e3f4`
    });
    setSelectedServices(barber.serviceIds || []);
    setIsDialogOpen(true);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingBarber) return;

    setIsUploadingPhoto(true);
    try {
      const url = await uploadBarberPhoto(editingBarber.id, file);
      setFormData(prev => ({ ...prev, avatar: url }));
      // Update barber with new photo URL imediatamente
      await updateBarber.mutateAsync({ id: editingBarber.id, data: { avatar: url, profile_photo_url: url } });
      toast({ title: "Sucesso", description: "Foto enviada com sucesso." });
    } catch (error) {
      toast({ title: "Erro", description: "Falha ao enviar foto.", variant: "destructive" });
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleSubmit = () => {
    if (!formData.name) {
      toast({ title: "Erro", description: "Nome é obrigatório.", variant: "destructive" });
      return;
    }

    const data: any = { name: formData.name, avatar: formData.avatar, serviceIds: selectedServices };
    if (editingBarber && formData.avatar.startsWith('http') && formData.avatar.includes('supabase')) {
      data.profile_photo_url = formData.avatar;
    }

    if (editingBarber) {
      updateBarber.mutate(
        { id: editingBarber.id, data },
        {
          onSuccess: () => {
            toast({ title: "Sucesso", description: "Profissional atualizado." });
            setIsDialogOpen(false);
          },
          onError: () => {
            toast({ title: "Erro", description: "Falha ao atualizar profissional.", variant: "destructive" });
          }
        }
      );
    } else {
      createBarber.mutate(data, {
        onSuccess: () => {
          toast({ title: "Sucesso", description: "Profissional adicionado." });
          setIsDialogOpen(false);
        },
        onError: () => {
          toast({ title: "Erro", description: "Falha ao adicionar profissional.", variant: "destructive" });
        }
      });
    }
  };

  const toggleService = (serviceId: string) => {
    setSelectedServices(prev => {
      const current = prev || [];
      return current.includes(serviceId)
        ? current.filter(id => id !== serviceId)
        : [...current, serviceId];
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-heading font-bold">Gerenciar Profissionais</h2>
        <Button onClick={openAdd} className="bg-primary hover:bg-primary/90 text-white font-bold">
          <Plus className="mr-2 h-4 w-4" /> Novo Profissional
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {barbers.map((barber: Barber) => (
          <Card key={barber.id} className="bg-card border-border hover:border-primary/50 transition-all overflow-hidden">
            <div className="h-2 bg-primary w-full" />
            <CardContent className="pt-6">
              <div className="flex items-center gap-4 mb-4">
                <img src={barber.profile_photo_url || barber.avatar} alt={barber.name} className="w-16 h-16 rounded-full bg-muted border-2 border-border object-cover" />
                <div>
                  <h3 className="font-heading text-xl font-bold">{barber.name}</h3>
                  <p className="text-xs text-muted-foreground">{(barber.serviceIds || []).length} serviços ativos</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-1 mb-6">
                {(barber.serviceIds || []).map(sid => {
                  const s = services.find((ser: Service) => ser.id === sid);
                  return s ? (
                    <span key={sid} className="text-[10px] px-2 py-1 rounded-full bg-muted text-muted-foreground border border-border">
                      {s.name}
                    </span>
                  ) : null;
                })}
              </div>

              <div className="flex gap-2 w-full">
                <Button variant="outline" className="flex-1" onClick={() => openEdit(barber)}>
                  <Edit className="mr-2 h-4 w-4" /> Editar
                </Button>
                <Button variant="destructive" size="icon" onClick={() => {
                  if (confirm("Tem certeza que deseja excluir este profissional?")) {
                    deleteBarber.mutate(barber.id, {
                      onSuccess: () => toast({ title: "Profissional excluído" }),
                      onError: () => toast({ title: "Erro ao excluir", variant: "destructive" })
                    });
                  }
                }}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-card border-border text-white max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingBarber ? "Editar Profissional" : "Novo Profissional"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="flex flex-col items-center gap-4">
              <img src={formData.avatar} alt="Preview" className="w-24 h-24 rounded-full bg-muted border-2 border-primary object-cover" />
              <div className="space-y-2 w-full">
                <Label>Upload Foto de Perfil</Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  disabled={isUploadingPhoto || !editingBarber}
                  className="bg-background border-border"
                />
                {isUploadingPhoto && <p className="text-xs text-muted-foreground">Enviando...</p>}
                {!editingBarber && (
                  <p className="text-xs text-muted-foreground text-center">Salve o profissional primeiro para fazer upload da foto</p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Nome do Profissional</Label>
              <Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="bg-background border-border" />
            </div>

            <div className="space-y-3">
              <Label>Serviços Realizados</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-muted/20 p-4 rounded-lg border border-border">
                {services.map((service: Service) => (
                  <div key={service.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`srv-${service.id}`}
                      checked={(selectedServices || []).includes(service.id)}
                      onCheckedChange={() => toggleService(service.id)}
                      className="border-primary/50 data-[state=checked]:bg-primary data-[state=checked]:text-white"
                    />
                    <label
                      htmlFor={`srv-${service.id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {service.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
            <Button
              onClick={handleSubmit}
              disabled={createBarber.isPending || updateBarber.isPending}
              className="bg-primary hover:bg-primary/90"
            >
              {(createBarber.isPending || updateBarber.isPending) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {editingBarber ? "Atualizar" : "Criar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ScheduleManager({ appointments, barbers, services }: { appointments: Appointment[], barbers: Barber[], services: Service[] }) {
  const [receiptViewer, setReceiptViewer] = useState<{ open: boolean; url: string | null }>({ open: false, url: null });
  const [updatingAppointment, setUpdatingAppointment] = useState<string | null>(null);
  const [cancelDialog, setCancelDialog] = useState<{ open: boolean; appointmentId: string | null }>({ open: false, appointmentId: null });

  // Sort appointments by date
  const sortedAppointments = [...appointments].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Group by date
  const groupedAppointments = sortedAppointments.reduce((groups, apt) => {
    const date = apt.date.split('T')[0];
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(apt);
    return groups;
  }, {} as Record<string, Appointment[]>);

  const dates = Object.keys(groupedAppointments).sort();

  return (
    <div className="space-y-8">
      {dates.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground">
          <CalendarCheck className="h-16 w-16 mx-auto mb-4 opacity-20" />
          <p>Nenhum agendamento encontrado.</p>
        </div>
      ) : (
        dates.map(date => (
          <Card key={date} className="bg-card border-border">
            <CardHeader className="bg-muted/30 pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <CalendarCheck className="h-5 w-5 text-primary" />
                {format(parseISO(date), "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid gap-4">
                {groupedAppointments[date].map(apt => {
                  const service = services.find(s => s.id === apt.service_id);
                  const barber = barbers.find(b => b.id === apt.barber_id);
                  return (
                    <div key={apt.id} className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 rounded-lg border border-border bg-background hover:border-primary/50 transition-colors gap-4">
                      <div className="flex items-center gap-4">
                        <div className="flex flex-col items-center justify-center min-w-[60px] px-2 py-1 bg-primary/10 rounded text-primary font-bold">
                          <Clock className="h-4 w-4 mb-1" />
                          {format(parseISO(apt.date), "HH:mm")}
                        </div>
                        <div>
                          <h4 className="font-bold text-lg">{apt.customer_name}</h4>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1"><Scissors className="h-3 w-3" /> {service?.name}</span>
                            <span className="hidden sm:inline">•</span>
                            <span className="flex items-center gap-1"><User className="h-3 w-3" /> {barber?.name}</span>
                            <span className="hidden sm:inline">•</span>
                            <span>{apt.customer_phone}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                        <div className="flex items-center gap-2">
                          <Badge variant={apt.status === 'confirmed' ? 'default' : apt.status === 'completed' ? 'secondary' : apt.status === 'cancelled' ? 'destructive' : 'outline'}
                            className={
                              apt.status === 'confirmed' ? 'bg-green-500/20 text-green-500 hover:bg-green-500/30' :
                                apt.status === 'completed' ? 'bg-blue-500/20 text-blue-500 hover:bg-blue-500/30' :
                                  apt.status === 'cancelled' ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30' :
                                    'bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/30'
                            }>
                            {apt.status === 'confirmed' ? 'Confirmado' : apt.status === 'completed' ? 'Concluído' : apt.status === 'cancelled' ? 'Cancelado' : 'Pendente'}
                          </Badge>
                          <div className="font-bold text-lg">R$ {Number(apt.total_price).toFixed(2)}</div>
                        </div>

                        <div className="flex items-center gap-2">
                          {(apt as Appointment).payment_receipt_url ? (
                            <Button
                              size="icon"
                              variant="outline"
                              onClick={() => setReceiptViewer({ open: true, url: (apt as Appointment).payment_receipt_url || null })}
                              className="h-8 w-8"
                              title="Ver comprovante"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          ) : (
                            <Button
                              size="icon"
                              variant="outline"
                              disabled
                              className="h-8 w-8 opacity-50"
                              title="Sem comprovante"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          )}
                          <AppointmentActions
                            appointment={apt}
                            updatingId={updatingAppointment}
                            onUpdate={setUpdatingAppointment}
                            onCancelRequest={(id) => setCancelDialog({ open: true, appointmentId: id })}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))
      )}

      <Dialog open={receiptViewer.open} onOpenChange={(open) => setReceiptViewer({ open, url: receiptViewer.url })}>
        <DialogContent className="bg-card border-border text-white max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Comprovante de Pagamento</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            {receiptViewer.url && (
              <div className="space-y-4">
                {receiptViewer.url.toLowerCase().endsWith('.pdf') ? (
                  <iframe
                    src={receiptViewer.url}
                    className="w-full h-[600px] border border-border rounded"
                    title="Comprovante PDF"
                  />
                ) : (
                  <img
                    src={receiptViewer.url}
                    alt="Comprovante de pagamento"
                    className="w-full h-auto border border-border rounded"
                  />
                )}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => window.open(receiptViewer.url || '', '_blank')}
                    className="flex-1"
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Abrir em Nova Aba
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <CancelConfirmationDialog
        open={cancelDialog.open}
        appointmentId={cancelDialog.appointmentId}
        onConfirm={(id) => {
          setUpdatingAppointment(id);
          setCancelDialog({ open: false, appointmentId: null });
        }}
        onCancel={() => setCancelDialog({ open: false, appointmentId: null })}
      />
    </div>
  );
}
