import type { PostgrestResponse } from '@supabase/supabase-js'

// Interface para tipagem do cliente
export interface Cliente {
  id: string
  usuario_id: string
  nome: string
  telefone: string
  empresa?: string
  created_at: string
}

// Interface para inserção/atualização de cliente
export interface ClienteInput {
  nome: string
  telefone: string
  empresa?: string
}

export const useClientes = () => {
  const supabase = useSupabaseClient()

  // Estados reativos
  const clientes = ref<Cliente[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Buscar todos os clientes do usuário
  const fetchClientes = async (): Promise<void> => {
    console.log('🔍 Iniciando busca de clientes...')
    
    try {
      // Obter usuário atual do Supabase Auth
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user?.id) {
        console.warn('⚠️ Usuário não está logado:', userError)
        error.value = 'Usuário não está logado'
        return
      }

      console.log('👤 Usuário logado:', user.email)
      isLoading.value = true
      error.value = null

      console.log('📡 Buscando clientes do usuário...')
      const { data, error: clientesError }: PostgrestResponse<Cliente> = await supabase
        .from('clientes')
        .select('*')
        .eq('usuario_id', user.id)
        .order('created_at', { ascending: false })

      console.log('📊 Resultado da busca:', { data, error: clientesError })

      if (clientesError) {
        console.error('❌ Erro ao buscar clientes:', clientesError)
        error.value = `Erro ao carregar clientes: ${clientesError.message}`
        return
      }

      console.log(`✅ ${data?.length || 0} clientes encontrados`)
      clientes.value = data || []
      
    } catch (err) {
      console.error('💥 Erro inesperado ao buscar clientes:', err)
      error.value = 'Erro inesperado ao carregar clientes'
    } finally {
      isLoading.value = false
    }
  }

  // Adicionar novo cliente
  const addCliente = async (clienteData: ClienteInput): Promise<boolean> => {
    console.log('➕ Adicionando novo cliente:', clienteData)

    try {
      // Obter usuário atual
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user?.id) {
        console.warn('⚠️ Usuário não está logado:', userError)
        error.value = 'Usuário não está logado'
        return false
      }

      isLoading.value = true
      error.value = null

      const { data, error: insertError } = await supabase
        .from('clientes')
        .insert([{
          ...clienteData,
          usuario_id: user.id
        }])
        .select()

      if (insertError) {
        console.error('❌ Erro ao adicionar cliente:', insertError)
        error.value = `Erro ao adicionar cliente: ${insertError.message}`
        return false
      }

      console.log('✅ Cliente adicionado com sucesso:', data)
      
      // Recarregar lista de clientes
      await fetchClientes()
      return true
      
    } catch (err) {
      console.error('💥 Erro inesperado ao adicionar cliente:', err)
      error.value = 'Erro inesperado ao adicionar cliente'
      return false
    } finally {
      isLoading.value = false
    }
  }

  // Deletar cliente
  const deleteCliente = async (clienteId: string): Promise<boolean> => {
    console.log('🗑️ Deletando cliente:', clienteId)

    try {
      isLoading.value = true
      error.value = null

      const { error: deleteError } = await supabase
        .from('clientes')
        .delete()
        .eq('id', clienteId)

      if (deleteError) {
        console.error('❌ Erro ao deletar cliente:', deleteError)
        error.value = `Erro ao deletar cliente: ${deleteError.message}`
        return false
      }

      console.log('✅ Cliente deletado com sucesso')
      
      // Recarregar lista de clientes
      await fetchClientes()
      return true
      
    } catch (err) {
      console.error('💥 Erro inesperado ao deletar cliente:', err)
      error.value = 'Erro inesperado ao deletar cliente'
      return false
    } finally {
      isLoading.value = false
    }
  }

  // Limpar erro
  const clearError = (): void => {
    error.value = null
  }

  // Retornar estados e funções reativas (readonly)
  return {
    clientes: readonly(clientes),
    isLoading: readonly(isLoading),
    error: readonly(error),
    fetchClientes,
    addCliente,
    deleteCliente,
    clearError
  }
}
