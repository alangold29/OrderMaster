import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign } from "lucide-react";
import { formatCurrency, type Currency } from "@/lib/currency-formatter";

interface CurrencyStats {
  totalReceivable: number;
  totalPaid: number;
  pendingPayment: number;
  overdueAmount: number;
}

interface MultiCurrencyStatsProps {
  stats: Record<string, CurrencyStats>;
  isLoading?: boolean;
}

export default function MultiCurrencyStats({ stats, isLoading }: MultiCurrencyStatsProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        {['BRL', 'USD', 'EUR'].map((currency) => (
          <Card key={currency} className="animate-pulse">
            <CardHeader className="pb-3">
              <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-32"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-24 mb-3"></div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const currencies: Currency[] = ['BRL', 'USD', 'EUR'];
  const currencyLabels: Record<Currency, string> = {
    BRL: 'Real Brasileño',
    USD: 'Dólar',
    EUR: 'Euro',
  };

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {currencies.map((currency) => {
        const currencyStats = stats[currency] || {
          totalReceivable: 0,
          totalPaid: 0,
          pendingPayment: 0,
          overdueAmount: 0,
        };

        const hasData = currencyStats.totalReceivable > 0 ||
                        currencyStats.totalPaid > 0 ||
                        currencyStats.pendingPayment > 0;

        return (
          <Card key={currency} className={`${hasData ? 'border-primary/20' : 'opacity-60'}`}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                {currency}
              </CardTitle>
              <CardDescription className="text-xs">
                {currencyLabels[currency]}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-2xl font-bold text-primary">
                  {formatCurrency(currencyStats.totalReceivable, currency)}
                </p>
                <p className="text-xs text-muted-foreground">Total por cobrar</p>
              </div>

              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pagado:</span>
                  <span className="font-medium text-green-600">
                    {formatCurrency(currencyStats.totalPaid, currency)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pendiente:</span>
                  <span className="font-medium text-amber-600">
                    {formatCurrency(currencyStats.pendingPayment, currency)}
                  </span>
                </div>
              </div>

              {!hasData && (
                <p className="text-xs text-muted-foreground italic text-center pt-2">
                  Sin pedidos en esta moneda
                </p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
