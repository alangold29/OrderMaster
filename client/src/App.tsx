import { Switch, Route, Link, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { BarChart3, Package, Ship, CreditCard } from "lucide-react";
import Dashboard from "@/pages/analytics";
import Pedidos from "@/pages/dashboard";
import NotFound from "@/pages/not-found";

function Router() {
  const [location] = useLocation();

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto flex h-16 items-center px-4">
          <div className="mr-8 flex">
            <h1 className="text-xl font-bold text-primary">CRM Importação</h1>
          </div>
          <div className="flex space-x-1">
            <Link href="/">
              <Button 
                variant={location === "/" ? "default" : "ghost"}
                size="default"
                className="gap-2 px-4"
              >
                <BarChart3 className="h-4 w-4" />
                Dashboard
              </Button>
            </Link>
            <Link href="/pedidos">
              <Button 
                variant={location === "/pedidos" ? "default" : "ghost"}
                size="default"
                className="gap-2 px-4"
              >
                <Package className="h-4 w-4" />
                Pedidos
              </Button>
            </Link>
            <Link href="/embarques">
              <Button 
                variant={location === "/embarques" ? "default" : "ghost"}
                size="default"
                className="gap-2 px-4"
              >
                <Ship className="h-4 w-4" />
                Embarques
              </Button>
            </Link>
            <Link href="/contas">
              <Button 
                variant={location === "/contas" ? "default" : "ghost"}
                size="default"
                className="gap-2 px-4"
              >
                <CreditCard className="h-4 w-4" />
                Contas Correntes
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/pedidos" component={Pedidos} />
          <Route path="/embarques" component={() => <div className="text-center py-20"><h2 className="text-2xl font-semibold text-muted-foreground">Em desenvolvimento</h2><p className="text-muted-foreground mt-2">Página de embarques será implementada em breve</p></div>} />
          <Route path="/contas" component={() => <div className="text-center py-20"><h2 className="text-2xl font-semibold text-muted-foreground">Em desenvolvimento</h2><p className="text-muted-foreground mt-2">Página de contas correntes será implementada em breve</p></div>} />
          <Route component={NotFound} />
        </Switch>
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
