export const toTitleCase = (text = '') =>
  text.toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
