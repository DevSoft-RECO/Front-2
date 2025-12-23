// Importamos la instancia configurada para llamadas a la API propia (Hija)
import api from '../axios'; 
// Importamos axios crudo para llamadas a la API de autenticación (Madre)
import axios from 'axios';
import { generateCodeVerifier, generateCodeChallenge } from '../utils/pkce';

// Variables de entorno
const MOTHER_API_URL = import.meta.env.VITE_MOTHER_API_URL || 'http://localhost:8000';
const CLIENT_ID = import.meta.env.VITE_CLIENT_ID;
const REDIRECT_URI = import.meta.env.VITE_REDIRECT_URI;

export default {
  /**
   * 1. INICIAR LOGIN (Navegador)
   * Redirige al usuario al Backend Madre para iniciar el flujo OAuth.
   */
  async login() {
    const verifier = generateCodeVerifier();
    const challenge = await generateCodeChallenge(verifier);

    localStorage.setItem('pkce_verifier', verifier);

    const params = new URLSearchParams({
      client_id: CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      response_type: 'code',
      scope: '',
      code_challenge: challenge,
      code_challenge_method: 'S256',
    });

    // Redirección directa del navegador (A LA MADRE)
    window.location.href = `${MOTHER_API_URL}/auth/initiate?${params.toString()}`;
  },

  /**
   * 2. PROCESAR CALLBACK (API Madre)
   * Intercambia el código por un token de acceso.
   */
  async handleCallback(code) {
    const verifier = localStorage.getItem('pkce_verifier');
    if (!verifier) throw new Error('Falta el código verificador PKCE.');

    // Usamos 'axios.post' DIRECTO a la MADRE (Puerto 8000)
    const response = await axios.post(`${MOTHER_API_URL}/oauth/token`, {
      grant_type: 'authorization_code',
      client_id: CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      code_verifier: verifier,
      code: code,
    });

    // Guardamos el token
    localStorage.setItem('access_token', response.data.access_token);
    localStorage.removeItem('pkce_verifier');

    return response.data;
  },

  /**
   * 3. OBTENER USUARIO (API Madre)
   * CAMBIO IMPORTANTE: Pedimos los datos del usuario a la Madre (:8000),
   * ya que ella tiene la base de datos real de usuarios.
   */
  async getUser() {
    const token = localStorage.getItem('access_token');
    if (!token) throw new Error("No hay token disponible");

    // Usamos axios directo hacia la MADRE, inyectando el token manualmente.
    // Esto conecta con la ruta Route::middleware('auth:api')->get('/user') que me mostraste.
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
    const motherAppUrl = import.meta.env.VITE_MOTHER_APP_URL || 'http://localhost:5173';
    window.location.href = `${motherAppUrl}/logout`;
  },

  logoutLocal() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('pkce_verifier');
    localStorage.removeItem('user_data');
  }
};