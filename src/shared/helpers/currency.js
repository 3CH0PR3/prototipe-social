/**
 * Formatea un número como precio en pesos colombianos (COP)
 * @param {number} amount - El monto a formatear
 * @param {boolean} includeDecimals - Si debe incluir decimales (default: false)
 * @returns {string} - El precio formateado (ej: "$294.000" o "$294.000,00")
 */
export const formatCOP = (amount, includeDecimals = false) => {
  if (!amount && amount !== 0) return '$0';

  const formatter = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: includeDecimals ? 2 : 0,
    maximumFractionDigits: includeDecimals ? 2 : 0
  });

  return formatter.format(amount);
};

/**
 * Formatea un número con separadores de miles (sin símbolo de moneda)
 * @param {number} amount - El monto a formatear
 * @returns {string} - El número formateado (ej: "294.000")
 */
export const formatNumber = (amount) => {
  if (!amount && amount !== 0) return '0';

  return new Intl.NumberFormat('es-CO').format(amount);
};
