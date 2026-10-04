import { setupRequestInterceptor } from './request.interceptor';
import { setupResponseInterceptor } from './response.interceptor';
import { setupAuthInterceptor } from './auth.interceptor';

export function setupInterceptors(client) {
  setupRequestInterceptor(client);
  setupResponseInterceptor(client);
  setupAuthInterceptor(client);
}
