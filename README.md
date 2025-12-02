# PSE-Image - Problem-Solving Environment para Processamento de Imagens

Sistema de processamento de imagens baseado em fluxo visual, desenvolvido como trabalho da disciplina de Processamento de Imagens.

## 🎯 Características

- **Interface Gráfica Moderna**: React + TypeScript + Shadcn/UI com suporte a tema claro/escuro
- **Fluxo Visual**: Baseado em blocos (nodes) interconectados com React Flow
- **Processamento RAW e Formatos Comuns**: Suporta RAW (8 bits/pixel) e formatos JPG, PNG, BMP, etc.
- **Implementação Matemática Manual**: Sem uso de métodos prontos (cv2.filter2D, sorted(), etc.)
- **Type-Safe**: TypeScript end-to-end
- **Arquitetura Modular**: Backend Python (FastAPI) + Frontend React com arquitetura baseada em features

## 📦 Blocos Implementados

### 1. Blocos de Interface
- **📁 Leitura RAW**: Carrega arquivos .raw ou formatos comuns (JPG, PNG, BMP, etc.)
  - Formatos comuns: dimensões extraídas automaticamente e convertidas para escala de cinza
  - Formato RAW: dimensões configuráveis manualmente
- **👁️ Exibição**: Visualiza a imagem em qualquer ponto do fluxo (suporta encadeamento)
- **💾 Gravação RAW**: Salva o resultado como arquivo .raw

### 2. Blocos de Processamento

#### Convolução (🔲)
- Kernel parametrizável com **tamanhos dinâmicos** (3×3, 5×5, 7×7, 9×9)
- **Máscaras predefinidas**:
  - **Média**: Tamanho configurável (3×3 a 9×9)
  - **Laplaciano**: Tamanho configurável com padrão adaptativo (4-vizinhos para 3×3, cruz para maiores)
  - **Mediana**: Filtro não-linear implementado manualmente com insertion sort
- Divisor configurável
- **Implementação 100% manual**: Loops duplos pixel por pixel, sem uso de métodos prontos

#### Filtro de Mediana (🔲)
- **Implementação Manual Completa**:
  - Coleta de pixels da janela de forma manual
  - Ordenação por **Insertion Sort** implementado do zero
  - Seleção do valor central (mediana)
- Tamanho de janela configurável (3×3, 5×5, 7×7, 9×9)
- Ideal para remoção de ruído sal-e-pimenta

#### Operação Pontual (✨)
- **Brilho**: Ajuste aditivo (-255 a +255)
- **Limiarização**: Binarização (0 a 255)

### 3. Blocos de Análise
- **📊 Histograma**: Visualização da distribuição de intensidades (0-255)
- **➖ Diferença**: Calcula diferença absoluta entre duas imagens

## 🗂️ Estrutura do Projeto

```
pse_image/
├── backend/                           # API Python (FastAPI)
│   ├── main.py                       # Servidor FastAPI com suporte a múltiplos formatos
│   ├── processor.py                  # Lógica de processamento matemático manual
│   ├── models.py                     # Modelos de dados (Pydantic)
│   ├── requirements.txt              # Dependências Python (inclui Pillow)
│   ├── create_test_images.py         # Script para criar imagens de teste
│   └── test_images/                  # Imagens de teste em formato RAW
│       ├── gradient_*.raw
│       ├── checkerboard_*.raw
│       ├── circle_*.raw
│       └── noise_*.raw
│
└── frontend/                          # Interface React + TypeScript
    ├── src/
    │   ├── components/ui/            # Componentes Shadcn
    │   │   ├── button.tsx
    │   │   ├── input.tsx
    │   │   ├── label.tsx
    │   │   └── select.tsx
    │   ├── features/                 # Arquitetura baseada em features
    │   │   ├── canvas/              # Canvas React Flow
    │   │   │   └── components/FlowCanvas.tsx
    │   │   ├── graph/               # Lógica de processamento do grafo
    │   │   │   └── hooks/
    │   │   │       ├── useGraphState.ts
    │   │   │       └── useGraphProcessor.ts
    │   │   ├── nodes/               # Custom Nodes do React Flow
    │   │   │   ├── components/
    │   │   │   │   ├── RawReaderNode.tsx
    │   │   │   │   ├── ConvolutionNode.tsx
    │   │   │   │   ├── PointOpNode.tsx
    │   │   │   │   ├── DisplayNode.tsx
    │   │   │   │   ├── HistogramNode.tsx
    │   │   │   │   ├── DifferenceNode.tsx
    │   │   │   │   └── SaveNode.tsx
    │   │   │   └── types/nodeTypes.ts
    │   │   ├── theme/               # Sistema de temas claro/escuro
    │   │   │   ├── components/
    │   │   │   │   ├── ThemeProvider.tsx
    │   │   │   │   └── ThemeToggle.tsx
    │   │   │   ├── context/ThemeContext.tsx
    │   │   │   └── hooks/useTheme.ts
    │   │   └── toolbar/             # Barra de ferramentas
    │   │       └── components/
    │   │           ├── Toolbar.tsx
    │   │           └── NodeButton.tsx
    │   ├── lib/
    │   │   ├── api.ts                # Comunicação com backend
    │   │   └── utils.ts              # Utilitários
    │   ├── types/
    │   │   └── index.ts              # Tipos TypeScript + geração dinâmica de kernels
    │   ├── styles/
    │   │   └── global.css            # Estilos globais + variáveis de tema
    │   ├── App.tsx                   # Componente principal
    │   └── main.tsx
    ├── package.json
    ├── tsconfig.json
    └── tailwind.config.js
```

## 🚀 Instalação e Execução

### Pré-requisitos
- Python 3.8+
- Node.js 18+
- npm ou yarn

### Backend (Python)

```bash
cd backend

# Criar ambiente virtual (recomendado)
python -m venv venv

# Ativar ambiente virtual
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Instalar dependências
pip install -r requirements.txt

# Executar servidor
python main.py
```

Backend disponível em: **http://localhost:8000**

### Frontend (React + TypeScript)

```bash
cd frontend

# Instalar dependências
npm install

# Executar em modo desenvolvimento
npm run dev
```

Frontend disponível em: **http://localhost:5173**

## 📖 Como Usar

1. **Adicionar Blocos**: Clique nos botões na toolbar para adicionar blocos ao workspace
2. **Conectar Blocos**: Arraste das portas de saída (●direita) para as portas de entrada (●esquerda)
3. **Configurar Parâmetros**: Cada bloco possui controles para ajustar seus parâmetros
4. **Carregar Imagem**: Use o bloco "📁 Leitura RAW"
   - **Formatos comuns** (JPG, PNG, BMP): Basta selecionar o arquivo
   - **Formato RAW**: Configure largura e altura antes de selecionar
5. **Processar**: Clique em "▶ Processar" para executar o fluxo
6. **Visualizar**: Use blocos "👁️ Exibir" para visualizar resultados intermediários
7. **Salvar**: Use o bloco "💾 Salvar" para exportar o resultado
8. **Tema**: Alterne entre tema claro/escuro usando o botão na toolbar

## 💡 Exemplos de Fluxo

### Exemplo 1: Aplicar Filtro de Mediana (Remover Ruído)
```
[📁 Leitura RAW] → [🔲 Convolução (Mediana 3x3)] → [👁️ Exibir]
```

### Exemplo 2: Comparar Original vs Processado
```
[📁 Leitura RAW] ──┬→ [👁️ Exibir Original]
                    └→ [🔲 Convolução (Média)] → [👁️ Exibir Processado]
```

### Exemplo 3: Pipeline Completo de Processamento
```
[📁 Leitura RAW] → [✨ Brilho +50] → [🔲 Média 5x5] ──┬→ [👁️ Exibir]
                                                        ├→ [📊 Histograma]
                                                        └→ [💾 Salvar]
```

### Exemplo 4: Detecção de Bordas com Laplaciano
```
[📁 Leitura RAW] → [🔲 Média 3x3] → [🔲 Laplaciano] → [👁️ Exibir Bordas]
```

### Exemplo 5: Diferença entre Original e Suavizada
```
[📁 Leitura RAW] ──┬→ [🔲 Média 5x5] → Img Suavizada ──┐
                    └───────────────────────────────────┴→ [➖ Diferença] → [👁️ Exibir]
```

### Exemplo 6: Comparação Média vs Mediana
```
                    ┌→ [🔲 Média 3x3] → [👁️ Exibir Média]
[📁 Leitura RAW] ──┤
                    └→ [🔲 Mediana 3x3] → [👁️ Exibir Mediana]
```

## 🔬 Implementação Matemática (Sem Métodos Prontos)

### Convolução Manual
```python
for y in range(height):
    for x in range(width):
        accumulator = 0
        for ky in range(-radius, radius + 1):
            yy = y + ky
            if yy < 0 or yy >= height:
                continue
            for kx in range(-radius, radius + 1):
                xx = x + kx
                if xx < 0 or xx >= width:
                    continue
                
                kernel_value = kernel[ky + radius][kx + radius]
                pixel_value = pixels[yy * width + xx]
                accumulator += kernel_value * pixel_value
        
        result = int(accumulator / divisor) if divisor != 0 else 0
        output[y * width + x] = max(0, min(255, result))
```

### Filtro de Mediana Manual (com Insertion Sort)
```python
def insertion_sort(arr):
    """Implementação manual de insertion sort"""
    sorted_arr = arr[:]
    for i in range(1, len(sorted_arr)):
        key = sorted_arr[i]
        j = i - 1
        while j >= 0 and sorted_arr[j] > key:
            sorted_arr[j + 1] = sorted_arr[j]
            j -= 1
        sorted_arr[j + 1] = key
    return sorted_arr

def process_median(pixels, width, height, window_size):
    """Filtro de mediana manual"""
    output = [0] * (width * height)
    radius = (window_size - 1) // 2
    
    for y in range(height):
        for x in range(width):
            # Coletar pixels da janela
            window_pixels = []
            for ky in range(-radius, radius + 1):
                yy = y + ky
                if yy < 0 or yy >= height:
                    continue
                for kx in range(-radius, radius + 1):
                    xx = x + kx
                    if xx < 0 or xx >= width:
                        continue
                    window_pixels.append(pixels[yy * width + xx])
            
            # Ordenar manualmente
            sorted_pixels = insertion_sort(window_pixels)
            
            # Pegar valor mediano
            median_index = len(sorted_pixels) // 2
            output[y * width + x] = sorted_pixels[median_index]
    
    return output
```

### Operações Pontuais
```python
# Brilho
output[i] = max(0, min(255, pixels[i] + brightness))

# Limiarização
output[i] = 255 if pixels[i] >= threshold else 0
```

### Histograma
```python
histogram = [0] * 256
for pixel in pixels:
    histogram[pixel] += 1
```

### Diferença Absoluta
```python
for i in range(len(pixels1)):
    output[i] = abs(pixels1[i] - pixels2[i])
```

### Geração Dinâmica de Kernels

#### Kernel Média (Qualquer Tamanho)
```typescript
function generateAverageKernel(size: number) {
  const kernel = Array(size).fill(0).map(() => Array(size).fill(1))
  return {
    kernel,
    divisor: size * size
  }
}
```

#### Kernel Laplaciano (Qualquer Tamanho)
```typescript
function generateLaplacianKernel(size: number) {
  const kernel = Array(size).fill(0).map(() => Array(size).fill(-1))
  const center = Math.floor(size / 2)
  
  if (size === 3) {
    // Laplaciano 4-vizinhos clássico
    kernel[0][0] = 0
    kernel[0][2] = 0
    kernel[2][0] = 0
    kernel[2][2] = 0
    kernel[center][center] = 4
  } else {
    // Padrão cruz para tamanhos maiores
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        if (i !== center && j !== center) {
          kernel[i][j] = 0
        } else if (i === center && j === center) {
          kernel[i][j] = (size - 1) * 2
        } else {
          kernel[i][j] = -1
        }
      }
    }
  }
  
  return { kernel, divisor: 1 }
}
```

## 🛠️ Tecnologias Utilizadas

### Backend
- **FastAPI**: Framework web moderno e rápido
- **Pydantic**: Validação de dados e tipos
- **Uvicorn**: Servidor ASGI de alta performance
- **Pillow**: Conversão de formatos de imagem comuns para escala de cinza

### Frontend
- **React 18**: Biblioteca UI moderna com hooks customizados
- **TypeScript**: Type safety end-to-end
- **Vite**: Build tool extremamente rápido
- **React Flow**: Biblioteca para grafos interativos
- **Shadcn/UI**: Componentes UI modernos e acessíveis
- **Radix UI**: Componentes primitivos acessíveis (Dialog, Select, Toast, etc.)
- **Tailwind CSS**: Utility-first CSS framework com suporte a temas
- **Lucide React**: Ícones modernos
- **Axios**: Cliente HTTP

### Arquitetura Frontend
- **Feature-Based Architecture**: Código organizado por funcionalidades
- **Custom Hooks**: Lógica reutilizável (useGraphState, useGraphProcessor, useTheme)
- **Context API**: Gerenciamento de tema global
- **Component Composition**: Componentes reutilizáveis e modulares

## 🔌 Endpoints da API

- `GET /`: Informações da API
- `GET /health`: Health check
- `POST /process`: Processa o grafo de nós
- `POST /upload-raw`: Faz upload de arquivo (RAW ou formatos comuns)
  - **Formatos suportados**: RAW, JPG, JPEG, PNG, BMP, TIFF, TIF, GIF, WEBP
  - **Conversão automática**: Imagens comuns são convertidas para escala de cinza
  - **Extração de dimensões**: Dimensões extraídas automaticamente para formatos comuns

## 🎨 Features Extras

- **🌗 Dark/Light Mode**: Sistema completo de temas com Context API
- **🎯 Type Safety**: TypeScript em todo o frontend com interfaces bem definidas
- **🧩 Componentes Reutilizáveis**: Shadcn/UI + Radix UI
- **✅ Validação de Dados**: Pydantic no backend
- **🔧 Kernels Dinâmicos**: Geração automática de kernels para qualquer tamanho
- **📊 Visualização em Tempo Real**: Canvas nativo para renderização de imagens e histogramas
- **🗺️ MiniMap**: Navegação facilitada em grafos grandes
- **🎮 Controles Avançados**: Zoom, pan, seleção múltipla
- **🔗 Encadeamento de Display**: Nós de exibição propagam dados para permitir conexões em série
- **📁 Suporte Multi-Formato**: Carregue JPG, PNG, BMP e outros formatos automaticamente
- **🧮 Implementação Matemática Manual**: Todos os algoritmos implementados do zero

## 🧪 Criando Imagens de Teste

```bash
cd backend
python create_test_images.py
```

Isso criará imagens RAW de exemplo em `backend/test_images/`:
- `gradient_256x256.raw` e `gradient_512x512.raw` - Gradientes horizontais
- `gradient_v_512x512.raw` - Gradiente vertical
- `checkerboard_256x256.raw` e `checkerboard_512x512.raw` - Padrões xadrez
- `circle_256x256.raw` e `circle_512x512.raw` - Círculos brancos
- `noise_512x512.raw` - Ruído aleatório (ideal para testar filtro de mediana)

## 📝 Dicas de Uso

### Interface
- Use **Ctrl + Scroll** para zoom
- **Arraste** o canvas para mover a visualização
- **Selecione** nós e pressione **Delete** para remover
- Use o **MiniMap** para navegar em grafos grandes
- Alterne o **tema** com o botão no canto superior direito

### Processamento
- Conecte múltiplos blocos "Exibir" para ver resultados intermediários
- O bloco "Diferença" tem **duas entradas** (porta superior e inferior)
- Nós de "Exibir" **propagam dados**, permitindo encadear outros blocos depois
- Use tamanhos de kernel maiores (5×5, 7×7) para suavização mais agressiva

### Formatos de Arquivo
- **Imagens comuns** (JPG, PNG, etc.): Apenas selecione o arquivo, dimensões extraídas automaticamente
- **Arquivos RAW**: Configure largura e altura antes de fazer upload
- Certifique-se: `largura × altura = tamanho do arquivo em bytes` (para RAW)

### Filtros
- **Filtro de Média**: Suaviza uniformemente, borra bordas
- **Filtro de Mediana**: Excelente para ruído sal-e-pimenta, preserva bordas melhor que média
- **Laplaciano**: Realça bordas e detalhes, útil para detecção de bordas

## 🐛 Troubleshooting

### "Failed to fetch" ou "Network Error"
- Verifique se o backend está rodando em `http://localhost:8000`
- Teste: `curl http://localhost:8000/health`
- Verifique se CORS está configurado corretamente

### "Dimensões inválidas" (Arquivos RAW)
- Certifique-se: `largura × altura = tamanho do arquivo em bytes`
- Exemplo: arquivo 512×512 deve ter exatamente 262.144 bytes
- Para formatos comuns (JPG, PNG), este erro não deve ocorrer

### "Grafo contém ciclos"
- Não crie conexões circulares (A → B → A)
- O fluxo deve ser sempre acíclico (DAG - Directed Acyclic Graph)

### Imagens muito escuras ou muito claras
- Use o bloco "Operação Pontual" com operação "Brilho"
- Ajuste o valor entre -255 e +255
- Use "Histograma" para visualizar a distribuição de intensidades

### Filtros não estão funcionando como esperado
- Verifique se a imagem de entrada está conectada corretamente
- Teste com tamanhos de kernel diferentes
- Use o bloco "Diferença" para comparar antes/depois

## 👥 Autores

Trabalho desenvolvido para a disciplina de **Processamento de Imagens**  
PUC Minas - 2025

## 📄 Licença

Este projeto é de uso acadêmico.

---

**Desenvolvido com ❤️ usando React, TypeScript, FastAPI e muita matemática manual!**
