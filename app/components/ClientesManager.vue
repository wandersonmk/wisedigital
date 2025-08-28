<template>
  <div class="bg-card text-card-foreground rounded-lg border border-border shadow-sm">
    <!-- Header com título e botões de exportação -->
    <div class="flex items-center justify-between p-6 border-b border-border">
      <div>
        <h2 class="text-xl font-semibold text-foreground">Lista de Clientes</h2>
        <p class="text-sm text-muted-foreground mt-1">Gerencie todos os seus clientes</p>
      </div>
      
      <!-- Botões de exportação -->
      <div class="flex items-center space-x-2">
        <button
          @click="exportToPDF"
          class="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm font-medium"
          title="Exportar para PDF"
        >
          <font-awesome-icon icon="file-pdf" class="w-4 h-4" />
          <span>PDF</span>
        </button>
        
        <button
          @click="exportToExcel"
          class="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm font-medium"
          title="Exportar para Excel"
        >
          <font-awesome-icon icon="file-excel" class="w-4 h-4" />
          <span>Excel</span>
        </button>
      </div>
    </div>

    <!-- Lista de clientes -->
    <div class="p-6">
      <!-- Mensagem quando não há clientes -->
      <div v-if="clientes.length === 0" class="text-center py-8">
        <div class="flex flex-col items-center">
          <font-awesome-icon 
            icon="users" 
            class="w-12 h-12 text-muted-foreground/50 mb-4" 
          />
          <h3 class="text-lg font-medium text-foreground mb-2">Nenhum cliente encontrado</h3>
          <p class="text-muted-foreground">Quando você tiver clientes, eles aparecerão aqui.</p>
        </div>
      </div>

      <!-- Tabela de clientes -->
      <div v-else class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-border">
              <th class="text-left py-3 px-4 font-medium text-muted-foreground">Nome</th>
              <th class="text-left py-3 px-4 font-medium text-muted-foreground">Telefone</th>
              <th class="text-left py-3 px-4 font-medium text-muted-foreground">Empresa</th>
              <th class="text-right py-3 px-4 font-medium text-muted-foreground">Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr 
              v-for="cliente in clientes" 
              :key="cliente.id"
              class="border-b border-border/50 hover:bg-muted/30 transition-colors"
            >
              <!-- Nome do cliente -->
              <td class="py-4 px-4">
                <div class="flex items-center">
                  <div class="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                    <font-awesome-icon icon="user" class="w-4 h-4 text-primary" />
                  </div>
                  <span class="font-medium text-foreground">{{ cliente.nome }}</span>
                </div>
              </td>
              
              <!-- Telefone do cliente -->
              <td class="py-4 px-4">
                <span class="text-foreground">{{ cliente.telefone }}</span>
              </td>
              
              <!-- Empresa do cliente -->
              <td class="py-4 px-4">
                <span class="text-foreground font-medium">{{ cliente.empresa }}</span>
              </td>
              
              <!-- Botões de ação -->
              <td class="py-4 px-4 text-right">
                <div class="flex items-center justify-end space-x-2">
                  <!-- Botão WhatsApp -->
                  <button
                    @click="abrirWhatsApp(cliente)"
                    class="p-2 text-green-500 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-all duration-200 group"
                    title="Conversar no WhatsApp"
                  >
                    <font-awesome-icon 
                      icon="comments" 
                      class="w-4 h-4 group-hover:scale-110 transition-transform duration-200" 
                    />
                  </button>
                  
                  <!-- Botão de excluir -->
                  <button
                    @click="confirmarExclusao(cliente)"
                    class="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200 group"
                    title="Excluir cliente"
                  >
                    <font-awesome-icon 
                      icon="trash" 
                      class="w-4 h-4 group-hover:scale-110 transition-transform duration-200" 
                    />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal de confirmação de exclusão -->
    <div 
      v-if="clienteParaExcluir"
      class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
    >
      <div class="bg-card rounded-lg shadow-xl max-w-md w-full p-6 border border-border">
        <div class="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 dark:bg-red-900/20 rounded-full">
          <font-awesome-icon icon="exclamation-triangle" class="w-6 h-6 text-red-600" />
        </div>
        
        <h3 class="text-lg font-semibold text-foreground text-center mb-2">
          Confirmar exclusão
        </h3>
        
        <p class="text-muted-foreground text-center mb-6">
          Tem certeza que deseja excluir o cliente 
          <strong class="text-foreground">{{ clienteParaExcluir.nome }}</strong>?
          <br>
          Esta ação não pode ser desfeita.
        </p>
        
        <div class="flex space-x-3">
          <button
            @click="cancelarExclusao"
            class="flex-1 px-4 py-2 border border-border rounded-lg text-foreground hover:bg-muted transition-colors"
          >
            Cancelar
          </button>
          <button
            @click="excluirCliente"
            class="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            Excluir
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// Interface para tipagem do cliente
interface Cliente {
  id: string
  nome: string
  telefone: string
  empresa: string
}

// Estado reativo
const clienteParaExcluir = ref<Cliente | null>(null)

// Dados de exemplo (substituir pela busca real do banco futuramente)
const clientes = ref<Cliente[]>([
  {
    id: '1',
    nome: 'João Silva',
    telefone: '(11) 99999-9999',
    empresa: 'VIVO'
  },
  {
    id: '2',
    nome: 'Maria Santos',
    telefone: '(11) 88888-8888',
    empresa: 'TIM'
  },
  {
    id: '3',
    nome: 'Pedro Oliveira',
    telefone: '(11) 77777-7777',
    empresa: 'CLARO'
  },
  {
    id: '4',
    nome: 'Ana Costa',
    telefone: '(11) 66666-6666',
    empresa: 'OI'
  }
])

// Função para exportar para PDF
function exportToPDF() {
  console.log('Exportando para PDF...')
  // TODO: Implementar exportação para PDF
}

// Função para exportar para Excel
function exportToExcel() {
  console.log('Exportando para Excel...')
  // TODO: Implementar exportação para Excel
}

// Função para abrir WhatsApp
function abrirWhatsApp(cliente: Cliente) {
  // Remove caracteres especiais do telefone
  const telefone = cliente.telefone.replace(/\D/g, '')
  
  // Mensagem simples: Olá + nome do cliente
  const mensagem = `Olá ${cliente.nome}`
  
  // Cria URL do WhatsApp
  const whatsappUrl = `https://wa.me/55${telefone}?text=${encodeURIComponent(mensagem)}`
  
  // Abre em nova aba
  window.open(whatsappUrl, '_blank')
}

// Função para confirmar exclusão
function confirmarExclusao(cliente: Cliente) {
  clienteParaExcluir.value = cliente
}

// Função para cancelar exclusão
function cancelarExclusao() {
  clienteParaExcluir.value = null
}

// Função para excluir cliente
function excluirCliente() {
  if (clienteParaExcluir.value) {
    console.log('Excluindo cliente:', clienteParaExcluir.value.nome)
    // TODO: Implementar exclusão no banco de dados
    
    // Por enquanto, apenas remove da lista local
    const index = clientes.value.findIndex(c => c.id === clienteParaExcluir.value!.id)
    if (index > -1) {
      clientes.value.splice(index, 1)
    }
    
    clienteParaExcluir.value = null
  }
}
</script>
