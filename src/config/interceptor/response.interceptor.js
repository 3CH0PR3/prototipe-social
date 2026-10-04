export function setupResponseInterceptor(client) {
  client.interceptors.response.use(
    (response) => {
      // Si la respuesta es 204 No Content, devolver la respuesta completa
      if (response.status === 204) {
        return response;
      }

      // Si no hay data, devolver la respuesta completa
      if (!response.data) {
        return response;
      }

      let data = response.data;
      
      // Si la respuesta es un string (por culpa del BOM u otro issue), parsearlo
      if (typeof data === 'string') {
        // Si el string está vacío o es whitespace, devolver la respuesta completa
        if (!data.trim()) {
          return response;
        }

        try {
          // Remover BOM si existe
          const cleanData = data.replace(/^\uFEFF/, '');
          data = JSON.parse(cleanData);
          // Actualizar response.data con el data parseado
          response.data = data;
        } catch (e) {
          console.error('[Response Interceptor] Failed to parse JSON string:', e);
          // Si falla el parseo, devolver la respuesta original
          return response;
        }
      }
      
      // Desenvuelve data para respuestas exitosas (mantiene retrocompatibilidad)
      return data;
    },
    (error) => {
      // Preserva la estructura completa del error para que otros interceptors
      // puedan acceder a error.response.status, error.response.data, etc.
      return Promise.reject(error);
    }
  );
}
