import { Switch, Route, Link, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { BarChart3, Package, Ship, CreditCard, Database, Users, Building2 } from "lucide-react";
import Dashboard from "@/pages/analytics";
import Pedidos from "@/pages/dashboard";
import Embarques from "@/pages/embarques";
import CompleteData from "@/pages/complete-data";
import Contas from "@/pages/contas";
import Usuarios from "@/pages/usuarios";
import NotFound from "@/pages/not-found";
import { useCurrentUser } from "@/hooks/use-current-user";

function Router() {
  const [location] = useLocation();
  const { canAccessFinancials } = useCurrentUser();

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar Navigation */}
      <aside className="w-64 border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex flex-col">
        {/* Logo and Title */}
        <div className="border-b p-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-lg font-bold text-primary">CRM Importação</h1>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-4">
          <div className="flex flex-col space-y-2">
            <Link href="/">
              <Button 
                variant={location === "/" ? "default" : "ghost"}
                size="default"
                className="w-full justify-start gap-3 px-4"
                data-testid="link-dashboard"
              >
                <BarChart3 className="h-4 w-4" />
                Dashboard
              </Button>
            </Link>
            <Link href="/pedidos">
              <Button 
                variant={location === "/pedidos" ? "default" : "ghost"}
                size="default"
                className="w-full justify-start gap-3 px-4"
                data-testid="link-pedidos"
              >
                <Package className="h-4 w-4" />
                Pedidos
              </Button>
            </Link>
            <Link href="/embarques">
              <Button 
                variant={location === "/embarques" ? "default" : "ghost"}
                size="default"
                className="w-full justify-start gap-3 px-4"
                data-testid="link-embarques"
              >
                <Ship className="h-4 w-4" />
                Embarques
              </Button>
            </Link>
            <Link href="/dados">
              <Button 
                variant={location === "/dados" ? "default" : "ghost"}
                size="default"
                className="w-full justify-start gap-3 px-4"
                data-testid="link-dados"
              >
                <Database className="h-4 w-4" />
                Base de Dados
              </Button>
            </Link>
            {canAccessFinancials && (
              <Link href="/contas">
                <Button 
                  variant={location === "/contas" ? "default" : "ghost"}
                  size="default"
                  className="w-full justify-start gap-3 px-4"
                  data-testid="link-contas"
                >
                  <CreditCard className="h-4 w-4" />
                  Contas Correntes
                </Button>
              </Link>
            )}
            <Link href="/usuarios">
              <Button 
                variant={location === "/usuarios" ? "default" : "ghost"}
                size="default"
                className="w-full justify-start gap-3 px-4"
                data-testid="link-usuarios"
              >
                <Users className="h-4 w-4" />
                Usuários
              </Button>
            </Link>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-8 py-8">
          <Switch>
            <Route path="/" component={Dashboard} />
            <Route path="/pedidos" component={Pedidos} />
            <Route path="/embarques" component={Embarques} />
            <Route path="/dados" component={CompleteData} />
            <Route path="/contas" component={Contas} />
            <Route path="/usuarios" component={Usuarios} />
            <Route component={NotFound} />
          </Switch>
        </div>
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
