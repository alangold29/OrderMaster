import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { ShoppingCart, Clock, Truck, CheckCircle } from "lucide-react";

export default function DashboardStats() {
  const { data: stats, isLoading } = useQuery<{
    total: number;
    pendiente: number;
    transito: number;
    entregado: number;
    currencyTotals?: {
      BRL?: number;
      USD?: number;
      EUR?: number;
    };
  }>({
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
    },
    {
      title: "Pendientes",
      value: stats?.pendiente || 0,
      icon: Clock,
      color: "text-pending",
    },
    {
      title: "En Tránsito",
      value: stats?.transito || 0,
      icon: Truck,
      color: "text-in-transit",
    },
    {
      title: "Entregados",
      value: stats?.entregado || 0,
      icon: CheckCircle,
      color: "text-delivered",
    },
  ];

  const formatCurrency = (value: number, currency: string) => {
    const currencyMap: Record<string, string> = {
      BRL: "pt-BR",
      USD: "en-US",
      EUR: "de-DE",
    };
    const locale = currencyMap[currency] || "pt-BR";
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value || 0);
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {statItems.map((item) => (
          <Card key={item.title} className="bg-surface border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <item.icon className={`${item.color} h-6 w-6`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-text-secondary">
                    {item.title}
                  </p>
                  <p className="text-2xl font-semibold text-text-primary">
                    {item.value.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {stats?.currencyTotals && Object.keys(stats.currencyTotals).length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.currencyTotals.BRL !== undefined && stats.currencyTotals.BRL > 0 && (
            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-700 mb-1">
                      Total en Real (BRL)
                    </p>
                    <p className="text-2xl font-bold text-green-900">
                      {formatCurrency(stats.currencyTotals.BRL, "BRL")}
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">R$</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {stats.currencyTotals.USD !== undefined && stats.currencyTotals.USD > 0 && (
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-700 mb-1">
                      Total en Dólar (USD)
                    </p>
                    <p className="text-2xl font-bold text-blue-900">
                      {formatCurrency(stats.currencyTotals.USD, "USD")}
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">$</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {stats.currencyTotals.EUR !== undefined && stats.currencyTotals.EUR > 0 && (
            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-700 mb-1">
                      Total en Euro (EUR)
                    </p>
                    <p className="text-2xl font-bold text-purple-900">
                      {formatCurrency(stats.currencyTotals.EUR, "EUR")}
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">€</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </>
  );
}
