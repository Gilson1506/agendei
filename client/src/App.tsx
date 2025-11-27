import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DataProvider } from "@/context/DataContext";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import BookingPage from "@/pages/booking";
import AdminLogin from "@/pages/admin/login";
import AdminDashboard from "@/pages/admin/dashboard";
import { Layout } from "@/components/layout";

function Router() {
  const [location] = useLocation();
  
  // If it's the login page, don't show the layout
  if (location === "/admin/login") {
    return (
       <Switch>
         <Route path="/admin/login" component={AdminLogin} />
         <Route component={NotFound} />
       </Switch>
    );
  }

  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/booking" component={BookingPage} />
        <Route path="/admin/dashboard" component={AdminDashboard} />
        <Route path="/admin/schedule" component={AdminDashboard} />
        <Route path="/admin/services" component={AdminDashboard} />
        <Route path="/admin/login" component={AdminLogin} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <DataProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </DataProvider>
    </QueryClientProvider>
  );
}

export default App;
