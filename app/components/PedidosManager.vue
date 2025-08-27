<template>
  <div class="max-w-7xl mx-auto space-y-6">
    <!-- Header com filtros e estatísticas rápidas -->
    <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-foreground">Gestor de Pedidos</h1>
        <p class="text-muted-foreground">Gerencie todos os pedidos em tempo real</p>
      </div>
      
      <div class="flex gap-2">
        <button
          v-for="status in statusFilters"
          :key="status.value"
          @click="activeFilter = status.value"
          :class="[
            'px-4 py-2 rounded-lg text-sm font-medium transition-all',
            activeFilter === status.value
              ? 'bg-primary text-primary-foreground shadow-md'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          ]"
        >
          {{ status.label }}
          <span v-if="getOrderCountByStatus(status.value)" class="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-background/50">
            {{ getOrderCountByStatus(status.value) }}
          </span>
        </button>
      </div>
    </div>

    <!-- Grid de colunas por status (Kanban) -->
    <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <!-- Coluna: Novos Pedidos -->
      <div class="bg-card border border-border rounded-lg">
        <div class="p-4 border-b border-border">
          <h3 class="font-semibold text-foreground flex items-center gap-2">
            <div class="w-3 h-3 bg-blue-500 rounded-full"></div>
            Novos Pedidos
            <span class="ml-auto text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
              {{ getOrdersByStatus('novo').length }}
            </span>
          </h3>
        </div>
        <div class="p-4 space-y-3 max-h-[600px] overflow-y-auto">
          <PedidoCard
            v-for="pedido in getOrdersByStatus('novo')"
            :key="pedido.id"
            :pedido="pedido"
            @view="viewOrder"
            @accept="acceptOrder"
            @print="printOrder"
          />
        </div>
      </div>

      <!-- Coluna: Na Cozinha -->
      <div class="bg-card border border-border rounded-lg">
        <div class="p-4 border-b border-border">
          <h3 class="font-semibold text-foreground flex items-center gap-2">
            <div class="w-3 h-3 bg-orange-500 rounded-full"></div>
            Na Cozinha
            <span class="ml-auto text-sm bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
              {{ getOrdersByStatus('cozinha').length }}
            </span>
          </h3>
        </div>
        <div class="p-4 space-y-3 max-h-[600px] overflow-y-auto">
          <PedidoCard
            v-for="pedido in getOrdersByStatus('cozinha')"
            :key="pedido.id"
            :pedido="pedido"
            @view="viewOrder"
            @ready="markAsReady"
            @print="printOrder"
          />
        </div>
      </div>

      <!-- Coluna: Saiu para Entrega -->
      <div class="bg-card border border-border rounded-lg">
        <div class="p-4 border-b border-border">
          <h3 class="font-semibold text-foreground flex items-center gap-2">
            <div class="w-3 h-3 bg-purple-500 rounded-full"></div>
            Saiu para Entrega
            <span class="ml-auto text-sm bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
              {{ getOrdersByStatus('entrega').length }}
            </span>
          </h3>
        </div>
        <div class="p-4 space-y-3 max-h-[600px] overflow-y-auto">
          <PedidoCard
            v-for="pedido in getOrdersByStatus('entrega')"
            :key="pedido.id"
            :pedido="pedido"
            @view="viewOrder"
            @complete="completeOrder"
            @print="printOrder"
          />
        </div>
      </div>

      <!-- Coluna: Concluídos -->
      <div class="bg-card border border-border rounded-lg">
        <div class="p-4 border-b border-border">
          <h3 class="font-semibold text-foreground flex items-center gap-2">
            <div class="w-3 h-3 bg-green-500 rounded-full"></div>
            Concluídos
            <span class="ml-auto text-sm bg-green-100 text-green-700 px-2 py-1 rounded-full">
              {{ getOrdersByStatus('concluido').length }}
            </span>
          </h3>
        </div>
        <div class="p-4 space-y-3 max-h-[600px] overflow-y-auto">
          <PedidoCard
            v-for="pedido in getOrdersByStatus('concluido')"
            :key="pedido.id"
            :pedido="pedido"
            @view="viewOrder"
            @print="printOrder"
          />
        </div>
      </div>
    </div>

    <!-- Modal de Visualização do Pedido -->
    <PedidoModal
      :isOpen="isModalOpen"
      :pedido="selectedPedido"
      @close="closeModal"
      @print="printOrder"
      @update-status="updateOrderStatus"
    />
  </div>
</template>

<script setup lang="ts">
interface PedidoItem {
  nome: string
  quantidade: number
  preco: number
  observacao?: string
}

interface Pedido {
  id: string
  numero: number
  cliente: string
  telefone: string
  endereco?: string
  items: PedidoItem[]
  total: number
  formaPagamento: 'dinheiro' | 'cartao' | 'pix'
  tipoEntrega: 'retirada' | 'entrega'
  status: 'novo' | 'cozinha' | 'entrega' | 'concluido'
  observacao?: string
  troco?: number
  dataHora: Date
  tempoEstimado?: number
}

// Estados
const activeFilter = ref<string>('todos')
const isModalOpen = ref(false)
const selectedPedido = ref<Pedido | null>(null)

// Filtros de status
const statusFilters = [
  { label: 'Todos', value: 'todos' },
  { label: 'Novos', value: 'novo' },
  { label: 'Cozinha', value: 'cozinha' },
  { label: 'Entrega', value: 'entrega' },
  { label: 'Concluídos', value: 'concluido' }
]

// Mock data - em produção virá do Supabase
const pedidos = ref<Pedido[]>([
  {
    id: '1',
    numero: 1001,
    cliente: 'João Silva',
    telefone: '(11) 99999-9999',
    endereco: 'Rua das Flores, 123',
    items: [
      { nome: 'Pizza Margherita G', quantidade: 1, preco: 35.90 },
      { nome: 'Coca-Cola 2L', quantidade: 2, preco: 8.00 }
    ],
    total: 51.90,
    formaPagamento: 'dinheiro',
    tipoEntrega: 'entrega',
    status: 'novo',
    troco: 60.00,
    dataHora: new Date(),
    tempoEstimado: 30
  },
  {
    id: '2',
    numero: 1002,
    cliente: 'Maria Santos',
    telefone: '(11) 88888-8888',
    items: [
      { nome: 'Hambúrguer Artesanal', quantidade: 2, preco: 25.90 },
      { nome: 'Batata Frita', quantidade: 1, preco: 12.00 }
    ],
    total: 63.80,
    formaPagamento: 'cartao',
    tipoEntrega: 'retirada',
    status: 'cozinha',
    dataHora: new Date(Date.now() - 15 * 60 * 1000),
    tempoEstimado: 25
  },
  {
    id: '3',
    numero: 1003,
    cliente: 'Pedro Costa',
    telefone: '(11) 77777-7777',
    endereco: 'Av. Principal, 456',
    items: [
      { nome: 'Lasanha Bolonhesa', quantidade: 1, preco: 28.90 }
    ],
    total: 28.90,
    formaPagamento: 'pix',
    tipoEntrega: 'entrega',
    status: 'entrega',
    dataHora: new Date(Date.now() - 45 * 60 * 1000),
    tempoEstimado: 20
  }
])

// Computed para filtrar pedidos por status
const getOrdersByStatus = (status: string) => {
  if (status === 'todos') return pedidos.value
  return pedidos.value.filter(pedido => pedido.status === status)
}

// Contar pedidos por status
const getOrderCountByStatus = (status: string) => {
  if (status === 'todos') return pedidos.value.length
  return pedidos.value.filter(pedido => pedido.status === status).length
}

// Ações dos pedidos
const viewOrder = (pedido: Pedido) => {
  selectedPedido.value = pedido
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
  selectedPedido.value = null
}

const acceptOrder = (pedidoId: string) => {
  const pedido = pedidos.value.find(p => p.id === pedidoId)
  if (pedido) {
    pedido.status = 'cozinha'
    // Aqui você adicionaria a lógica para notificar a cozinha
    console.log(`Pedido ${pedido.numero} enviado para cozinha`)
  }
}

const markAsReady = (pedidoId: string) => {
  const pedido = pedidos.value.find(p => p.id === pedidoId)
  if (pedido) {
    pedido.status = pedido.tipoEntrega === 'entrega' ? 'entrega' : 'concluido'
    console.log(`Pedido ${pedido.numero} pronto${pedido.tipoEntrega === 'entrega' ? ' - saiu para entrega' : ' - concluído'}`)
  }
}

const completeOrder = (pedidoId: string) => {
  const pedido = pedidos.value.find(p => p.id === pedidoId)
  if (pedido) {
    pedido.status = 'concluido'
    console.log(`Pedido ${pedido.numero} concluído`)
  }
}

const updateOrderStatus = (pedidoId: string, newStatus: string) => {
  const pedido = pedidos.value.find(p => p.id === pedidoId)
  if (pedido) {
    pedido.status = newStatus as any
  }
}

const printOrder = (pedido: Pedido) => {
  // Implementar impressão térmica
  console.log(`Imprimindo pedido ${pedido.numero}`)
  
  // Aqui você implementaria a lógica de impressão térmica
  // Exemplo de formatação para impressora térmica 80mm
  const printContent = formatForThermalPrint(pedido)
  
  // Para agora, vamos apenas mostrar no console
  console.log(printContent)
  
  // Em produção, você usaria uma biblioteca como:
  // - node-thermal-printer
  // - escpos
  // - ou uma API específica da impressora
}

const formatForThermalPrint = (pedido: Pedido): string => {
  const linha = '----------------------------------------'
  const espacos = (texto: string, tamanho: number) => texto.padEnd(tamanho)
  
  let content = `
${linha}
           RESTAURANTE AGZAP
${linha}
Pedido: #${pedido.numero}
Data: ${pedido.dataHora.toLocaleString('pt-BR')}
Cliente: ${pedido.cliente}
Telefone: ${pedido.telefone}
${pedido.endereco ? `Endereço: ${pedido.endereco}` : 'RETIRADA NO BALCÃO'}
${linha}
ITENS:
`

  pedido.items.forEach(item => {
    content += `${item.quantidade}x ${espacos(item.nome, 20)} R$ ${item.preco.toFixed(2)}\n`
    if (item.observacao) {
      content += `   Obs: ${item.observacao}\n`
    }
  })

  content += `${linha}
TOTAL: R$ ${pedido.total.toFixed(2)}
Pagamento: ${pedido.formaPagamento.toUpperCase()}
${pedido.troco ? `Troco para: R$ ${pedido.troco.toFixed(2)}` : ''}
${pedido.observacao ? `\nObservação: ${pedido.observacao}` : ''}
${linha}
    Obrigado pela preferência!
${linha}
`

  return content
}
</script>
