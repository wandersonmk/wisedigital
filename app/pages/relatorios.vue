<script setup lang="ts">
// Aplica middleware de autenticação
definePageMeta({
  middleware: 'auth',
  layout: 'dashboard'
})

import { useRelatorios } from '../composables/useRelatorios'

const isLoading = ref(true)
const error = ref('')
const isClient = typeof window !== 'undefined'

let relatorios = ref([])
if (isClient) {
  const { relatorios: relatoriosRef, fetchRelatorios } = useRelatorios()
  relatorios = relatoriosRef // usa o ref do composable diretamente
  onMounted(async () => {
    isLoading.value = true
    try {
      await fetchRelatorios()
    } catch (e) {
      error.value = 'Erro ao carregar relatórios.'
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
      title="Carregando Relatórios"
      description="Preparando visão geral dos relatórios..."
    />
    
    <!-- Página de Relatórios quando carregado -->
    <div v-else class="space-y-6">
      <RelatoriosManager v-if="isClient" :relatorios="relatorios" />
      <div v-else class="text-center text-muted-foreground">Carregando...</div>
      <div v-if="error" class="text-red-500 text-center">{{ error }}</div>
    </div>
  </div>
</template>
