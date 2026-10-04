import { runRules } from './runRules';

export const validateForm = (form, rules) => {
  form.clearErrors();
  let isValid = true;

  Object.entries(rules).forEach(([field, ruleString]) => {
    const error = runRules(form[field], ruleString, { 
      field, 
      values: form, 
      rules: ruleString 
    });

    if (error) {
      form.setError(field, error);
      isValid = false;
    }
  });

  return isValid;
};
