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
async function exportToPDF() {
  // Verificar se estamos no cliente
  if (typeof window === 'undefined') {
    console.warn('Exportação PDF só funciona no cliente')
    return
  }

  try {
    // Importação dinâmica para evitar problemas com SSR
    const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
      import('jspdf'),
      import('jspdf-autotable')
    ])
    
    // Criar documento PDF em formato A4
    const doc = new jsPDF('portrait', 'mm', 'a4')
    
    // Configurar fonte para suporte UTF-8
    doc.setFont('helvetica', 'normal')
    
    // Cores do tema (como tuplas para TypeScript)
    const primaryColor: [number, number, number] = [79, 70, 229] // Indigo-600
    const textColor: [number, number, number] = [17, 24, 39] // Gray-900
    const lightGray: [number, number, number] = [243, 244, 246] // Gray-100
    
    // Header do documento
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2])
    doc.rect(0, 0, 210, 40, 'F')
    
    // Logo/Título
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(24)
    doc.setFont('helvetica', 'bold')
    doc.text('Wise Digital', 20, 20)
    
    doc.setFontSize(14)
    doc.setFont('helvetica', 'normal')
    doc.text('Sistema de Relatórios', 20, 30)
    
    // Informações do relatório
    doc.setTextColor(textColor[0], textColor[1], textColor[2])
    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    doc.text('Lista de Clientes', 20, 55)
    
    // Data de geração
    const agora = new Date()
    const dataFormatada = agora.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
    
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(107, 114, 128) // Gray-500
    doc.text(`Gerado em: ${dataFormatada}`, 20, 65)
    doc.text(`Total de clientes: ${clientes.value.length}`, 20, 72)
    
    // Preparar dados para a tabela
    const tableData = clientes.value.map((cliente, index) => [
      (index + 1).toString(),
      cliente.nome,
      cliente.telefone,
      cliente.empresa
    ])
    
    // Configurar tabela com autoTable
    autoTable(doc, {
      head: [['#', 'Nome', 'Telefone', 'Empresa']],
      body: tableData,
      startY: 85,
      theme: 'grid',
      styles: {
        font: 'helvetica',
        fontSize: 10,
        cellPadding: 5,
        textColor: textColor,
        lineColor: [209, 213, 219], // Gray-300
        lineWidth: 0.5
      },
      headStyles: {
        fillColor: primaryColor,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 11
      },
      alternateRowStyles: {
        fillColor: lightGray
      },
      columnStyles: {
        0: { cellWidth: 15, halign: 'center' }, // Número
        1: { cellWidth: 60 }, // Nome
        2: { cellWidth: 45 }, // Telefone
        3: { cellWidth: 35 } // Empresa
      },
      margin: { left: 20, right: 20 }
    })
    
    // Footer
    const pageCount = doc.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      
      // Linha do footer
      doc.setDrawColor(209, 213, 219)
      doc.line(20, 280, 190, 280)
      
      // Texto do footer
      doc.setFontSize(8)
      doc.setTextColor(107, 114, 128)
      doc.text('Wise Digital - Sistema de Relatórios', 20, 288)
      doc.text(`Página ${i} de ${pageCount}`, 190, 288, { align: 'right' })
    }
    
    // Salvar o arquivo
    const nomeArquivo = `clientes_${agora.toISOString().split('T')[0]}.pdf`
    doc.save(nomeArquivo)
    
    console.log('PDF exportado com sucesso!')
    
  } catch (error) {
    console.error('Erro ao exportar PDF:', error)
    alert('Erro ao gerar o PDF. Tente novamente.')
  }
}

// Função para exportar para Excel
async function exportToExcel() {
  // Verificar se estamos no cliente
  if (typeof window === 'undefined') {
    console.warn('Exportação Excel só funciona no cliente')
    return
  }

  try {
    // Importação dinâmica para evitar problemas com SSR
    const XLSX = await import('xlsx')
    
    // Data de geração
    const agora = new Date()
    const dataFormatada = agora.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
    
    // Preparar dados completos para o Excel
    const dadosCompletos = [
      // Informações do cabeçalho
      ['Wise Digital - Sistema de Relatórios'],
      ['Lista de Clientes'],
      [`Gerado em: ${dataFormatada}`],
      [`Total de clientes: ${clientes.value.length}`],
      [], // Linha vazia
      // Cabeçalho da tabela
      ['#', 'Nome', 'Telefone', 'Empresa']
    ]
    
    // Adicionar dados dos clientes
    clientes.value.forEach((cliente, index) => {
      dadosCompletos.push([
        (index + 1).toString(),
        cliente.nome,
        cliente.telefone,
        cliente.empresa
      ])
    })
    
    // Criar workbook e worksheet
    const workbook = XLSX.utils.book_new()
    const worksheet = XLSX.utils.aoa_to_sheet(dadosCompletos)
    
    // Configurar largura das colunas
    const columnWidths = [
      { wch: 5 },  // # (número)
      { wch: 25 }, // Nome
      { wch: 18 }, // Telefone
      { wch: 15 }  // Empresa
    ]
    worksheet['!cols'] = columnWidths
    
    // Mesclar células do cabeçalho
    worksheet['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 3 } }, // Título principal
      { s: { r: 1, c: 0 }, e: { r: 1, c: 3 } }, // Subtítulo
      { s: { r: 2, c: 0 }, e: { r: 2, c: 3 } }, // Data
      { s: { r: 3, c: 0 }, e: { r: 3, c: 3 } }, // Total
    ]
    
    // Estilizar células específicas (título, cabeçalho da tabela)
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1')
    
    // Estilo do título principal (linha 1)
    if (worksheet['A1']) {
      worksheet['A1'].s = {
        font: { bold: true, size: 14, color: { rgb: "4F46E5" } },
        alignment: { horizontal: "center" }
      }
    }
    
    // Estilo do subtítulo (linha 2)
    if (worksheet['A2']) {
      worksheet['A2'].s = {
        font: { bold: true, size: 12 },
        alignment: { horizontal: "center" }
      }
    }
    
    // Estilizar cabeçalho da tabela (linha 6 - índice 5)
    for (let col = 0; col < 4; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 5, c: col })
      if (worksheet[cellAddress]) {
        worksheet[cellAddress].s = {
          font: { bold: true, color: { rgb: "FFFFFF" } },
          fill: { fgColor: { rgb: "4F46E5" } }, // Indigo-600
          alignment: { horizontal: "center" },
          border: {
            top: { style: "thin", color: { rgb: "000000" } },
            bottom: { style: "thin", color: { rgb: "000000" } },
            left: { style: "thin", color: { rgb: "000000" } },
            right: { style: "thin", color: { rgb: "000000" } }
          }
        }
      }
    }
    
    // Estilizar dados da tabela (a partir da linha 7)
    for (let row = 6; row < dadosCompletos.length; row++) {
      for (let col = 0; col < 4; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: row, c: col })
        if (worksheet[cellAddress]) {
          worksheet[cellAddress].s = {
            border: {
              top: { style: "thin", color: { rgb: "CCCCCC" } },
              bottom: { style: "thin", color: { rgb: "CCCCCC" } },
              left: { style: "thin", color: { rgb: "CCCCCC" } },
              right: { style: "thin", color: { rgb: "CCCCCC" } }
            },
            alignment: { horizontal: col === 0 ? "center" : "left" } // Centralizar apenas o número
          }
        }
      }
    }
    
    // Adicionar worksheet ao workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Clientes')
    
    // Salvar o arquivo
    const nomeArquivo = `clientes_${agora.toISOString().split('T')[0]}.xlsx`
    XLSX.writeFile(workbook, nomeArquivo)
    
    console.log('Excel exportado com sucesso!')
    
  } catch (error) {
    console.error('Erro ao exportar Excel:', error)
    alert('Erro ao gerar o arquivo Excel. Tente novamente.')
  }
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
