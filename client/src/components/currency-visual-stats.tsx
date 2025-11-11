import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, PieChart } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function CurrencyVisualStats() {
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

  if (isLoading) {
    return (
      <Card className="bg-surface border border-gray-200">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3" />
            <div className="space-y-3">
              <div className="h-20 bg-gray-200 rounded" />
              <div className="h-20 bg-gray-200 rounded" />
              <div className="h-20 bg-gray-200 rounded" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currencyTotals = stats?.currencyTotals || {};
  const currencies = Object.entries(currencyTotals).filter(([_, value]) => value && value > 0);

  if (currencies.length === 0) {
    return null;
  }

  const totalValue = currencies.reduce((sum, [_, value]) => sum + (value || 0), 0);

  const currencyConfig = {
    BRL: {
      name: "Real Brasileño",
      symbol: "R$",
      color: "from-emerald-500 to-emerald-600",
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-200",
      textColor: "text-emerald-700",
      progressColor: "bg-emerald-500",
    },
    USD: {
      name: "Dólar Estadounidense",
      symbol: "$",
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      textColor: "text-blue-700",
      progressColor: "bg-blue-500",
    },
    EUR: {
      name: "Euro",
      symbol: "€",
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
      textColor: "text-purple-700",
      progressColor: "bg-purple-500",
    },
  };

  return (
    <Card className="bg-surface border border-gray-200">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <PieChart className="h-5 w-5 text-primary" />
          <span>Distribución por Moneda</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Total General */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">
                Total General (Todas las Monedas)
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.total || 0} Pedidos
              </p>
            </div>
            <div className="h-12 w-12 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center">
              <TrendingUp className="text-white h-6 w-6" />
            </div>
          </div>
        </div>

        {/* Currency Breakdown */}
        <div className="space-y-4">
          {currencies.map(([currency, value]) => {
            const config = currencyConfig[currency as keyof typeof currencyConfig];
            if (!config) return null;

            const percentage = totalValue > 0 ? ((value || 0) / totalValue) * 100 : 0;
            const orderCount = Math.round((stats?.total || 0) * (percentage / 100));

            return (
              <div
                key={currency}
                className={`${config.bgColor} ${config.borderColor} border-2 rounded-lg p-4 transition-all hover:shadow-md`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <div className={`h-8 w-8 bg-gradient-to-br ${config.color} rounded-full flex items-center justify-center`}>
                        <span className="text-white font-bold text-sm">{config.symbol}</span>
                      </div>
                      <div>
                        <p className={`text-sm font-medium ${config.textColor}`}>
                          {config.name} ({currency})
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-xl font-bold ${config.textColor}`}>
                      {formatCurrency(value || 0, currency)}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-gray-600">
                    <span>Proporción del total</span>
                    <span className="font-semibold">{percentage.toFixed(1)}%</span>
                  </div>
                  <Progress
                    value={percentage}
                    className={`h-2 ${config.bgColor}`}
                  />
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>~{orderCount} pedidos estimados</span>
                    <span className="font-medium">{percentage > 50 ? "Moneda Principal" : percentage > 25 ? "Importante" : "Secundaria"}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <DollarSign className="h-5 w-5 text-gray-500 mx-auto mb-2" />
            <p className="text-xs text-gray-600 mb-1">Monedas Activas</p>
            <p className="text-2xl font-bold text-gray-900">{currencies.length}</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <TrendingUp className="h-5 w-5 text-gray-500 mx-auto mb-2" />
            <p className="text-xs text-gray-600 mb-1">Valor Total Combinado</p>
            <p className="text-lg font-bold text-gray-900">
              {currencies.length > 1 ? "Multi" : formatCurrency(totalValue, currencies[0][0])}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
