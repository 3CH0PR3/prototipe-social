import CryptoJS from 'crypto-js';

class EncryptionService {
  constructor(key) {
    if (!key) {
      console.warn('VITE_ENCRYPTION_KEY no está configurada');
    }
    this.key = key;
  }

  decrypt(encryptedData) {
    try {
      if (!this.key) {
        // console.error('Clave de encriptación no configurada');
        return null;
      }

      // console.log('🔐 Intentando desencriptar...');
      // console.log('Longitud de datos encriptados:', encryptedData.length);

      const rawData = CryptoJS.enc.Base64.parse(encryptedData);
      const iv = CryptoJS.lib.WordArray.create(rawData.words.slice(0, 4));

      const encrypted = CryptoJS.lib.WordArray.create(rawData.words.slice(4), rawData.sigBytes - 16);

      const derivedKey = CryptoJS.SHA256(this.key);

      const decrypted = CryptoJS.AES.decrypt({ ciphertext: encrypted }, derivedKey, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      });

      const decryptedStr = decrypted.toString(CryptoJS.enc.Utf8);

      if (!decryptedStr) {
        throw new Error('Desencriptación resultó en string vacío');
      }

      const result = JSON.parse(decryptedStr);
      // console.log('Desencriptación exitosa');

      return result;
    } catch (error) {
      console.error('Error desencriptando:', error.message);
      console.error('Stack:', error.stack);
      return null;
    }
  }

  encrypt(data) {
    try {
      if (!this.key) {
        console.error('Clave de encriptación no configurada');
        return null;
      }

      const jsonStr = JSON.stringify(data);

      const iv = CryptoJS.lib.WordArray.random(16);
      const derivedKey = CryptoJS.SHA256(this.key);

      const encrypted = CryptoJS.AES.encrypt(jsonStr, derivedKey, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      });

      const combined = iv.concat(encrypted.ciphertext);

      return combined.toString(CryptoJS.enc.Base64);
    } catch (error) {
      console.error('Error encriptando:', error.message);
      return null;
    }
  }
}

export default {
  install(app, options = {}) {
    const key = options.key || import.meta.env.VITE_ENCRYPTION_KEY;
    const encryption = new EncryptionService(key);

    // Hacer disponible globalmente
    app.config.globalProperties.$encryption = encryption;
    // Provide/Inject para Composition API
    app.provide('encryption', encryption);
    // console.log('Plugin de encriptación instalado');
  }
};

export { EncryptionService };
