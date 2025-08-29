<script setup lang="ts">
// Aplica middleware de autenticação
definePageMeta({
  middleware: 'auth',
  layout: 'dashboard'
})

import { useClientes } from '../composables/useClientes'

const isLoading = ref(true)
const error = ref('')
const isClient = typeof window !== 'undefined'

let clientes = ref([])
if (isClient) {
  const { clientes: clientesRef, fetchClientes } = useClientes()
  clientes = clientesRef // usa o ref do composable diretamente
  onMounted(async () => {
    isLoading.value = true
    try {
      await fetchClientes()
    } catch (e) {
      error.value = 'Erro ao carregar clientes.'
    }
    isLoading.value = false
  })
} else {
  isLoading.value = false
}
</script>

<template>
  <div>
    <!-- Loading padronizado igual ao dashboard -->
    <AppLoading 
      v-if="isLoading" 
      title="Carregando Clientes"
      description="Preparando visão geral dos clientes..."
    />
    
    <!-- Página de Clientes quando carregado -->
    <div v-else class="space-y-6">
      <ClientesManager v-if="isClient" :clientes="clientes" />
      <div v-else class="text-center text-muted-foreground">Carregando...</div>
      <div v-if="error" class="text-red-500 text-center">{{ error }}</div>
    </div>
  </div>
</template>
