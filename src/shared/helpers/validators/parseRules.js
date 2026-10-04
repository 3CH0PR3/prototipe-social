export const parseRules = (ruleString) => {
  return ruleString.split('|').map((rule) => {
    const [name, param] = rule.split(':');
    return { name, param };
  });
};

// Ejm: use parseRules('required|min:8|max:50');
