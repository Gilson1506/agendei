import { Link, useLocation } from "wouter";
import { Scissors, Calendar, LayoutDashboard, Menu, X, LogIn } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isAdmin = location.startsWith("/admin");

  const navItems = isAdmin
    ? [
      { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/admin/schedule", label: "Agenda", icon: Calendar },
      { href: "/admin/services", label: "Serviços", icon: Scissors },
    ]
    : [
      { href: "/", label: "Início", icon: Scissors },
      { href: "/booking", label: "Agendar", icon: Calendar },
    ];

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary selection:text-primary-foreground">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 font-heading font-bold text-xl tracking-wider hover:text-primary transition-colors">
            <Scissors className="h-6 w-6 text-primary animate-pulse" />
            <span className="text-neon">BRONKS</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary ${location === item.href ? "text-primary" : "text-muted-foreground"
                  }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}

            {isAdmin && (
              <Link href="/" className="text-xs text-muted-foreground hover:text-white transition-colors">
                Sair
              </Link>
            )}
          </div>

          {/* Mobile Nav */}
          <div className="md:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-primary">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="border-l-primary/20 bg-background/95 backdrop-blur-xl">
                <div className="flex flex-col gap-8 mt-8">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-4 text-lg font-medium transition-colors hover:text-primary ${location === item.href ? "text-primary" : "text-muted-foreground"
                        }`}
                    >
                      <item.icon className="h-5 w-5" />
                      {item.label}
                    </Link>
                  ))}

                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-black py-8 mt-20">
        <div className="container mx-auto px-4 text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h3 className="font-heading text-lg font-bold text-primary">BRONKS BARBEARIA</h3>
            <p className="text-sm text-muted-foreground mt-2">
              Estilo, tradição e modernidade no mesmo lugar.
            </p>
          </div>
          <div className="text-sm text-muted-foreground">
            &copy; 2025 Bronks Barbearia. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}
