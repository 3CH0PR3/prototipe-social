import axios from 'axios';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import { getSubdomain } from '@shared/helpers/subdomain';
import { useTokenStore } from '@/stores/useToken.store';

window.Pusher = Pusher;

/**
 * Parche local: Pusher.js fuerza wss:// en páginas HTTPS.
 * En desarrollo con 127.0.0.1/localhost convertimos wss:// → ws://
 * En producción (VPS con dominio real) no aplica — Reverb corre con SSL.
 */
const _WS = window.WebSocket;
window.WebSocket = function (url, protocols) {
  const fixed = url.replace(/^wss:\/\/(127\.0\.0\.1|localhost)/, 'ws://$1');
  return protocols ? new _WS(fixed, protocols) : new _WS(fixed);
};
Object.assign(window.WebSocket, {
  CONNECTING: 0,
  OPEN: 1,
  CLOSING: 2,
  CLOSED: 3
});
window.WebSocket.prototype = _WS.prototype;

class EchoService {
  constructor() {
    this.echo = null;
  }

  initialize() {
    if (this.echo) return this.echo;

    const isTLS = import.meta.env.VITE_REVERB_SCHEME === 'https';

    this.echo = new Echo({
      broadcaster: 'reverb',
      key: import.meta.env.VITE_REVERB_APP_KEY,
      wsHost: import.meta.env.VITE_REVERB_HOST,
      wsPort: Number(import.meta.env.VITE_REVERB_PORT),
      wssPort: Number(import.meta.env.VITE_REVERB_PORT),
      forceTLS: isTLS,
      enabledTransports: isTLS ? ['ws', 'wss'] : ['ws'],
      disableStats: true,
      encrypted: true,
      authEndpoint: '/broadcasting/auth',
      authorizer: (channel) => ({
        authorize: (socketId, callback) => {
          const proto = import.meta.env.VITE_PROTOCOL ?? 'https';
          const apiDomain = import.meta.env.VITE_API_DOMAIN;
          const subdomain = getSubdomain();
          const host = subdomain ? `${subdomain}.${apiDomain}` : apiDomain;
          
          // Detectar contexto: social, tenant o central
          const currentPath = window.location.pathname;
          let prefix = 'central';
          
          if (currentPath.startsWith('/social')) {
            prefix = 'social';
          } else if (subdomain) {
            prefix = 'tenant';
          }
          
          const token = useTokenStore().token;

          axios
            .post(
              `${proto}://${host}/api/v1/${prefix}/broadcasting/auth`,
              { socket_id: socketId, channel_name: channel.name },
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                  Accept: 'application/json',
                  'X-Requested-With': 'XMLHttpRequest'
                }
              }
            )
            .then((res) => callback(null, res.data))
            .catch((err) => callback(err, null));
        }
      })
    });

    window.Echo = this.echo;

    return this.echo;
  }

  getInstance() {
    if (!this.echo) this.initialize();
    return this.echo;
  }

  disconnect() {
    if (this.echo) {
      this.echo.disconnect();
      this.echo = null;
    }
  }
}

export default new EchoService();
