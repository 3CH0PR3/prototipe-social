/**
 * @param {string} url
 * @returns
 **/
export const clean = (url) => url.replace(/([^:]\/)\/+/g, '$1').replace(/\/$/, '');
