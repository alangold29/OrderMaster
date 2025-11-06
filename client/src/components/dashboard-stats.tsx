import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { ShoppingCart, Clock, Truck, CheckCircle } from "lucide-react";

interface OrderStats {
  total: number;
  pendiente: number;
  transito: number;
  entregado: number;
}

export default function DashboardStats() {
  const { data: stats, isLoading } = useQuery<OrderStats>({
    queryKey: ["/api/stats"],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="bg-surface border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gray-200 rounded animate-pulse" />
                <div className="ml-4">
                  <div className="w-20 h-4 bg-gray-200 rounded animate-pulse mb-2" />
                  <div className="w-12 h-6 bg-gray-200 rounded animate-pulse" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statItems = [
    {
      title: "Total de Pedidos",
      value: stats?.total || 0,
      icon: ShoppingCart,
      color: "text-primary",
      subtitle: "Todos los pedidos"
    },
    {
      title: "Pendientes",
      value: stats?.pendiente || 0,
      icon: Clock,
      color: "text-pending",
      subtitle: "Por procesar"
    },
    {
      title: "En Tránsito",
      value: stats?.transito || 0,
      icon: Truck,
      color: "text-in-transit",
      subtitle: "En camino"
    },
    {
      title: "Entregados",
      value: stats?.entregado || 0,
      icon: CheckCircle,
      color: "text-delivered",
      subtitle: "Completados"
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statItems.map((item) => (
        <Card key={item.title} className="bg-surface border border-gray-200 hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <item.icon className={`${item.color} h-6 w-6`} />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-text-secondary">
                  {item.title}
                </p>
                <p className="text-2xl font-semibold text-text-primary">
                  {item.value.toLocaleString()}
                </p>
                <p className="text-xs text-text-secondary mt-1">
                  {item.subtitle}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
