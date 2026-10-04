/**
 * Corre todas las reglas de un campo y retorna el primer error encontrado.
 * @param {string} value - Valor del campo
 * @param {string} ruleString - Reglas separadas por | ej: 'required|email|min:3|max:50'
 * @returns {string|null} Mensaje de error o null si es válido
 */
export const runRules = (value, ruleString) => {
  for (const { name, param } of parseRules(ruleString)) {
    const validator = validators[name];
    if (!validator) continue;

    const error = validator(value, param);
    if (error) return error;
  }
  return null;
};

/**
 * Parsea el string de reglas a un array de objetos { name, param }
 * @param {string} ruleString - ej: 'required|min:3|max:50'
 * @returns {{ name: string, param?: string }[]}
 */
const parseRules = (ruleString) =>
  ruleString.split('|').map((rule) => {
    const [name, param] = rule.split(':');
    return { name, param };
  });

const validators = {
  /**
   * El campo no puede estar vacío.
   * @example 'required'
   */
  required: (value) => (!value ? 'El campo es requerido' : null),

  /**
   * Valida formato de correo electrónico.
   * @example 'email'
   */
  email: (value) =>
    value && !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value)
      ? 'Correo electrónico no válido'
      : null,

  /**
   * Longitud mínima del valor.
   * @param {string} param - Número mínimo de caracteres
   * @example 'min:8'
   */
  min: (value, param) =>
    value && value.length < Number(param) ? `Debe tener mínimo ${param} caracteres` : null,

  /**
   * Longitud máxima del valor.
   * @param {string} param - Número máximo de caracteres
   * @example 'max:50'
   */
  max: (value, param) =>
    value && value.length > Number(param) ? `Debe tener máximo ${param} caracteres` : null,

  /**
   * Valida complejidad de contraseña: mínimo una mayúscula, un número y un carácter especial.
   * @example 'password'
   */
  password: (value) =>
    value && !/^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/.test(value)
      ? 'Debe tener al menos una mayúscula, un número y un carácter especial'
      : null,

  /**
   * Solo letras (sin números ni caracteres especiales).
   * @example 'alpha'
   */
  alpha: (value) => (value && !/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value) ? 'Solo se permiten letras' : null),

  /**
   * Solo números enteros.
   * @example 'numeric'
   */
  numeric: (value) => (value && !/^\d+$/.test(value) ? 'Solo se permiten números' : null),

  /**
   * Letras y números, sin caracteres especiales.
   * @example 'alphanumeric'
   */
  alphanumeric: (value) =>
    value && !/^[a-zA-Z0-9]+$/.test(value) ? 'Solo se permiten letras y números' : null,

  /**
   * Valor mínimo numérico.
   * @param {string} param - Valor mínimo permitido
   * @example 'minVal:18'
   */
  minVal: (value, param) => (value && Number(value) < Number(param) ? `El valor mínimo es ${param}` : null),

  /**
   * Valor máximo numérico.
   * @param {string} param - Valor máximo permitido
   * @example 'maxVal:100'
   */
  maxVal: (value, param) => (value && Number(value) > Number(param) ? `El valor máximo es ${param}` : null),

  /**
   * Valida formato de URL (http o https).
   * @example 'url'
   */
  url: (value) =>
    value &&
    !/^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z]{2,6}([-a-zA-Z0-9@:%_+.~#?&/=]*)$/.test(value)
      ? 'URL no válida'
      : null,

  /**
   * Valida formato de número telefónico (7 a 15 dígitos, puede incluir + al inicio).
   * @example 'phone'
   */
  phone: (value) => (value && !/^\+?\d{7,15}$/.test(value) ? 'Número de teléfono no válido' : null),

  /**
   * El valor debe ser una fecha válida.
   * @example 'date'
   */
  date: (value) => (value && isNaN(Date.parse(value)) ? 'Fecha no válida' : null),

  /**
   * Valida que sea un valor booleano (true/false, 1/0, 'yes'/'no').
   * @example 'boolean'
   */
  boolean: (value) =>
    value !== undefined && ![true, false, 1, 0, 'true', 'false', 'yes', 'no'].includes(value)
      ? 'El valor debe ser verdadero o falso'
      : null,

  /**
   * El campo debe ser marcado como verdadero (útil para checkboxes de términos).
   * @example 'accepted'
   */
  accepted: (value) => (![true, 1, 'true', 'yes', '1'].includes(value) ? 'Debes aceptar este campo' : null)
};
