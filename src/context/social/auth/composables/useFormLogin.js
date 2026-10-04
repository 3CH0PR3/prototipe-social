import { useFormValidator } from '@shared/composables/useFormValidator';
import { loginRules, registerRules, forgotRules, resetRules } from './rules/auth.rules';

export const useFormLogin    = (form) => useFormValidator(form, loginRules);
export const useFormRegister = (form) => useFormValidator(form, registerRules);
export const useFormForgot   = (form) => useFormValidator(form, forgotRules);
export const useFormReset    = (form) => useFormValidator(form, resetRules);
