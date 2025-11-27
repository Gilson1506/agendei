import { motion } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Calendar, Scissors, Clock, Star } from "lucide-react";
import interiorImage from "@assets/generated_images/dark_neon_barbershop_interior.png";
import { SERVICES } from "@/lib/mockData";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src={interiorImage} 
            alt="Bronks Barbearia Interior" 
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
          <div className="absolute inset-0 bg-black/40" />
        </div>

        {/* Content */}
        <div className="container relative z-10 px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-block mb-4 px-3 py-1 border border-primary/50 rounded-full bg-primary/10 backdrop-blur-md text-primary text-sm font-medium tracking-wider uppercase">
              Estilo & Respeito
            </div>
            <h1 className="font-heading text-5xl md:text-7xl lg:text-9xl font-bold tracking-tighter text-white mb-6 drop-shadow-2xl">
              BRONKS <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400 text-neon">BARBEARIA</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-10 font-light">
              O corte que você respeita, no ambiente que você merece. 
              Especialistas em degradê, barba e pigmentação.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/booking">
                <Button size="lg" className="h-14 px-8 text-lg font-bold bg-primary hover:bg-primary/90 text-white shadow-[0_0_20px_rgba(168,85,247,0.5)] transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(168,85,247,0.7)] rounded-full">
                  <Calendar className="mr-2 h-5 w-5" />
                  AGENDAR AGORA
                </Button>
              </Link>
              <Link href="#services">
                <Button size="lg" variant="outline" className="h-14 px-8 text-lg font-bold border-primary/50 text-primary hover:bg-primary/10 hover:border-primary hover:text-white transition-all rounded-full">
                  VER PREÇOS
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Strip */}
      <div className="bg-primary/5 border-y border-primary/10 py-8 backdrop-blur-sm">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="flex flex-col items-center gap-2">
            <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center mb-2">
              <Scissors className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-heading font-bold text-lg">Profissionais de Elite</h3>
            <p className="text-sm text-muted-foreground">Barbeiros treinados nas melhores técnicas.</p>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center mb-2">
              <Clock className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-heading font-bold text-lg">Sem Espera</h3>
            <p className="text-sm text-muted-foreground">Agende seu horário e seja atendido na hora.</p>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center mb-2">
              <Star className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-heading font-bold text-lg">Ambiente Premium</h3>
            <p className="text-sm text-muted-foreground">Cerveja gelada, ar condicionado e boa música.</p>
          </div>
        </div>
      </div>

      {/* Services Section */}
      <section id="services" className="py-20 container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-heading font-bold mb-4">NOSSOS <span className="text-primary">SERVIÇOS</span></h2>
          <p className="text-muted-foreground max-w-xl mx-auto">Escolha o que você precisa para ficar na régua.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SERVICES.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group relative bg-card border border-border hover:border-primary/50 p-6 rounded-2xl transition-all hover:shadow-[0_0_30px_rgba(168,85,247,0.15)]"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Scissors className="h-12 w-12 text-primary" />
              </div>
              
              <h3 className="font-heading text-2xl font-bold mb-2 group-hover:text-primary transition-colors">{service.name}</h3>
              <p className="text-muted-foreground mb-6 h-12">{service.description}</p>
              
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Duração</p>
                  <p className="font-mono font-bold">{service.duration} min</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Preço</p>
                  <p className="font-mono text-2xl font-bold text-primary">R$ {service.price.toFixed(2)}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-16 text-center">
           <Link href="/booking">
            <Button size="lg" className="h-12 px-10 font-bold bg-white text-black hover:bg-gray-200 hover:text-primary transition-colors rounded-full">
              AGENDAR HORÁRIO
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
