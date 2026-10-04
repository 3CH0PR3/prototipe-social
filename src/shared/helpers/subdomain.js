export const getSubdomain = () => {
  const host = window.location.hostname;

  // Check if it's an IP address
  const isIpAddress = /^(\d{1,3}\.){3}\d{1,3}$/.test(host);
  if (isIpAddress) {
    return null;
  }

  // Get base domain from env (without port)
  const appDomain = import.meta.env.VITE_APP_DOMAIN || 'localhost:5173';
  const baseDomain = appDomain.split(':')[0]; // Remove port if exists

  // If current host matches base domain exactly, no subdomain
  if (host === baseDomain) {
    return null;
  }

  // If host ends with base domain, extract subdomain
  // e.g. host = "tenant.192.168.80.13.sslip.io", baseDomain = "192.168.80.13.sslip.io"
  if (host.endsWith(`.${baseDomain}`)) {
    const subdomain = host.slice(0, -(baseDomain.length + 1)); // +1 for the dot
    // Only return if it's a simple subdomain (no dots)
    return subdomain.includes('.') ? null : subdomain;
  }

  // Fallback: localhost subdomain handling
  if (host.includes('.localhost')) {
    const parts = host.split('.');
    if (parts.length >= 2 && parts[parts.length - 1] === 'localhost') {
      return parts[0];
    }
  }

  // Fallback: local aliases (.local)
  if (host.endsWith('.local')) {
    const parts = host.split('.');
    if (parts.length === 2 && parts[0] !== 'localhost') {
      return parts[0];
    }
  }

  // Fallback: traditional subdomain detection (3+ parts)
  const parts = host.split('.');
  if (parts.length >= 3) {
    return parts[0];
  }

  return null;
};

export const isCentralDomain = () => {
  return getSubdomain() === null;
};

export const isTenantDomain = () => {
  return getSubdomain() !== null;
};
