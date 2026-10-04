import fs from 'fs';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getLocalIp() {
  const interfaces = os.networkInterfaces();

  // Prioridades: primero 192.168.80.x, luego 192.168.x.x, luego 10.x.x.x
  const priorities = [
    (ip) => ip.startsWith('192.168.80.'),
    (ip) => ip.startsWith('192.168.'),
    (ip) => ip.startsWith('10.'),
  ];

  for (const check of priorities) {
    for (const name of Object.keys(interfaces)) {
      for (const iface of interfaces[name]) {
        if (
          iface.family === 'IPv4' &&
          !iface.internal &&
          check(iface.address)
        ) {
          return iface.address;
        }
      }
    }
  }

  return '127.0.0.1';
}

const ip = getLocalIp();
const envPath = path.join(__dirname, '.env');
const envContent = fs.readFileSync(envPath, 'utf8');

const updatedEnv = envContent
  .replace(/VITE_APP_DOMAIN=.*/g, `VITE_APP_DOMAIN=${ip}.sslip.io:5173`)
  .replace(/VITE_API_DOMAIN=.*/g, `VITE_API_DOMAIN=${ip}.sslip.io:8000`)
  .replace(/VITE_REVERB_HOST=.*/g, `VITE_REVERB_HOST=${ip}.sslip.io`);

fs.writeFileSync(envPath, updatedEnv);

console.log('✅ .env actualizado con IP:', ip);
console.log('');
console.log('Frontend: http://' + ip + '.sslip.io:5173');
console.log('Backend:  http://' + ip + '.sslip.io:8000');
console.log('');
