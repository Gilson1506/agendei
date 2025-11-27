import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useData } from "@/context/DataContext";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  DollarSign, Users, CalendarCheck, Clock, Search, 
  Plus, Edit, Trash2, Check, X, Scissors, User 
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Service, Barber } from "@/lib/mockData";

export default function AdminDashboard() {
  const { 
    services, barbers, appointments, platformFee, 
    addService, updateService, deleteService,
    addBarber, updateBarber, deleteBarber 
  } = useData();
  
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("dashboard");

  // Stats
  const totalRevenue = appointments.reduce((acc, curr) => acc + curr.totalPrice, 0);
  const confirmedApts = appointments.filter(a => a.status === 'confirmed').length;
  
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

      <Tabs defaultValue="dashboard" value={activeTab} onValueChange={setActiveTab} className="w-full">
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
                <div className="text-2xl font-bold font-mono text-white">R$ {totalRevenue.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">+20.1% esse mês</p>
              </CardContent>
            </Card>
            
            <Card className="bg-card border-border hover:border-primary/50 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Agendamentos</CardTitle>
                <CalendarCheck className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{appointments.length}</div>
                <p className="text-xs text-muted-foreground">{appointments.filter(a => a.status === 'pending').length} pendentes</p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border hover:border-primary/50 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Profissionais</CardTitle>
                <Users className="h-4 w-4 text-blue-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{barbers.length}</div>
                <p className="text-xs text-muted-foreground">Ativos</p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border hover:border-primary/50 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Taxa Atual</CardTitle>
                <Clock className="h-4 w-4 text-orange-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">R$ {platformFee.toFixed(2)}</div>
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
                      <th className="px-4 py-3 rounded-r-lg">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.map((apt) => {
                      const service = services.find(s => s.id === apt.serviceId);
                      const barber = barbers.find(b => b.id === apt.barberId);
                      return (
                        <tr key={apt.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                          <td className="px-4 py-4 font-medium text-white">
                            {apt.customerName}
                            <div className="text-xs text-muted-foreground font-normal">{apt.customerPhone}</div>
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
                          <td className="px-4 py-4 font-mono">R$ {apt.totalPrice.toFixed(2)}</td>
                          <td className="px-4 py-4">
                            <Badge variant={apt.status === 'confirmed' ? 'default' : 'secondary'} className={apt.status === 'confirmed' ? 'bg-green-500/20 text-green-500 hover:bg-green-500/30' : 'bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/30'}>
                              {apt.status === 'confirmed' ? 'Pago' : 'Pendente'}
                            </Badge>
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
           <ServicesManager services={services} addService={addService} updateService={updateService} deleteService={deleteService} toast={toast} />
        </TabsContent>

        {/* BARBERS TAB */}
        <TabsContent value="barbers">
          <BarbersManager barbers={barbers} services={services} addBarber={addBarber} updateBarber={updateBarber} deleteBarber={deleteBarber} toast={toast} />
        </TabsContent>

        {/* SCHEDULE TAB (Just a placeholder for now as requested focus was on CRUD) */}
        <TabsContent value="schedule">
           <div className="text-center py-20 text-muted-foreground">
             <CalendarCheck className="h-16 w-16 mx-auto mb-4 opacity-20" />
             <h2 className="text-xl font-bold mb-2">Agenda Completa</h2>
             <p>Visualize todos os horários ocupados e livres aqui.</p>
           </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// --- SUB-COMPONENTS FOR CRUD ---

function ServicesManager({ services, addService, updateService, deleteService, toast }: any) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState({ name: "", description: "", price: "", duration: "" });

  const openAdd = () => {
    setEditingService(null);
    setFormData({ name: "", description: "", price: "", duration: "" });
    setIsDialogOpen(true);
  };

  const openEdit = (service: Service) => {
    setEditingService(service);
    setFormData({ 
      name: service.name, 
      description: service.description, 
      price: service.price.toString(), 
      duration: service.duration.toString() 
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    const price = parseFloat(formData.price);
    const duration = parseInt(formData.duration);

    if (!formData.name || isNaN(price) || isNaN(duration)) {
      toast({ title: "Erro", description: "Preencha todos os campos corretamente.", variant: "destructive" });
      return;
    }

    if (editingService) {
      updateService(editingService.id, { ...formData, price, duration });
      toast({ title: "Sucesso", description: "Serviço atualizado." });
    } else {
      addService({ ...formData, price, duration });
      toast({ title: "Sucesso", description: "Serviço criado." });
    }
    setIsDialogOpen(false);
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
                    if(confirm("Tem certeza que deseja excluir este serviço?")) {
                      deleteService(service.id);
                      toast({ title: "Serviço excluído" });
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
              <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="bg-background border-border" />
            </div>
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Input value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="bg-background border-border" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Preço (R$)</Label>
                <Input type="number" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="bg-background border-border" />
              </div>
              <div className="space-y-2">
                <Label>Duração (min)</Label>
                <Input type="number" value={formData.duration} onChange={e => setFormData({...formData, duration: e.target.value})} className="bg-background border-border" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSubmit} className="bg-primary text-white font-bold">Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function BarbersManager({ barbers, services, addBarber, updateBarber, deleteBarber, toast }: any) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBarber, setEditingBarber] = useState<Barber | null>(null);
  const [formData, setFormData] = useState({ name: "", avatar: "" });
  const [selectedServices, setSelectedServices] = useState<string[]>([]);

  const openAdd = () => {
    setEditingBarber(null);
    setFormData({ name: "", avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${Math.random()}&backgroundColor=b6e3f4` });
    setSelectedServices([]);
    setIsDialogOpen(true);
  };

  const openEdit = (barber: Barber) => {
    setEditingBarber(barber);
    setFormData({ name: barber.name, avatar: barber.avatar });
    setSelectedServices(barber.serviceIds);
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.name) {
      toast({ title: "Erro", description: "Nome é obrigatório.", variant: "destructive" });
      return;
    }

    if (editingBarber) {
      updateBarber(editingBarber.id, { ...formData, serviceIds: selectedServices });
      toast({ title: "Sucesso", description: "Profissional atualizado." });
    } else {
      addBarber({ ...formData, serviceIds: selectedServices });
      toast({ title: "Sucesso", description: "Profissional adicionado." });
    }
    setIsDialogOpen(false);
  };

  const toggleService = (serviceId: string) => {
    setSelectedServices(prev => 
      prev.includes(serviceId) 
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
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
                <img src={barber.avatar} alt={barber.name} className="w-16 h-16 rounded-full bg-muted border-2 border-border" />
                <div>
                  <h3 className="font-heading text-xl font-bold">{barber.name}</h3>
                  <p className="text-xs text-muted-foreground">{barber.serviceIds.length} serviços ativos</p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-1 mb-6">
                {barber.serviceIds.map(sid => {
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
                  if(confirm("Tem certeza que deseja excluir este profissional?")) {
                    deleteBarber(barber.id);
                    toast({ title: "Profissional excluído" });
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
            <div className="flex justify-center">
              <img src={formData.avatar} alt="Preview" className="w-24 h-24 rounded-full bg-muted border-2 border-primary" />
            </div>
            <div className="space-y-2">
              <Label>Nome do Profissional</Label>
              <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="bg-background border-border" />
            </div>
            
            <div className="space-y-3">
              <Label>Serviços Realizados</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-muted/20 p-4 rounded-lg border border-border">
                {services.map((service: Service) => (
                  <div key={service.id} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`srv-${service.id}`} 
                      checked={selectedServices.includes(service.id)}
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
            <Button onClick={handleSubmit} className="bg-primary text-white font-bold">Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
