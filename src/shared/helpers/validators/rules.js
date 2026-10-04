/**
 * Validación de formularios estilo Laravel, sin dependencias.
 *
 * Uso:
 *   const errors = validateForm(form, {
 *     name:     'required|string|min:3|max:80',
 *     email:    'required|email',
 *     age:      'nullable|integer|between:18,99',
 *     password: 'required|password:8|confirmed',
 *     role:     'required|in:admin,editor,viewer',
 *     website:  ['nullable', 'url'],
 *     code:     ['required', 'regex:^(A|B)\\d{3}$'],   // usa array si el regex lleva "|"
 *     custom:   ['required', (v) => v === 'ok' ? null : 'Debe ser "ok"'],
 *   });
 *   // errors => { email: 'Ingresa un email válido', ... }
 *
 * Convención: cada regla devuelve `null` si pasa o un `string` con el error.
 */

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

const BOOLEAN_VALUES = new Set([true, false, 0, 1, '0', '1', 'true', 'false']);
const ACCEPTED_VALUES = new Set([true, 1, '1', 'yes', 'on', 'true']);

const NUMERIC_RE = /^[+-]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?$/;
const INTEGER_RE = /^[+-]?\d+$/;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const IPV4_RE = /^(?:(?:25[0-5]|2[0-4]\d|1?\d?\d)\.){3}(?:25[0-5]|2[0-4]\d|1?\d?\d)$/;

/** Un string solo con espacios cuenta como vacío. */
export const isBlank = (val) =>
  val === null ||
  val === undefined ||
  (typeof val === 'string' && val.trim() === '') ||
  (Array.isArray(val) && val.length === 0);

const isNumeric = (val) =>
  (typeof val === 'number' && Number.isFinite(val)) ||
  (typeof val === 'string' && NUMERIC_RE.test(val.trim()));

const isInteger = (val) =>
  (typeof val === 'number' && Number.isInteger(val)) ||
  (typeof val === 'string' && INTEGER_RE.test(val.trim()));

const isValidUrl = (val) => {
  if (typeof val !== 'string') return false;
  if (typeof URL.canParse === 'function') return URL.canParse(val);
  try { new URL(val); return true; } catch { return false; }
};

const toDate = (val) => {
  const time = val instanceof Date ? val.getTime() : Date.parse(val);
  return Number.isNaN(time) ? null : time;
};

/** Lectura con notación de puntos: get(values, 'user.email') */
const get = (obj, path) => String(path).split('.').reduce((acc, key) => (acc == null ? undefined : acc[key]), obj);

const list = (param) => String(param ?? '').split(',').map((s) => s.trim()).filter(Boolean);

/**
 * "Tamaño" según el tipo: número -> su valor (si hay numeric/integer),
 * array -> cantidad de items, string -> cantidad de caracteres (unicode-safe).
 */
const sizeOf = (val, ctx) => {
  if (ctx.isNumber && isNumeric(val)) return Number(val);
  if (Array.isArray(val)) return val.length;
  return [...String(val ?? '')].length;
};

const unit = (val, ctx) => ctx.isNumber && isNumeric(val) ? '' : Array.isArray(val) ? ' elementos' : ' caracteres';

/**
 * Marca una regla como "implícita": se ejecuta aunque el valor esté vacío.
 * Las demás reglas se saltan cuando el campo está vacío (así un campo
 * opcional con `email` no falla si lo dejan en blanco).
 */
const implicit = (fn) => Object.assign(fn, { implicit: true });

/* -------------------------------------------------------------------------- */
/* Reglas                                                                     */
/* -------------------------------------------------------------------------- */
/* Firma: (valor, parámetro, ctx) => null | string
 * ctx = { field, values, rules, isNumber }
 */

export const rules = {
  /* --- Presencia ---------------------------------------------------------- */
  nullable: () => null, // marcador: los vacíos ya se saltan por defecto
  bail: () => null,     // marcador: se corta en el primer error (default)

  required: implicit((val) => (!isBlank(val) ? null : 'Este campo es obligatorio')),

  filled: (val) => (!isBlank(val) ? null : 'Este campo no puede estar vacío'),

  present: implicit((val, _p, { values, field }) => get(values, field) !== undefined ? null : 'Este campo debe estar presente'),

  // required_if:otro_campo,valor
  required_if: implicit((val, param, { values }) => {
    const [other, ...expected] = list(param);
    const current = String(get(values, other) ?? '');
    return expected.includes(current) && isBlank(val) ? 'Este campo es obligatorio' : null;
  }),

  // required_with:campo1,campo2  (obligatorio si alguno de los otros tiene valor)
  required_with: implicit((val, param, { values }) =>
    list(param).some((f) => !isBlank(get(values, f))) && isBlank(val)
      ? 'Este campo es obligatorio'
      : null),

  // required_without:campo1,campo2 (obligatorio si alguno de los otros está vacío)
  required_without: implicit((val, param, { values }) =>
    list(param).some((f) => isBlank(get(values, f))) && isBlank(val)
      ? 'Este campo es obligatorio'
      : null),

  accepted: implicit((val) => (ACCEPTED_VALUES.has(val) ? null : 'Debes aceptar este campo')),

  /* --- Tipos -------------------------------------------------------------- */
  string: (val) => (typeof val === 'string' ? null : 'El campo debe ser texto'),

  numeric: (val) => (isNumeric(val) ? null : 'El campo debe ser numérico'),

  integer: (val) => (isInteger(val) ? null : 'Debe ser un número entero'),

  boolean: (val) => (BOOLEAN_VALUES.has(val) ? null : 'El campo debe ser un valor booleano'),

  bool: (val) => (BOOLEAN_VALUES.has(val) ? null : 'El campo debe ser un valor booleano'),

  array: (val) => (Array.isArray(val) ? null : 'El campo debe ser una lista'),

  date: (val) => (toDate(val) !== null ? null : 'Ingresa una fecha válida'),

  json: (val) => {
    try { JSON.parse(val); return null; } catch { return 'Debe ser un JSON válido'; }
  },

  /* --- Formato ------------------------------------------------------------ */
  email: (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(val)) ? null : 'Ingresa un email válido',

  url: (val) => (isValidUrl(val) ? null : 'Ingresa una URL válida'),

  uuid: (val) => (UUID_RE.test(String(val)) ? null : 'Ingresa un UUID válido'),

  ip: (val) => (IPV4_RE.test(String(val)) ? null : 'Ingresa una dirección IP válida'),

  // Solo letras (unicode: acepta acentos, ñ, ü, etc.)
  alpha: (val) => (/^\p{L}+$/u.test(String(val)) ? null : 'Solo se permiten letras'),

  alpha_spaces: (val) => /^[\p{L}\s]+$/u.test(String(val)) ? null : 'Solo se permiten letras y espacios',

  alpha_num: (val) => /^[\p{L}\p{N}]+$/u.test(String(val)) ? null : 'Solo se permiten letras y números',

  alpha_dash: (val) => /^[\p{L}\p{N}_-]+$/u.test(String(val)) ? null : 'Solo se permiten letras, números, guiones y guion bajo',

  lowercase: (val) => String(val) === String(val).toLowerCase() ? null : 'Debe estar en minúsculas',

  uppercase: (val) => String(val) === String(val).toUpperCase() ? null : 'Debe estar en mayúsculas',

  starts_with: (val, param) =>
    list(param).some((p) => String(val).startsWith(p))
      ? null
      : `Debe comenzar con: ${list(param).join(', ')}`,

  ends_with: (val, param) =>
    list(param).some((p) => String(val).endsWith(p))
      ? null
      : `Debe terminar con: ${list(param).join(', ')}`,

  // regex:^\d{4}$  (para patrones con "|" usa la sintaxis de array)
  regex: (val, pattern) => {
    try { return new RegExp(pattern).test(String(val)) ? null : 'El formato no es válido'; }
    catch { return 'El patrón de validación es inválido'; }
  },

  // password | password:8  -> letras + números (+ largo mínimo opcional)
  password: (val, param) => {
    const str = String(val);
    if (!/^(?=.*\p{L})(?=.*\d).+$/su.test(str)) return 'La contraseña debe contener letras y números';
    const minLen = Number(param);
    if (minLen && [...str].length < minLen) return `La contraseña debe tener al menos ${minLen} caracteres`;
    return null;
  },

  /* --- Tamaño / rango ----------------------------------------------------- */
  min: (val, param, ctx) =>
    sizeOf(val, ctx) >= Number(param)
      ? null
      : `Debe ser al menos ${param}${unit(val, ctx)}`.replace('al menos', ctx.isNumber ? 'mayor o igual a' : 'de al menos'),

  max: (val, param, ctx) =>
    sizeOf(val, ctx) <= Number(param)
      ? null
      : ctx.isNumber
        ? `No puede ser mayor a ${param}`
        : `No puede superar los ${param}${unit(val, ctx)}`,

  between: (val, param, ctx) => {
    const [lo, hi] = list(param).map(Number);
    const size = sizeOf(val, ctx);
    return size >= lo && size <= hi
      ? null
      : `Debe estar entre ${lo} y ${hi}${unit(val, ctx)}`;
  },

  size: (val, param, ctx) => sizeOf(val, ctx) === Number(param) ? null : `Debe tener exactamente ${param}${unit(val, ctx)}`,

  digits: (val, param) =>
    new RegExp(`^\\d{${Number(param)}}$`).test(String(val))
      ? null
      : `Debe tener exactamente ${param} dígitos`,

  digits_between: (val, param) => {
    const [lo, hi] = list(param).map(Number);
    return new RegExp(`^\\d{${lo},${hi}}$`).test(String(val))
      ? null
      : `Debe tener entre ${lo} y ${hi} dígitos`;
  },

  gt: (val, param, { values }) => Number(val) > Number(get(values, param) ?? param) ? null : `Debe ser mayor a ${get(values, param) ?? param}`,

  gte: (val, param, { values }) => Number(val) >= Number(get(values, param) ?? param) ? null : `Debe ser mayor o igual a ${get(values, param) ?? param}`,

  lt: (val, param, { values }) => Number(val) < Number(get(values, param) ?? param) ? null : `Debe ser menor a ${get(values, param) ?? param}`,

  lte: (val, param, { values }) => Number(val) <= Number(get(values, param) ?? param) ? null : `Debe ser menor o igual a ${get(values, param) ?? param}`,

  /* --- Fechas ------------------------------------------------------------- */
  // after:2025-01-01 | after:start_date | after:today
  after: (val, param, { values }) => {
    const ref = param === 'today' ? Date.now() : toDate(get(values, param) ?? param);
    const cur = toDate(val);
    return cur !== null && ref !== null && cur > ref ? null : `Debe ser posterior a ${param}`;
  },

  before: (val, param, { values }) => {
    const ref = param === 'today' ? Date.now() : toDate(get(values, param) ?? param);
    const cur = toDate(val);
    return cur !== null && ref !== null && cur < ref ? null : `Debe ser anterior a ${param}`;
  },

  /* --- Comparación con otros campos / listas ------------------------------ */
  // same:password_confirmation  (param = nombre del otro campo)
  same: (val, other, { values }) =>
    val === get(values, other) ? null : 'Los valores no coinciden',

  different: (val, other, { values }) =>
    val !== get(values, other) ? null : 'Los valores deben ser diferentes',

  // confirmed -> exige que exista `${campo}_confirmation` igual
  confirmed: (val, _p, { values, field }) =>
    val === get(values, `${field}_confirmation`) ? null : 'La confirmación no coincide',

  in: (val, param) =>
    list(param).includes(String(val)) ? null : 'El valor seleccionado no es válido',

  not_in: (val, param) =>
    !list(param).includes(String(val)) ? null : 'El valor seleccionado no está permitido',
};

/* -------------------------------------------------------------------------- */
/* Motor                                                                      */
/* -------------------------------------------------------------------------- */

/**
 * Normaliza a [{ name, param, fn }].
 * Acepta: 'required|min:3' | ['required', 'min:3'] | [fn] | ['required', fn]
 */
export const parseRules = (input) => {
  const items = Array.isArray(input) ? input : String(input ?? '').split('|');

  return items
    .filter((item) => typeof item === 'function' || String(item).trim() !== '')
    .map((item) => {
      if (typeof item === 'function') return { name: 'custom', param: undefined, fn: item };

      const raw = String(item).trim();
      const idx = raw.indexOf(':'); // solo el primer ":" separa nombre/parámetro
      const name = idx === -1 ? raw : raw.slice(0, idx);
      const param = idx === -1 ? undefined : raw.slice(idx + 1);

      if (!Object.hasOwn(rules, name)) {
        throw new Error(`[validation] Regla desconocida: "${name}"`);
      }
      return { name, param, fn: rules[name] };
    });
};

/**
 * Valida un campo. Devuelve el primer error (string) o null.
 * Con { all: true } devuelve un array con todos los errores.
 */
export const validateField = (value, ruleset, { field = '', values = {}, all = false } = {}) => {
  const parsed = typeof ruleset === 'string' || Array.isArray(ruleset) ? parseRules(ruleset) : ruleset;
  const names = parsed.map((r) => r.name);
  const ctx = {
    field,
    values,
    rules: names,
    isNumber: names.includes('numeric') || names.includes('integer'),
  };

  const blank = isBlank(value);
  const errors = [];

  for (const { fn, param } of parsed) {
    if (blank && !fn.implicit && fn.name !== 'custom') continue; // campo opcional vacío
    const error = fn(value, param, ctx);
    if (error) {
      errors.push(error);
      if (!all) break;
    }
  }

  return all ? errors : (errors[0] ?? null);
};

/**
 * Valida todo un formulario.
 * @returns {Object} { campo: 'mensaje' }  (vacío si todo es válido)
 */
export const validateForm = (values, schema, options = {}) => {
  const errors = {};

  for (const [field, ruleset] of Object.entries(schema)) {
    const parsed = parseRules(ruleset);
    const result = validateField(get(values, field), parsed, { field, values, all: options.all });
    if (options.all ? result.length : result) errors[field] = result;
  }

  return errors;
};

export const isValid = (errors) => Object.keys(errors).length === 0;

/** Registrar reglas propias: extendRule('phone_co', (v) => /^3\d{9}$/.test(v) ? null : 'Celular inválido') */
export const extendRule = (name, fn, { implicit: isImplicit = false } = {}) => {
  rules[name] = isImplicit ? implicit(fn) : fn;
};
