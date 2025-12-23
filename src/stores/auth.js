import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import AuthService from '../services/AuthService'
import MotherAuthService from '../services/MotherAuthService'
import { getAvatarUrl } from '../utils/imageUtils'

export const useAuthStore = defineStore('auth', () => {
  // --- STATE ---
  const user = ref(null)
  const token = ref(localStorage.getItem('access_token') || null)
  const processingSSO = ref(false)
  const isReady = ref(false)

  // --- GETTERS ---
  const userAvatar = computed(() => {
    return getAvatarUrl(user.value?.avatar)
  })

  // --- ACTIONS ---

  /**
   * Inicia el flujo de redirección a Microsoft/Laravel
   */
  async function login() {
    processingSSO.value = true
    await AuthService.login()
  }

  /**
   * Procesa el código que viene de Laravel
   */
  async function handleCallback(code) {
    processingSSO.value = true
    try {
      const data = await AuthService.handleCallback(code)
      token.value = data.access_token
      localStorage.setItem('access_token', data.access_token)

      // Una vez tenemos token, pedimos el usuario inmediatamente
      await fetchUser()
    } catch (error) {
      console.error('Error en callback SSO:', error)
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
    AuthService.logout()
  }

  /**
   * Verifica si el token es válido y carga el usuario desde la App Madre
   */
  async function fetchUser() {
    if (!token.value) {
      isReady.value = true
      return
    }

    try {
      const userData = await MotherAuthService.getMyProfile()
      user.value = userData
      // Guardamos respaldo básico en localStorage por si acaso
      localStorage.setItem('user_data', JSON.stringify(userData))
    } catch (error) {
      console.warn('Sesión expirada o inválida, o error al conectar con Madre')
      // Si falla la validación del token, hacemos logout
      logout()
    } finally {
      isReady.value = true
    }
  }

  /**
   * Helper para verificar permisos en la App Hija
   */
  function can(permission) {
    if (!user.value) return false

    // Super Admin siempre puede todo
    if (user.value.roles && user.value.roles.includes('Super Admin')) return true

    // Verificar lista de permisos (si existe)
    if (user.value.permissions && Array.isArray(user.value.permissions)) {
      return user.value.permissions.includes(permission)
    }

    return false
  }

  // Verificar autenticación al arrancar (si hay token)
  async function checkAuth() {
    await fetchUser()
  }

  return {
    user,
    token,
    processingSSO,
    isReady,
    userAvatar, // Exported getter
    login,
    handleCallback,
    logout,
    fetchUser,
    checkAuth,
    can
  }
})
