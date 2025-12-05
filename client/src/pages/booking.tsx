import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Check, ChevronRight, ChevronLeft, Clock, Calendar as CalendarIcon, CreditCard, Copy, Loader2, Upload } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { format, addDays, isSameDay, setHours, setMinutes, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Link } from "wouter";
import { useServices, useBarbers, useAppointments, useCreateAppointment, useStats, uploadPaymentReceipt } from "@/hooks/use-api";

const TIME_SLOTS = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00"
];

export default function BookingPage() {
  // Fetch data from API
  const { data: services = [], isLoading: servicesLoading } = useServices();
  const { data: barbers = [], isLoading: barbersLoading } = useBarbers();
  const { data: appointments = [], isLoading: appointmentsLoading } = useAppointments();
  const { data: stats } = useStats();
  const createAppointment = useCreateAppointment();

  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [selectedBarber, setSelectedBarber] = useState<string | null>(null);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [isUploadingReceipt, setIsUploadingReceipt] = useState(false);
  const { toast } = useToast();

  const service = services.find(s => s.id === selectedService);
  const barber = barbers.find(b => b.id === selectedBarber);

  // Calculate total with the dynamic platform fee
  const platformFee = stats?.platformFee || 8.90;
  const total = service ? service.price + platformFee : 0;

  // Filter barbers based on selected service
  const availableBarbers = selectedService
    ? barbers.filter(b => b.serviceIds.includes(selectedService))
    : [];

  // Reset barber selection if service changes and current barber doesn't support it
  useEffect(() => {
    if (selectedBarber && selectedService) {
      const b = barbers.find(b => b.id === selectedBarber);
      if (b && !b.serviceIds.includes(selectedService)) {
        setSelectedBarber(null);
      }
    }
  }, [selectedService, barbers, selectedBarber]);

  // Show loading state
  if (servicesLoading || barbersLoading || appointmentsLoading) {
    return (
      <div className="container mx-auto py-8 px-4 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando dados...</p>
        </div>
      </div>
    );
  }

  // Helper to check if a time slot is occupied
  const isTimeSlotOccupied = (time: string) => {
    if (!date || !selectedBarber) return false;

    return appointments.some(apt => {
      // Only check appointments for the selected barber
      if (apt.barber_id !== selectedBarber) return false;
      if (apt.status === 'cancelled') return false;
      if (!apt.date) return false;

      // Parse date string directly (no timezone conversion)
      const aptDate = new Date(apt.date);

      // Check if it's the same day
      if (!isSameDay(aptDate, date)) return false;

      // Check if it's the same time
      const aptTime = format(aptDate, "HH:mm");
      return aptTime === time;
    });
  };

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

    if (!service || !barber || !date || !selectedTime) {
      toast({
        title: "Erro",
        description: "Dados incompletos.",
        variant: "destructive"
      });
      setIsProcessingPayment(false);
      return;
    }

    // Create simple date string without timezone conversion
    const [hours, minutes] = selectedTime.split(':').map(Number);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hoursStr = String(hours).padStart(2, '0');
    const minutesStr = String(minutes).padStart(2, '0');

    // Format: YYYY-MM-DDTHH:mm:ss (no Z suffix = treated as local time)
    const aptDateString = `${year}-${month}-${day}T${hoursStr}:${minutesStr}:00`;

    const appointmentData: any = {
      service_id: service.id,
      barber_id: barber.id,
      date: aptDateString,
      customer_name: customerName,
      customer_phone: customerPhone,
      status: receiptFile ? "pending" : "confirmed", // If receipt uploaded, wait for confirmation
      total_price: total
    };

    // Create appointment
    createAppointment.mutate(appointmentData, {
      onSuccess: async (appointment) => {
        // Upload receipt if provided
        if (receiptFile && appointment?.id) {
          setIsUploadingReceipt(true);
          try {
            const receiptUrl = await uploadPaymentReceipt(appointment.id, receiptFile);
            // The upload endpoint already updates the appointment with the URL
            // No need to call PATCH again, which requires auth and fails for public users
          } catch (error) {
            console.error('Error uploading receipt:', error);
            toast({
              title: "Aviso",
              description: "Agendamento criado, mas falha ao enviar comprovante. Entre em contato.",
              variant: "destructive"
            });
          } finally {
            setIsUploadingReceipt(false);
          }
        }

        setPaymentConfirmed(true);
        setIsProcessingPayment(false);
        toast({
          title: receiptFile ? "Agendamento Criado!" : "Pagamento Confirmado!",
          description: receiptFile
            ? "Seu agendamento foi criado. Aguarde a confirmação do pagamento."
            : "Seu agendamento foi realizado com sucesso.",
          className: "bg-green-600 text-white border-none"
        });
      },
      onError: () => {
        setIsProcessingPayment(false);
        toast({
          title: "Erro ao criar agendamento",
          description: "Tente novamente.",
          variant: "destructive"
        });
      }
    });
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
            className="w-full max-w-5xl mx-auto"
          >
            <Carousel
              opts={{
                align: "start",
                loop: true,
              }}
              className="w-full"
            >
              <CarouselContent className="-ml-4">
                {services.map((s) => (
                  <CarouselItem key={s.id} className="pl-4 md:basis-1/2 lg:basis-1/3">
                    <div
                      onClick={() => setSelectedService(s.id)}
                      className={`cursor-pointer p-6 rounded-xl border-2 transition-all h-full flex flex-col ${selectedService === s.id
                        ? "border-primary bg-primary/5 shadow-[0_0_20px_rgba(168,85,247,0.2)]"
                        : "border-border bg-card hover:border-primary/50"
                        }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-heading text-xl font-bold break-words pr-2" title={s.name}>{s.name}</h3>
                        <span className="text-primary font-bold font-mono whitespace-nowrap">R$ {s.price.toFixed(2)}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4 flex-grow line-clamp-3" title={s.description}>{s.description}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 w-fit px-2 py-1 rounded mt-auto">
                        <Clock className="h-3 w-3" />
                        {s.duration} min
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <div className="flex justify-center gap-4 mt-4 md:absolute md:inset-0 md:mt-0 md:pointer-events-none md:flex md:items-center md:justify-between md:px-4">
                <CarouselPrevious className="static translate-y-0 md:absolute md:-left-12 md:pointer-events-auto" />
                <CarouselNext className="static translate-y-0 md:absolute md:-right-12 md:pointer-events-auto" />
              </div>
            </Carousel>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            {availableBarbers.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-muted-foreground">Nenhum profissional disponível para este serviço no momento.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {availableBarbers.map((b) => (
                  <div
                    key={b.id}
                    onClick={() => setSelectedBarber(b.id)}
                    className={`cursor-pointer p-6 rounded-xl border-2 flex flex-col items-center gap-4 transition-all ${selectedBarber === b.id
                      ? "border-primary bg-primary/5 scale-105"
                      : "border-border bg-card hover:border-primary/50"
                      }`}
                  >
                    <div className="h-24 w-24 rounded-full overflow-hidden bg-muted border-2 border-border">
                      <img
                        src={(b as any).profile_photo_url || b.avatar}
                        alt={b.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="text-center">
                      <h3 className="font-heading font-bold">{b.name}</h3>
                      <p className="text-xs text-muted-foreground">Barbeiro Profissional</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
                disabled={(date) => {
                  // Disable past dates and Sundays
                  if (date < new Date()) return true;
                  return date.getDay() === 0; // 0 = Sunday
                }}
              />
            </div>

            <div className="flex-1">
              <h3 className="font-heading text-lg font-bold mb-4">Horários Disponíveis</h3>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {TIME_SLOTS.map((time) => {
                  const isOccupied = isTimeSlotOccupied(time);
                  return (
                    <Button
                      key={time}
                      variant={selectedTime === time ? "default" : "outline"}
                      onClick={() => !isOccupied && setSelectedTime(time)}
                      disabled={isOccupied}
                      className={`w-full relative ${selectedTime === time
                        ? "bg-primary text-white hover:bg-primary/90"
                        : isOccupied
                          ? "opacity-100 cursor-not-allowed bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30"
                          : "hover:border-primary"
                        }`}
                    >
                      <div className="flex flex-col items-center">
                        <span className="font-bold">{time}</span>
                        {isOccupied && (
                          <span className="text-[10px] font-normal mt-0.5">Ocupado</span>
                        )}
                      </div>
                    </Button>
                  );
                })}
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
                  <span>R$ {platformFee.toFixed(2)}</span>
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
            {/* QR Code - usar do serviço se disponível */}
            <div className="bg-white p-8 rounded-2xl w-fit mx-auto mb-6 shadow-[0_0_40px_rgba(255,255,255,0.1)]">
              {service?.qr_code_url ? (
                <img
                  src={service.qr_code_url}
                  alt="QR Code PIX"
                  className="w-[200px] h-[200px] object-contain"
                />
              ) : (
                <QRCodeSVG
                  value={service?.pix_link || "00020126580014br.gov.bcb.pix0136123e4567-e89b-12d3-a456-426614174000520400005303986540510.005802BR5913Bronks Barbearia6008Sao Paulo62070503***6304ABCD"}
                  size={200}
                />
              )}
            </div>

            <p className="text-muted-foreground mb-2">Escaneie o QR Code para pagar</p>
            <div className="text-3xl font-bold text-white mb-6 font-mono">R$ {total.toFixed(2)}</div>

            {/* Botão Copiar Chave PIX - Destacado */}
            {(service?.pix_link || service?.qr_code_url) && (
              <div className="mb-8 space-y-3">
                <div className="bg-muted/30 border border-border p-3 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-2">Chave PIX (Email)</p>
                  <div className="font-mono text-sm text-white break-all">
                    {service?.pix_link || "00020126580014br.gov.bcb.pix0136123e4567-e89b-12d3-a456-426614174000520400005303986540510.005802BR5913Bronks Barbearia6008Sao Paulo62070503***6304ABCD"}
                  </div>
                </div>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => {
                    const pixCode = service?.pix_link || "00020126580014br.gov.bcb.pix0136123e4567-e89b-12d3-a456-426614174000520400005303986540510.005802BR5913Bronks Barbearia6008Sao Paulo62070503***6304ABCD";
                    navigator.clipboard.writeText(pixCode);
                    toast({ title: "✓ Chave PIX copiada!", description: "Cole no seu app bancário para pagar.", className: "bg-green-600 text-white border-none" });
                  }}
                  className="w-full font-bold border-primary text-primary hover:bg-primary hover:text-white transition-all"
                >
                  <Copy className="mr-2 h-5 w-5" />
                  Copiar Chave PIX
                </Button>
              </div>
            )}

            {/* Upload de Comprovante - Visual Melhorado */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <Upload className="h-5 w-5 text-primary" />
                Comprovante
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Após realizar o pagamento, tire um print do comprovante e envie aqui.
              </p>

              <label
                htmlFor="receipt-upload"
                className={`
                  relative block w-full p-8 rounded-xl border-2 border-dashed cursor-pointer
                  transition-all duration-200
                  ${receiptFile
                    ? 'border-green-500 bg-green-500/10'
                    : 'border-primary/50 bg-primary/5 hover:border-primary hover:bg-primary/10'
                  }
                `}
              >
                <input
                  id="receipt-upload"
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
                  className="hidden"
                />

                <div className="flex flex-col items-center justify-center gap-3">
                  {receiptFile ? (
                    <>
                      <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                        <Check className="h-6 w-6 text-green-500" />
                      </div>
                      <div className="text-center">
                        <p className="font-medium text-green-500">Arquivo selecionado!</p>
                        <p className="text-xs text-muted-foreground mt-1">{receiptFile.name}</p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.preventDefault();
                          setReceiptFile(null);
                        }}
                        className="mt-2"
                      >
                        Remover arquivo
                      </Button>
                    </>
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                        <Upload className="h-6 w-6 text-primary" />
                      </div>
                      <div className="text-center">
                        <p className="font-medium text-white">Toque para anexar comprovante</p>
                        <p className="text-xs text-muted-foreground mt-1">PNG, JPG ou PDF (máx. 10MB)</p>
                      </div>
                    </>
                  )}
                </div>
              </label>
            </div>

            <Button
              size="lg"
              className="w-full font-bold bg-primary hover:bg-primary/90 h-14 text-lg rounded-full relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handlePayment}
              disabled={isProcessingPayment || isUploadingReceipt || !receiptFile}
            >
              {(isProcessingPayment || isUploadingReceipt) && (
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-white" />
                </div>
              )}
              {isUploadingReceipt
                ? "ENVIANDO COMPROVANTE..."
                : isProcessingPayment
                  ? "CONFIRMANDO..."
                  : receiptFile
                    ? "ENVIAR COMPROVANTE E CONFIRMAR"
                    : "JÁ REALIZEI O PAGAMENTO"}
            </Button>

            <p className="text-xs text-muted-foreground mt-4">
              {receiptFile
                ? "Seu agendamento será confirmado após análise do comprovante."
                : "⚠️ Selecione o comprovante de pagamento para continuar."}
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
