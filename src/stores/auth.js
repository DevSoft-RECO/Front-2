import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'
import AuthService from '../services/AuthService'
import api from '../api/axios' // Cliente para Backend Local
import { getAvatarUrl } from '../utils/imageUtils'

const MOTHER_API_URL = import.meta.env.VITE_MOTHER_API_URL
const CLIENT_ID = import.meta.env.VITE_CLIENT_ID
const REDIRECT_URI = import.meta.env.VITE_REDIRECT_URI

export const useAuthStore = defineStore('auth', () => {
  // MIGRACIÓN DE ALMACENAMIENTO (Limpia cachés viejas si cambia de arquitectura)
  const STORAGE_VERSION = 'v2_pkce'; 
  if (localStorage.getItem('yk_storage_version') !== STORAGE_VERSION) {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_data');
    sessionStorage.removeItem('user_data');
    localStorage.setItem('yk_storage_version', STORAGE_VERSION);
  }

  // --- STATE ---
  const user = ref(JSON.parse(sessionStorage.getItem('user_data') || 'null'))
  const token = ref(localStorage.getItem('access_token') || null)
  const processingSSO = ref(false)
  const isReady = ref(false)
  let fetchPromise = null

  // --- GETTERS ---
  const userAvatar = computed(() => {
    return getAvatarUrl(user.value?.avatar)
  })

  // --- ACTIONS ---

  /**
   * Inicia el flujo PKCE
   */
  async function login() {
    processingSSO.value = true
    await AuthService.login()
  }

  /**
   * Procesa el código PKCE recibido en el callback
   */
  async function handlePKCECallback(code) {
    processingSSO.value = true
    try {
      const verifier = sessionStorage.getItem('pkce_verifier')
      if (!verifier) throw new Error('No se encontró el verifier PKCE')

      const response = await axios.post(`${MOTHER_API_URL}/oauth/token`, {
        grant_type: 'authorization_code',
        client_id: CLIENT_ID,
        redirect_uri: REDIRECT_URI,
        code_verifier: verifier,
        code: code
      });

      token.value = response.data.access_token;
      localStorage.setItem('access_token', token.value);
      sessionStorage.removeItem('pkce_verifier');

      // Limpiamos el cache de usuario para forzar una carga limpia
      user.value = null;
      sessionStorage.removeItem('user_data');

      await fetchUser();
    } catch (error) {
      console.error('Error procesando el canje PKCE:', error)
      throw error
    } finally {
      processingSSO.value = false
    }
  }

  /**
   * Cierra sesión local y redirige al backend
   */
  function logout() {
    user.value = null
    token.value = null
    isReady.value = false
    fetchPromise = null
    AuthService.logout()
  }

  /**
   * Obtiene los datos del usuario desde el Backend LOCAL (Puerto 8001/8003)
   * Implementa bloqueo de peticiones concurrentes.
   */
  async function fetchUser() {
    if (!token.value) {
      isReady.value = true
      return
    }

    // Si ya hay una petición en curso, devolvemos su promesa
    if (fetchPromise) return fetchPromise

    fetchPromise = (async () => {
        try {
            const response = await api.get('/me');
            user.value = response.data;
            sessionStorage.setItem('user_data', JSON.stringify(user.value));
            return user.value;
        } catch (error) {
            console.warn('Sesión expirada o inválida en sincronización local');
            if (error.response?.status === 401) {
                logout();
            }
            throw error;
        } finally {
            isReady.value = true
            fetchPromise = null // Liberamos el bloqueo
        }
    })();

    return fetchPromise;
  }


  /**
   * Helper para verificar permisos
   */
  function can(permission) {
    if (!user.value) return false
    if (user.value.roles && user.value.roles.includes('Super Admin')) return true

    // Fallback names for permissions array
    const userPerms = user.value.permissions || user.value.permisos || [];
    return Array.isArray(userPerms) && userPerms.includes(permission);
  }

  function hasRole(role) {
    if (!user.value) return false
    return user.value.roles && user.value.roles.includes(role)
  }

  async function checkAuth() {
    await fetchUser()
  }

  return {
    user,
    token,
    processingSSO,
    isReady,
    userAvatar,
    login,
    handlePKCECallback,
    logout,
    fetchUser,
    checkAuth,
    can,
    hasRole
  }
})

