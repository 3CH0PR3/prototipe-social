export const formatNumber = (value, max = 2) => {
  return Number(value || 0).toLocaleString('es-COL', {
    maximumFractionDigits: max,
  });
};
