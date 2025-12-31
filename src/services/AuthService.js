// Importamos la instancia configurada para llamadas a la API propia (Hija)
// Importamos axios crudo para llamadas a la API de autenticación (Madre)
import axios from 'axios';

// Variables de entorno
const MOTHER_API_URL = import.meta.env.VITE_MOTHER_API_URL || 'http://localhost:8000';
const MOTHER_APP_URL = import.meta.env.VITE_MOTHER_APP_URL || 'http://localhost:5173';

export default {
  /**
   * 1. INICIAR LOGIN (Navegador)
   * Redirige al usuario al Backend Madre para iniciar el flujo.
   * Ahora asumimos que la Madre tiene un portal de login o dashboard central desde donde se salta a la hija.
   */
  async login() {
    // Redirección directa al portal de la App Madre
    window.location.href = `${MOTHER_APP_URL}`;
  },

  /**
   * 2. PROCESAR TOKEN DIRECTO (SSO Implícito)
   * Recibe el token y (opcionalmente) datos de usuario desde la URL.
   */
  processDirectToken(token, userData = null) {
    if (!token) throw new Error('Token no proporcionado.');

    // 1. Guardar token
    localStorage.setItem('access_token', token);

    // 2. Guardar datos de usuario si vienen (para evitar fetch inmediato si no es necesario)
    if (userData) {
      // Si recibimos un string JSON, lo parseamos, sino asumimos que ya es objeto
      const user = typeof userData === 'string' ? JSON.parse(userData) : userData;
      localStorage.setItem('user_data', JSON.stringify(user));
      return { access_token: token, user };
    }

    return { access_token: token };
  },

  /**
   * 3. OBTENER USUARIO (API Madre)
   * Pedimos los datos del usuario a la Madre.
   */
  async getUser() {
    const token = localStorage.getItem('access_token');
    if (!token) throw new Error("No hay token disponible");

    // Usamos axios directo hacia la MADRE, inyectando el token manualmente.
    const response = await axios.get(`${MOTHER_API_URL}/api/user`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });

    return response.data;
  },

  /**
   * 4. LOGOUT CENTRALIZADO (Desde App Madre)
   */
  logout() {
    this.logoutLocal();
    // Redirigir a la APP MADRE para que ella mate la sesión y el token globalmente
    window.location.href = `${MOTHER_APP_URL}/logout`;
  },

  logoutLocal() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_data');
    // Limpiamos cualquier rastro de verificación antigua si existiera
    localStorage.removeItem('pkce_verifier');
  }
};
