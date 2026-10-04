import { computed } from 'vue';
import { validateForm } from '@shared/helpers/validators/validateForm';
import { runRules } from '@shared/helpers/validators/runRules';

/**
 * Composable genérico de validación de formularios.
 *
 * Uso:
 *   const { validate, validateField } = useFormValidator(form, rules);
 *
 * @param {Object} form   - Instancia reactiva de useForm()
 * @param {Object} rules  - Objeto de reglas: { campo: 'required|email|min:3' }
 */
export const useFormValidator = (form, rules) => {
  /**
   * Valida todos los campos definidos en `rules`.
   * Limpia errores previos y llena form.errors con los nuevos.
   * @returns {boolean} true si el formulario es válido
   */
  const validate = () => validateForm(form, rules);

  /**
   * Valida un campo individual sin limpiar los demás errores.
   * Útil para validación en tiempo real (on blur / on input).
   * @param {string} field - Nombre del campo a validar
   * @returns {boolean} true si el campo es válido
   */
  const validateField = (field) => {
    if (!rules[field]) return true;
    const error = runRules(form[field], rules[field]);
    if (error) {
      form.setError(field, error);
      return false;
    }
    form.clearErrors(field);
    return true;
  };

  /** Computed reactivo de los errores actuales del form */
  const errors = computed(() => form.errors);

  /** true si no hay ningún error activo */
  const isValid = computed(() => !form.hasErrors());

  return { validate, validateField, errors, isValid };
};
