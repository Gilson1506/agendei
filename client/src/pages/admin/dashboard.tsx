import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MOCK_APPOINTMENTS, SERVICES, BARBERS } from "@/lib/mockData";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { DollarSign, Users, CalendarCheck, Clock, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function AdminDashboard() {
  // Calculate stats
  const totalRevenue = MOCK_APPOINTMENTS.reduce((acc, curr) => acc + curr.totalPrice, 0);
  const confirmedApts = MOCK_APPOINTMENTS.filter(a => a.status === 'confirmed').length;
  const pendingApts = MOCK_APPOINTMENTS.filter(a => a.status === 'pending').length;

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-muted-foreground">Visão geral da barbearia hoje.</p>
        </div>
        <div className="flex items-center gap-2 text-sm bg-primary/10 text-primary px-3 py-1 rounded-full border border-primary/20">
          <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
          Sistema Operante
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
            <div className="text-2xl font-bold text-white">{MOCK_APPOINTMENTS.length}</div>
            <p className="text-xs text-muted-foreground">2 pendentes</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border hover:border-primary/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Clientes Ativos</CardTitle>
            <Users className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">142</div>
            <p className="text-xs text-muted-foreground">+12 novos essa semana</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border hover:border-primary/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Tempo Médio</CardTitle>
            <Clock className="h-4 w-4 text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">42m</div>
            <p className="text-xs text-muted-foreground">Por atendimento</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Appointments Table */}
      <Card className="border-border bg-card/50">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="font-heading">Últimos Agendamentos</CardTitle>
          <div className="relative w-64 hidden md:block">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar cliente..." className="pl-8 bg-background/50 border-border" />
          </div>
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
                {MOCK_APPOINTMENTS.map((apt) => {
                  const service = SERVICES.find(s => s.id === apt.serviceId);
                  const barber = BARBERS.find(b => b.id === apt.barberId);
                  return (
                    <tr key={apt.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-4 font-medium text-white">
                        {apt.customerName}
                        <div className="text-xs text-muted-foreground font-normal">{apt.customerPhone}</div>
                      </td>
                      <td className="px-4 py-4">{service?.name}</td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                           <img src={barber?.avatar} className="w-6 h-6 rounded-full bg-muted" alt="" />
                           {barber?.name}
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
    </div>
  );
}
