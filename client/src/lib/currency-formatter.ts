export type Currency = 'BRL' | 'USD' | 'EUR';

export function formatCurrency(value: string | number, currency: Currency = 'BRL'): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;

  if (isNaN(num)) return '-';

  switch (currency) {
    case 'USD':
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(num);

    case 'EUR':
      return new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR',
      }).format(num);

    case 'BRL':
    default:
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(num);
  }
}

export function getCurrencySymbol(currency: Currency): string {
  switch (currency) {
    case 'USD':
      return '$';
    case 'EUR':
      return '€';
    case 'BRL':
    default:
      return 'R$';
  }
}
