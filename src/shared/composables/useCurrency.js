export function useCurrency(locale = 'es-CO', currency = 'COP') {
  const formatCurrency = (value) => {
    const amount = Number(value) || 0;
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return { formatCurrency };
}
