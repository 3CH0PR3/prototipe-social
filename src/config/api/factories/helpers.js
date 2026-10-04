export const resourceHelpers = {
  find: (base) => (value) => `${base}/find/${value}`,
  stats: (base) => () => `${base}/stats`,
  action: (base, path) => () => `${base}/${path}`
};
