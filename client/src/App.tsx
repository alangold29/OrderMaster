import { Switch, Route, Link, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, BarChart3 } from "lucide-react";
import Dashboard from "@/pages/dashboard";
import Analytics from "@/pages/analytics";
import NotFound from "@/pages/not-found";

function Router() {
  const [location] = useLocation();

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 flex">
            <h1 className="text-lg font-semibold">CRM Importação</h1>
          </div>
          <div className="flex flex-1 items-center space-x-2">
            <Link href="/">
              <Button 
                variant={location === "/" ? "default" : "ghost"}
                size="sm"
                className="gap-2"
              >
                <LayoutDashboard className="h-4 w-4" />
                Pedidos
              </Button>
            </Link>
            <Link href="/analytics">
              <Button 
                variant={location === "/analytics" ? "default" : "ghost"}
                size="sm"
                className="gap-2"
              >
                <BarChart3 className="h-4 w-4" />
                Analytics
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto py-6">
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/analytics" component={Analytics} />
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
