import { preparePKCE } from '@/utils/auth-crypto';

// Variables de entorno
const MOTHER_API_URL = import.meta.env.VITE_MOTHER_API_URL || 'http://localhost:8000';
const MOTHER_APP_URL = import.meta.env.VITE_MOTHER_APP_URL || 'http://localhost:5173';
const CLIENT_ID = import.meta.env.VITE_CLIENT_ID;
const REDIRECT_URI = import.meta.env.VITE_REDIRECT_URI;

export default {
  /**
   * 1. INICIAR LOGIN (PKCE)
   * Genera el reto PKCE y redirige al servidor de autorización de la Madre.
   */
  async login() {
    const challenge = await preparePKCE();

    const authUrl = new URL(`${MOTHER_API_URL}/oauth/authorize`);
    authUrl.searchParams.append('client_id', CLIENT_ID);
    authUrl.searchParams.append('redirect_uri', REDIRECT_URI);
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('scope', '*');
    authUrl.searchParams.append('code_challenge', challenge);
    authUrl.searchParams.append('code_challenge_method', 'S256');

    // Anti-Race Condition: setTimeout de 150ms para asegurar que sessionStorage se guarde
    setTimeout(() => {
        window.location.href = authUrl.toString();
    }, 150);
  },

  /**
   * 2. LOGOUT CENTRALIZADO
   */
  logout() {
    this.logoutLocal();
    // Redirigir al logout de la Madre (Frontend del Portal)
    window.location.href = `${MOTHER_APP_URL}/logout`;
  },

  logoutLocal() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_data');
    sessionStorage.removeItem('user_data');
    sessionStorage.removeItem('pkce_verifier');
  }
};

