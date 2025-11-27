import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SERVICES, BARBERS, PLATFORM_FEE } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Check, ChevronRight, ChevronLeft, Clock, Calendar as CalendarIcon, CreditCard, Copy, Loader2 } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { format, addDays, isSameDay, setHours, setMinutes } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Link } from "wouter";

const TIME_SLOTS = [
  "09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"
];

export default function BookingPage() {
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [selectedBarber, setSelectedBarber] = useState<string | null>(null);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const { toast } = useToast();

  const service = SERVICES.find(s => s.id === selectedService);
  const barber = BARBERS.find(b => b.id === selectedBarber);
  const total = service ? service.price + PLATFORM_FEE : 0;

  const handleNext = () => {
    if (step === 1 && !selectedService) {
      toast({ title: "Selecione um serviço", variant: "destructive" });
      return;
    }
    if (step === 2 && !selectedBarber) {
      toast({ title: "Selecione um barbeiro", variant: "destructive" });
      return;
    }
    if (step === 3 && (!date || !selectedTime)) {
      toast({ title: "Selecione data e horário", variant: "destructive" });
      return;
    }
    if (step === 4 && (!customerName || !customerPhone)) {
      toast({ title: "Preencha seus dados", variant: "destructive" });
      return;
    }
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handlePayment = () => {
    setIsProcessingPayment(true);
    // Simulate PIX check loop
    setTimeout(() => {
      setIsProcessingPayment(false);
      setPaymentConfirmed(true);
      toast({ 
        title: "Pagamento Confirmado!", 
        description: "Seu agendamento foi realizado com sucesso.",
        className: "bg-green-600 text-white border-none"
      });
    }, 3000);
  };

  const copyPixCode = () => {
    navigator.clipboard.writeText("00020126580014br.gov.bcb.pix0136123e4567-e89b-12d3-a456-426614174000520400005303986540510.005802BR5913Bronks Barbearia6008Sao Paulo62070503***6304ABCD");
    toast({ title: "Código PIX copiado!", description: "Cole no app do seu banco." });
  };

  if (paymentConfirmed) {
    return (
      <div className="container max-w-md mx-auto py-20 px-4 text-center">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-card border border-green-500/30 p-8 rounded-3xl flex flex-col items-center gap-6 shadow-[0_0_50px_rgba(34,197,94,0.2)]"
        >
          <div className="h-24 w-24 rounded-full bg-green-500/20 flex items-center justify-center">
            <Check className="h-12 w-12 text-green-500" />
          </div>
          <div>
            <h2 className="font-heading text-3xl font-bold text-white mb-2">AGENDADO!</h2>
            <p className="text-muted-foreground">Te esperamos na data marcada.</p>
          </div>
          
          <div className="w-full bg-muted/50 p-4 rounded-xl text-left text-sm space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Serviço:</span>
              <span className="font-bold text-white">{service?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Barbeiro:</span>
              <span className="font-bold text-white">{barber?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Data:</span>
              <span className="font-bold text-white">
                {date && format(date, "dd 'de' MMMM", { locale: ptBR })} às {selectedTime}
              </span>
            </div>
          </div>

          <Link href="/">
            <Button className="w-full bg-green-600 hover:bg-green-700 text-white font-bold">
              VOLTAR AO INÍCIO
            </Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-12 px-4">
      <div className="mb-8">
        <h1 className="font-heading text-3xl md:text-4xl font-bold mb-2 text-neon">AGENDAMENTO</h1>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className={step >= 1 ? "text-primary font-bold" : ""}>1. Serviço</span>
          <ChevronRight className="h-4 w-4" />
          <span className={step >= 2 ? "text-primary font-bold" : ""}>2. Profissional</span>
          <ChevronRight className="h-4 w-4" />
          <span className={step >= 3 ? "text-primary font-bold" : ""}>3. Data</span>
          <ChevronRight className="h-4 w-4" />
          <span className={step >= 4 ? "text-primary font-bold" : ""}>4. Dados</span>
          <ChevronRight className="h-4 w-4" />
          <span className={step >= 5 ? "text-primary font-bold" : ""}>5. Pagamento</span>
        </div>
        <div className="h-1 w-full bg-muted mt-4 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-primary" 
            initial={{ width: 0 }}
            animate={{ width: `${(step / 5) * 100}%` }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div 
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {SERVICES.map((s) => (
              <div 
                key={s.id}
                onClick={() => setSelectedService(s.id)}
                className={`cursor-pointer p-6 rounded-xl border-2 transition-all ${
                  selectedService === s.id 
                    ? "border-primary bg-primary/5 shadow-[0_0_20px_rgba(168,85,247,0.2)]" 
                    : "border-border bg-card hover:border-primary/50"
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-heading text-xl font-bold">{s.name}</h3>
                  <span className="text-primary font-bold font-mono">R$ {s.price}</span>
                </div>
                <p className="text-sm text-muted-foreground mb-4">{s.description}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 w-fit px-2 py-1 rounded">
                  <Clock className="h-3 w-3" />
                  {s.duration} min
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {step === 2 && (
          <motion.div 
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4"
          >
            {BARBERS.map((b) => (
              <div 
                key={b.id}
                onClick={() => setSelectedBarber(b.id)}
                className={`cursor-pointer p-6 rounded-xl border-2 flex flex-col items-center gap-4 transition-all ${
                  selectedBarber === b.id 
                    ? "border-primary bg-primary/5 scale-105" 
                    : "border-border bg-card hover:border-primary/50"
                }`}
              >
                <div className="h-24 w-24 rounded-full overflow-hidden bg-muted border-2 border-border">
                  <img src={b.avatar} alt={b.name} className="w-full h-full object-cover" />
                </div>
                <div className="text-center">
                  <h3 className="font-heading font-bold">{b.name}</h3>
                  <p className="text-xs text-muted-foreground">Barbeiro Senior</p>
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {step === 3 && (
          <motion.div 
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex flex-col md:flex-row gap-8"
          >
            <div className="bg-card p-4 rounded-xl border border-border w-fit mx-auto md:mx-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                locale={ptBR}
                className="rounded-md border-none"
                disabled={(date) => date < new Date()}
              />
            </div>
            
            <div className="flex-1">
              <h3 className="font-heading text-lg font-bold mb-4">Horários Disponíveis</h3>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {TIME_SLOTS.map((time) => (
                  <Button
                    key={time}
                    variant={selectedTime === time ? "default" : "outline"}
                    onClick={() => setSelectedTime(time)}
                    className={`w-full ${selectedTime === time ? "bg-primary text-white hover:bg-primary/90" : "hover:border-primary"}`}
                  >
                    {time}
                  </Button>
                ))}
              </div>
              {date && selectedTime && (
                <div className="mt-6 p-4 bg-primary/10 border border-primary/30 rounded-lg text-center">
                  <p className="text-sm text-muted-foreground">Você selecionou:</p>
                  <p className="font-bold text-lg text-primary">
                    {format(date, "dd 'de' MMMM", { locale: ptBR })} às {selectedTime}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div 
            key="step4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="max-w-md mx-auto space-y-6"
          >
            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo</Label>
              <Input 
                id="name" 
                placeholder="Seu nome" 
                value={customerName} 
                onChange={(e) => setCustomerName(e.target.value)}
                className="bg-card border-border h-12"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone / WhatsApp</Label>
              <Input 
                id="phone" 
                placeholder="(11) 99999-9999" 
                value={customerPhone} 
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="bg-card border-border h-12"
              />
            </div>

            <div className="bg-card p-6 rounded-xl border border-border mt-8">
              <h3 className="font-heading font-bold mb-4 border-b border-border pb-2">Resumo</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{service?.name}</span>
                  <span>R$ {service?.price.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Taxa de Serviço</span>
                  <span>R$ {PLATFORM_FEE.toFixed(2)}</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between text-lg font-bold text-primary">
                  <span>TOTAL</span>
                  <span>R$ {total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {step === 5 && (
          <motion.div 
            key="step5"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="max-w-md mx-auto text-center"
          >
            <div className="bg-white p-8 rounded-2xl w-fit mx-auto mb-6 shadow-[0_0_40px_rgba(255,255,255,0.1)]">
              <QRCodeSVG value="00020126580014br.gov.bcb.pix0136123e4567-e89b-12d3-a456-426614174000520400005303986540510.005802BR5913Bronks Barbearia6008Sao Paulo62070503***6304ABCD" size={200} />
            </div>
            
            <p className="text-muted-foreground mb-2">Escaneie o QR Code para pagar</p>
            <div className="text-3xl font-bold text-white mb-6 font-mono">R$ {total.toFixed(2)}</div>

            <div className="flex items-center gap-2 bg-card border border-border p-3 rounded-lg mb-8">
              <div className="flex-1 font-mono text-xs text-muted-foreground truncate">
                00020126580014br.gov.bcb.pix0136123e4567...
              </div>
              <Button size="icon" variant="ghost" onClick={copyPixCode}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>

            <Button 
              size="lg" 
              className="w-full font-bold bg-primary hover:bg-primary/90 h-14 text-lg rounded-full relative overflow-hidden"
              onClick={handlePayment}
              disabled={isProcessingPayment}
            >
              {isProcessingPayment && (
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-white" />
                </div>
              )}
              {isProcessingPayment ? "CONFIRMANDO..." : "JÁ REALIZEI O PAGAMENTO"}
            </Button>
            
            <p className="text-xs text-muted-foreground mt-4">
              O sistema irá reconhecer seu pagamento automaticamente.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation Buttons */}
      {!paymentConfirmed && step < 5 && (
        <div className="mt-12 flex justify-between">
          <Button 
            variant="outline" 
            onClick={handleBack} 
            disabled={step === 1}
            className="w-32"
          >
            <ChevronLeft className="mr-2 h-4 w-4" /> Voltar
          </Button>
          <Button 
            onClick={handleNext}
            className="w-32 bg-primary hover:bg-primary/90 text-white font-bold"
          >
            {step === 4 ? "Pagar" : "Próximo"} <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
