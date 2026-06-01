import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'
import AuthService from '../services/AuthService'
import api from '../api/axios' // Cliente para Backend Local
import { getAvatarUrl } from '../utils/imageUtils'
import Echo from 'laravel-echo'
import Pusher from 'pusher-js'

const MOTHER_API_URL = import.meta.env.VITE_MOTHER_API_URL
const CLIENT_ID = import.meta.env.VITE_CLIENT_ID
const REDIRECT_URI = import.meta.env.VITE_REDIRECT_URI

export const useAuthStore = defineStore('auth', () => {
  // MIGRACIÓN DE ALMACENAMIENTO (Limpia cachés viejas si cambia de arquitectura)
  const STORAGE_VERSION = 'v3_hija2_pkce'; 
  if (localStorage.getItem('yk_storage_version') !== STORAGE_VERSION) {
    const keysToRemove = ['access_token', 'user_data', 'pkce_verifier'];
    keysToRemove.forEach(k => {
       localStorage.removeItem(k);
       sessionStorage.removeItem(k);
    });
    localStorage.setItem('yk_storage_version', STORAGE_VERSION);
  }

  // --- STATE ---
  const user = ref(JSON.parse(sessionStorage.getItem('user_data') || 'null'))
  const token = ref(sessionStorage.getItem('access_token') || null)
  const processingSSO = ref(false)
  const isReady = ref(false)
  let fetchPromise = null

  // --- VARIABLES REACTIVAS DE SOCKETS Y CONTROL DE INACTIVIDAD ---
  const echoInstance = ref(null)
  const showInactivityModal = ref(false)
  const inactivitySessionId = ref(null)
  const inactivityCountdown = ref(300)
  const isHeartbeatLoading = ref(false)
  let countdownTimerId = null

  // --- GETTERS ---
  const userAvatar = computed(() => {
    return getAvatarUrl(user.value?.avatar)
  })

  // --- ACTIONS ---

  /**
   * Inicia el flujo de redirección a Microsoft/Laravel (PKCE)
   * @param {String} redirectTo URL a la que volver tras el login (opcional)
   */
  async function login(redirectTo = null) {
    if (processingSSO.value) return; // Evitar múltiples redirecciones
    processingSSO.value = true;
    
    if (redirectTo) {
      sessionStorage.setItem('auth_redirect_to', redirectTo);
    }
    
    await AuthService.login();
    // processingSSO se reseteará al volver del callback
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
      sessionStorage.setItem('access_token', token.value);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token.value}`;
      sessionStorage.removeItem('pkce_verifier');

      // ¡ESTO ES VITAL! Pedimos datos de usuario ignorando cualquier basura vieja
      await fetchUser(true);

      // CRÍTICO: Inicializar WebSockets de inmediato tras obtener el token
      initSessionSocket()
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
    disconnectSessionSocket()
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
  async function fetchUser(force = false) {
    if (!token.value) {
      isReady.value = true
      return
    }

    // SI FORCE ES TRUE, IGNORAMOS EL CACHÉ Y OBLIGAMOS A CONSULTAR AL BACKEND
    if (!force && user.value) {
      isReady.value = true;
      return;
    }

    // Si ya hay una petición en curso, devolvemos su promesa
    if (fetchPromise) return fetchPromise

    fetchPromise = (async () => {
        try {
            const response = await api.get(force ? '/me?sync=true' : '/me');
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

  // --- MÉTODOS DE SOCKETS Y CIERRE ---
  function initSessionSocket() {
    if (!token.value || !user.value) return
    if (echoInstance.value) return // Evitar conexiones duplicadas

    window.Pusher = Pusher

    echoInstance.value = new Echo({
      broadcaster: 'reverb',
      key: import.meta.env.VITE_REVERB_APP_KEY,
      wsHost: import.meta.env.VITE_REVERB_HOST || 'localhost',
      wsPort: Number(import.meta.env.VITE_REVERB_PORT) || 8082,
      wssPort: Number(import.meta.env.VITE_REVERB_PORT) || 8082,
      forceTLS: false,
      enabledTransports: ['ws', 'wss'],
      authEndpoint: `${import.meta.env.VITE_MOTHER_API_URL}/api/broadcasting/auth`,
      auth: {
        headers: {
          Authorization: `Bearer ${token.value}`,
          Accept: 'application/json'
        }
      }
    })

    // Escuchar canal privado del usuario centralizado
    echoInstance.value.private(`user.${user.value.id}`)
      .listen('.InactivityExpiringSoon', (e) => {
        inactivitySessionId.value = e.sessionId
        inactivityCountdown.value = Math.round(e.remainingSeconds) || 300
        showInactivityModal.value = true
        startLocalCountdown()
      })
      .listen('.SessionRenewed', (e) => {
        if (inactivitySessionId.value === e.sessionId) {
          showInactivityModal.value = false
          stopLocalCountdown()
        }
      })
      .listen('.SessionForceClosed', () => {
        stopLocalCountdown()
        disconnectSessionSocket()
        AuthService.logoutLocal()
        const motherAppUrl = import.meta.env.VITE_MOTHER_APP_URL || 'http://localhost:5173'
        window.location.href = `${motherAppUrl}/login?session_expired=true`
      })
      .error((error) => {
        console.warn('Error de autorización en canal de sockets:', error)
        if (error && (error.status === 401 || error.status === 403)) {
          stopLocalCountdown()
          disconnectSessionSocket()
          AuthService.logoutLocal()
          const motherAppUrl = import.meta.env.VITE_MOTHER_APP_URL || 'http://localhost:5173'
          window.location.href = `${motherAppUrl}/login?session_expired=true`
        }
      })
  }

  function disconnectSessionSocket() {
    if (echoInstance.value) {
      echoInstance.value.disconnect()
      echoInstance.value = null
    }
    showInactivityModal.value = false
    inactivitySessionId.value = null
    stopLocalCountdown()
  }

  function startLocalCountdown() {
    if (countdownTimerId) clearInterval(countdownTimerId)
    countdownTimerId = setInterval(() => {
      if (inactivityCountdown.value > 0) {
        inactivityCountdown.value--
      } else {
        clearInterval(countdownTimerId)
        AuthService.logoutLocal()
        const motherAppUrl = import.meta.env.VITE_MOTHER_APP_URL || 'http://localhost:5173'
        window.location.href = `${motherAppUrl}/login?session_expired=true`
      }
    }, 1000)
  }

  function stopLocalCountdown() {
    if (countdownTimerId) {
      clearInterval(countdownTimerId)
      countdownTimerId = null
    }
  }

  async function sendHeartbeatPing() {
    if (!inactivitySessionId.value || isHeartbeatLoading.value) return
    isHeartbeatLoading.value = true
    try {
      const motherApiUrl = import.meta.env.VITE_MOTHER_API_URL || 'http://localhost:8000'
      await axios.post(`${motherApiUrl}/api/sso/heartbeat`, {
        session_id: inactivitySessionId.value
      }, {
        headers: {
          Authorization: `Bearer ${token.value}`
        }
      })

      showInactivityModal.value = false
      stopLocalCountdown()
    } catch (err) {
      console.error('Error al enviar ping de heartbeat a la Madre:', err)
      logout()
    } finally {
      isHeartbeatLoading.value = false
    }
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
    hasRole,
    // Sockets e Inactividad
    echoInstance,
    showInactivityModal,
    inactivitySessionId,
    inactivityCountdown,
    isHeartbeatLoading,
    initSessionSocket,
    disconnectSessionSocket,
    sendHeartbeatPing
  }
})

