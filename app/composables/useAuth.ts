// Composable simples de autenticação
export function useAuth() {
  // Estados básicos
  const user = ref(null)
  const session = ref(null)
  const isLoading = ref(false)
  const errorMessage = ref(null)

  // Computed para verificar se está autenticado
  const isAuthenticated = computed(() => !!user.value)

  // Funções básicas
  const signInWithEmailAndPassword = async () => false
  const signUp = async () => false
  const signOut = async () => {}
  const reloadSession = async () => {}
  const clearError = () => { errorMessage.value = null }

  return {
    user: readonly(user),
    session: readonly(session),
    isAuthenticated: readonly(isAuthenticated),
    isLoading: readonly(isLoading),
    errorMessage: readonly(errorMessage),
    signInWithEmailAndPassword,
    signUp,
    signOut,
    reloadSession,
    clearError
  }
}