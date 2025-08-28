<template>
  <div class="bg-card text-card-foreground rounded-lg border border-border shadow-sm">
    <!-- Header com botões de exportação -->
    <div class="flex items-center justify-between p-6 border-b border-border">
      <div class="flex items-center space-x-2">
        <font-awesome-icon 
          icon="filter" 
          class="w-5 h-5 text-muted-foreground" 
        />
        <span class="text-sm font-medium text-foreground">Filtros e Exportação</span>
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

    <!-- Filtros -->
    <div class="p-6 border-b border-border bg-muted/30">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- Filtro por Data Inicial -->
        <div>
          <label class="block text-sm font-medium text-foreground mb-2">Data Inicial</label>
          <input
            v-model="filtros.dataInicial"
            type="date"
            class="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary date-input-white-icon"
          />
        </div>

        <!-- Filtro por Data Final -->
        <div>
          <label class="block text-sm font-medium text-foreground mb-2">Data Final</label>
          <input
            v-model="filtros.dataFinal"
            type="date"
            class="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary date-input-white-icon"
          />
        </div>

        <!-- Filtro por CNPJ/Nome da Loja -->
        <div>
          <label class="block text-sm font-medium text-foreground mb-2">CNPJ ou Nome da Loja</label>
          <input
            v-model="filtros.lojaOuCnpj"
            type="text"
            placeholder="Digite CNPJ ou nome da loja"
            class="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <!-- Filtro por Empresa/Operadora -->
        <div>
          <label class="block text-sm font-medium text-foreground mb-2">Empresa</label>
          <select
            v-model="filtros.empresa"
            class="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Todas as empresas</option>
            <option value="VIVO">VIVO</option>
            <option value="TIM">TIM</option>
            <option value="CLARO">CLARO</option>
            <option value="OI">OI</option>
          </select>
        </div>
      </div>

      <!-- Botões de ação dos filtros -->
      <div class="flex items-center justify-end mt-4">
        <button
          @click="limparFiltros"
          class="flex items-center space-x-2 px-4 py-2 border border-border text-foreground hover:bg-muted rounded-lg transition-colors text-sm font-medium"
        >
          <font-awesome-icon icon="times-circle" class="w-4 h-4" />
          <span>Limpar Filtros</span>
        </button>
      </div>
    </div>

    <!-- Lista de relatórios -->
    <div class="p-6">
      <!-- Mensagem quando não há relatórios -->
      <div v-if="relatoriosFiltrados.length === 0" class="text-center py-8">
        <div class="flex flex-col items-center">
          <font-awesome-icon 
            icon="file-alt" 
            class="w-12 h-12 text-muted-foreground/50 mb-4" 
          />
          <h3 class="text-lg font-medium text-foreground mb-2">
            {{ filtrosAplicados ? 'Nenhum relatório encontrado' : 'Nenhum relatório disponível' }}
          </h3>
          <p class="text-muted-foreground">
            {{ filtrosAplicados ? 'Tente ajustar os filtros para encontrar relatórios.' : 'Quando houver relatórios de tickets, eles aparecerão aqui.' }}
          </p>
        </div>
      </div>

      <!-- Tabela de relatórios -->
      <div v-else class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-border">
              <th class="text-left py-3 px-4 font-medium text-muted-foreground">Nome</th>
              <th class="text-left py-3 px-4 font-medium text-muted-foreground">Telefone</th>
              <th class="text-left py-3 px-4 font-medium text-muted-foreground">Loja</th>
              <th class="text-left py-3 px-4 font-medium text-muted-foreground">CNPJ</th>
              <th class="text-left py-3 px-4 font-medium text-muted-foreground">Data/Hora</th>
              <th class="text-left py-3 px-4 font-medium text-muted-foreground">Motivo</th>
              <th class="text-left py-3 px-4 font-medium text-muted-foreground">Empresa</th>
            </tr>
          </thead>
          <tbody>
            <tr 
              v-for="relatorio in relatoriosFiltrados" 
              :key="relatorio.id"
              class="border-b border-border/50 hover:bg-muted/30 transition-colors"
            >
              <!-- Nome da pessoa -->
              <td class="py-4 px-4">
                <div class="flex items-center">
                  <div class="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                    <font-awesome-icon icon="user" class="w-4 h-4 text-primary" />
                  </div>
                  <span class="font-medium text-foreground">{{ relatorio.nomePessoa }}</span>
                </div>
              </td>
              
              <!-- Telefone -->
              <td class="py-4 px-4">
                <span class="text-foreground">{{ relatorio.telefone }}</span>
              </td>
              
              <!-- Nome da loja -->
              <td class="py-4 px-4">
                <span class="text-foreground font-medium">{{ relatorio.nomeLoja }}</span>
              </td>
              
              <!-- CNPJ -->
              <td class="py-4 px-4">
                <span class="text-foreground text-sm font-mono">{{ relatorio.cnpj }}</span>
              </td>
              
              <!-- Data e Hora -->
              <td class="py-4 px-4">
                <div class="text-sm">
                  <div class="font-medium text-foreground">{{ relatorio.dataAbertura }}</div>
                  <div class="text-muted-foreground">{{ relatorio.horaAbertura }}</div>
                </div>
              </td>
              
              <!-- Motivo -->
              <td class="py-4 px-4">
                <span class="text-foreground text-sm">{{ relatorio.motivoChamado }}</span>
              </td>
              
              <!-- Empresa -->
              <td class="py-4 px-4">
                <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                      :class="getEmpresaClass(relatorio.empresa)">
                  {{ relatorio.empresa }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Informações de resumo -->
      <div v-if="relatoriosFiltrados.length > 0" class="mt-6 p-4 bg-muted/50 rounded-lg">
        <div class="flex items-center justify-between text-sm text-muted-foreground">
          <span>Total de registros: {{ relatoriosFiltrados.length }}</span>
          <span v-if="filtrosAplicados">Filtros aplicados</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

// Interface para tipagem do relatório
interface Relatorio {
  id: string
  nomePessoa: string
  telefone: string
  nomeLoja: string
  cnpj: string
  dataAbertura: string
  horaAbertura: string
  motivoChamado: string
  empresa: string
}

// Interface para filtros
interface Filtros {
  dataInicial: string
  dataFinal: string
  lojaOuCnpj: string
  empresa: string
}

// Estados reativos
const filtros = ref<Filtros>({
  dataInicial: '',
  dataFinal: '',
  lojaOuCnpj: '',
  empresa: ''
})

// Computed para detectar se há filtros ativos automaticamente
const filtrosAplicados = computed(() => {
  return filtros.value.dataInicial !== '' || 
         filtros.value.dataFinal !== '' || 
         filtros.value.lojaOuCnpj !== '' || 
         filtros.value.empresa !== ''
})

// Dados de exemplo (substituir pela busca real do banco futuramente)
const relatorios = ref<Relatorio[]>([
  {
    id: '1',
    nomePessoa: 'João Silva',
    telefone: '(11) 99999-9999',
    nomeLoja: 'Loja Centro',
    cnpj: '12.345.678/0001-90',
    dataAbertura: '28/08/2025',
    horaAbertura: '09:30',
    motivoChamado: 'Problema na internet',
    empresa: 'VIVO'
  },
  {
    id: '2',
    nomePessoa: 'Maria Santos',
    telefone: '(11) 88888-8888',
    nomeLoja: 'Loja Shopping',
    cnpj: '98.765.432/0001-10',
    dataAbertura: '27/08/2025',
    horaAbertura: '14:15',
    motivoChamado: 'Lentidão no sistema',
    empresa: 'TIM'
  },
  {
    id: '3',
    nomePessoa: 'Pedro Oliveira',
    telefone: '(11) 77777-7777',
    nomeLoja: 'Loja Vila Nova',
    cnpj: '11.222.333/0001-44',
    dataAbertura: '26/08/2025',
    horaAbertura: '16:45',
    motivoChamado: 'Sistema fora do ar',
    empresa: 'CLARO'
  },
  {
    id: '4',
    nomePessoa: 'Ana Costa',
    telefone: '(11) 66666-6666',
    nomeLoja: 'Loja Matriz',
    cnpj: '55.666.777/0001-88',
    dataAbertura: '25/08/2025',
    horaAbertura: '11:20',
    motivoChamado: 'Erro no PDV',
    empresa: 'OI'
  },
  {
    id: '5',
    nomePessoa: 'Carlos Mendes',
    telefone: '(11) 55555-5555',
    nomeLoja: 'Loja Outlet',
    cnpj: '33.444.555/0001-66',
    dataAbertura: '24/08/2025',
    horaAbertura: '08:45',
    motivoChamado: 'Conexão instável',
    empresa: 'VIVO'
  }
])

// Computed para relatórios filtrados
const relatoriosFiltrados = computed(() => {
  let resultado = relatorios.value

  if (filtros.value.dataInicial) {
    resultado = resultado.filter(r => {
      const dataRelatorio = new Date(r.dataAbertura.split('/').reverse().join('-'))
      const dataFiltro = new Date(filtros.value.dataInicial)
      return dataRelatorio >= dataFiltro
    })
  }

  if (filtros.value.dataFinal) {
    resultado = resultado.filter(r => {
      const dataRelatorio = new Date(r.dataAbertura.split('/').reverse().join('-'))
      const dataFiltro = new Date(filtros.value.dataFinal)
      return dataRelatorio <= dataFiltro
    })
  }

  if (filtros.value.lojaOuCnpj) {
    const termo = filtros.value.lojaOuCnpj.toLowerCase()
    resultado = resultado.filter(r => 
      r.nomeLoja.toLowerCase().includes(termo) || 
      r.cnpj.toLowerCase().includes(termo)
    )
  }

  if (filtros.value.empresa) {
    resultado = resultado.filter(r => r.empresa === filtros.value.empresa)
  }

  return resultado
})

// Função para limpar filtros
function limparFiltros() {
  filtros.value = {
    dataInicial: '',
    dataFinal: '',
    lojaOuCnpj: '',
    empresa: ''
  }
  console.log('Filtros limpos - os filtros agora são automáticos!')
}

// Função para obter classes CSS da empresa
function getEmpresaClass(empresa: string) {
  const classes = {
    'VIVO': 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
    'TIM': 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
    'CLARO': 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
    'OI': 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
  }
  return classes[empresa as keyof typeof classes] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
}

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
    
    // Criar documento PDF em formato A4 paisagem
    const doc = new jsPDF('landscape', 'mm', 'a4')
    
    // Configurar fonte para suporte UTF-8
    doc.setFont('helvetica', 'normal')
    
    // Cores do tema
    const primaryColor: [number, number, number] = [79, 70, 229] // Indigo-600
    const textColor: [number, number, number] = [17, 24, 39] // Gray-900
    const lightGray: [number, number, number] = [243, 244, 246] // Gray-100
    
    // Header do documento
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2])
    doc.rect(0, 0, 297, 40, 'F')
    
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
    doc.text('Relatórios de Tickets', 20, 55)
    
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
    doc.setTextColor(107, 114, 128)
    doc.text(`Gerado em: ${dataFormatada}`, 20, 65)
    doc.text(`Total de registros: ${relatoriosFiltrados.value.length}`, 20, 72)
    
    // Preparar dados para a tabela
    const tableData = relatoriosFiltrados.value.map((relatorio, index) => [
      (index + 1).toString(),
      relatorio.nomePessoa,
      relatorio.telefone,
      relatorio.nomeLoja,
      relatorio.cnpj,
      `${relatorio.dataAbertura} ${relatorio.horaAbertura}`,
      relatorio.motivoChamado,
      relatorio.empresa
    ])
    
    // Configurar tabela
    autoTable(doc, {
      head: [['#', 'Nome', 'Telefone', 'Loja', 'CNPJ', 'Data/Hora', 'Motivo', 'Empresa']],
      body: tableData,
      startY: 85,
      theme: 'grid',
      styles: {
        font: 'helvetica',
        fontSize: 8,
        cellPadding: 3,
        textColor: textColor,
        lineColor: [209, 213, 219],
        lineWidth: 0.5
      },
      headStyles: {
        fillColor: primaryColor,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 9
      },
      alternateRowStyles: {
        fillColor: lightGray
      },
      columnStyles: {
        0: { cellWidth: 10, halign: 'center' }, // #
        1: { cellWidth: 35 }, // Nome
        2: { cellWidth: 30 }, // Telefone
        3: { cellWidth: 35 }, // Loja
        4: { cellWidth: 35 }, // CNPJ
        5: { cellWidth: 35 }, // Data/Hora
        6: { cellWidth: 60 }, // Motivo
        7: { cellWidth: 20 } // Empresa
      },
      margin: { left: 15, right: 15 }
    })
    
    // Footer
    const pageCount = doc.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      
      // Linha do footer
      doc.setDrawColor(209, 213, 219)
      doc.line(15, 200, 282, 200)
      
      // Texto do footer
      doc.setFontSize(8)
      doc.setTextColor(107, 114, 128)
      doc.text('Wise Digital - Sistema de Relatórios', 15, 208)
      doc.text(`Página ${i} de ${pageCount}`, 282, 208, { align: 'right' })
    }
    
    // Salvar o arquivo
    const nomeArquivo = `relatorios_tickets_${agora.toISOString().split('T')[0]}.pdf`
    doc.save(nomeArquivo)
    
    console.log('PDF de relatórios exportado com sucesso!')
    
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
      ['Relatórios de Tickets'],
      [`Gerado em: ${dataFormatada}`],
      [`Total de registros: ${relatoriosFiltrados.value.length}`],
      [], // Linha vazia
      // Cabeçalho da tabela
      ['#', 'Nome', 'Telefone', 'Loja', 'CNPJ', 'Data Abertura', 'Hora Abertura', 'Motivo', 'Empresa']
    ]
    
    // Adicionar dados dos relatórios
    relatoriosFiltrados.value.forEach((relatorio, index) => {
      dadosCompletos.push([
        (index + 1).toString(),
        relatorio.nomePessoa,
        relatorio.telefone,
        relatorio.nomeLoja,
        relatorio.cnpj,
        relatorio.dataAbertura,
        relatorio.horaAbertura,
        relatorio.motivoChamado,
        relatorio.empresa
      ])
    })
    
    // Criar workbook e worksheet
    const workbook = XLSX.utils.book_new()
    const worksheet = XLSX.utils.aoa_to_sheet(dadosCompletos)
    
    // Configurar largura das colunas
    const columnWidths = [
      { wch: 5 },  // #
      { wch: 25 }, // Nome
      { wch: 18 }, // Telefone
      { wch: 25 }, // Loja
      { wch: 20 }, // CNPJ
      { wch: 15 }, // Data
      { wch: 10 }, // Hora
      { wch: 40 }, // Motivo
      { wch: 12 }  // Empresa
    ]
    worksheet['!cols'] = columnWidths
    
    // Mesclar células do cabeçalho
    worksheet['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 8 } }, // Título principal
      { s: { r: 1, c: 0 }, e: { r: 1, c: 8 } }, // Subtítulo
      { s: { r: 2, c: 0 }, e: { r: 2, c: 8 } }, // Data
      { s: { r: 3, c: 0 }, e: { r: 3, c: 8 } }, // Total
    ]
    
    // Estilizar células específicas
    if (worksheet['A1']) {
      worksheet['A1'].s = {
        font: { bold: true, size: 14, color: { rgb: "4F46E5" } },
        alignment: { horizontal: "center" }
      }
    }
    
    if (worksheet['A2']) {
      worksheet['A2'].s = {
        font: { bold: true, size: 12 },
        alignment: { horizontal: "center" }
      }
    }
    
    // Estilizar cabeçalho da tabela (linha 6)
    for (let col = 0; col < 9; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 5, c: col })
      if (worksheet[cellAddress]) {
        worksheet[cellAddress].s = {
          font: { bold: true, color: { rgb: "FFFFFF" } },
          fill: { fgColor: { rgb: "4F46E5" } },
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
    
    // Adicionar worksheet ao workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Relatórios')
    
    // Salvar o arquivo
    const nomeArquivo = `relatorios_tickets_${agora.toISOString().split('T')[0]}.xlsx`
    XLSX.writeFile(workbook, nomeArquivo)
    
    console.log('Excel de relatórios exportado com sucesso!')
    
  } catch (error) {
    console.error('Erro ao exportar Excel:', error)
    alert('Erro ao gerar o arquivo Excel. Tente novamente.')
  }
}
</script>

<style scoped>
/* Estilizar o ícone do calendário para ficar branco */
.date-input-white-icon::-webkit-calendar-picker-indicator {
  filter: invert(1);
  cursor: pointer;
}

/* Para Firefox */
.date-input-white-icon::-moz-calendar-picker-indicator {
  filter: invert(1);
  cursor: pointer;
}

/* Para Edge/IE */
.date-input-white-icon::-ms-calendar-picker-indicator {
  filter: invert(1);
  cursor: pointer;
}
</style>
