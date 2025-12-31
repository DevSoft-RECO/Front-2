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
   * Procesa el token que viene de la App Madre
   */
  async function handleDirectToken(incomingToken, userData = null) {
    processingSSO.value = true
    try {
      const data = AuthService.processDirectToken(incomingToken, userData)
      // data.access_token ya está en localStorage gracias al service
      // data.user también, si venía

      token.value = data.access_token

      // Si recibimos usuario, actualizamos state de una vez
      if (data.user) {
        user.value = data.user
      } else {
        // Si no vino usuario completo, lo pedimos
        await fetchUser()
      }

    } catch (error) {
      console.error('Error procesando token SSO:', error)
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

  /**
   * Verifica si el usuario tiene un rol específico
   */
  function hasRole(role) {
    if (!user.value) return false
    return user.value.roles && user.value.roles.includes(role)
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
    handleDirectToken,
    logout,
    fetchUser,
    checkAuth,
    can,
    hasRole
  }
})
