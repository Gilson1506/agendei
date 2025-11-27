import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Scissors, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminLogin() {
  const [email, setEmail] = useState("admin@bronks.com");
  const [password, setPassword] = useState("admin123");
  const [isLoading, setIsLoading] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Fake auth delay
    setTimeout(() => {
      setIsLoading(false);
      if (password === "admin123") {
        toast({ title: "Bem-vindo, Chefe!", description: "Login realizado com sucesso." });
        setLocation("/admin/dashboard");
      } else {
        toast({ title: "Erro", description: "Senha incorreta.", variant: "destructive" });
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=2074&auto=format&fit=crop')] bg-cover bg-center opacity-20" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />

      <Card className="w-full max-w-md relative z-10 border-primary/20 bg-card/90 backdrop-blur-xl shadow-[0_0_50px_rgba(168,85,247,0.15)]">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 border border-primary/30">
            <Scissors className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="font-heading text-3xl font-bold text-white">BRONKS ADMIN</CardTitle>
          <p className="text-sm text-muted-foreground">Acesso restrito à gerência</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                className="bg-black/50 border-primary/20 focus:border-primary h-12"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Senha</label>
              <div className="relative">
                <Input 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-black/50 border-primary/20 focus:border-primary h-12 pl-10"
                />
                <Lock className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
              </div>
            </div>
            
            <Button type="submit" className="w-full h-12 font-bold bg-primary hover:bg-primary/90 text-white mt-4" disabled={isLoading}>
              {isLoading ? "ENTRANDO..." : "ACESSAR PAINEL"}
            </Button>
          </form>
          
          <div className="mt-6 text-center text-xs text-muted-foreground">
            <p>Dica: Senha é "admin123"</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
