import { rules } from './rules';
import { parseRules } from './parseRules';

export const runRules = (value, ruleString, options = {}) => {
  const parsedRules = parseRules(ruleString);
  const isNullable = parsedRules.some(({ name }) => name === 'nullable');

  // Si es nullable y el valor está vacío (null, undefined o string vacío), es válido
  if (isNullable && (value === null || value === undefined || value === '')) {
    return null;
  }

  // Crear contexto con isNumber
  const ruleNames = parsedRules.map(r => r.name);
  const ctx = {
    field: options.field || '',
    values: options.values || {},
    rules: ruleNames,
    isNumber: ruleNames.includes('numeric') || ruleNames.includes('integer'),
  };

  for (const { name, param } of parsedRules) {
    if (name === 'nullable') continue;

    const validator = rules[name];

    if (!validator) {
      console.warn(`Validation rule "${name}" not found`);
      continue;
    }

    const error = validator(value, param, ctx);
    if (error) return error;
  }

  return null;
};
