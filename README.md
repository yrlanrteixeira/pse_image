# PSE-Image - Problem-Solving Environment para Processamento de Imagens

Sistema de processamento de imagens baseado em fluxo visual, desenvolvido como trabalho da disciplina de Processamento de Imagens.

## 🎯 Características

- **Interface Gráfica Moderna**: React + TypeScript + Shadcn/UI
- **Fluxo Visual**: Baseado em blocos (nodes) interconectados com React Flow
- **Processamento RAW**: Imagens 8 bits/pixel, escala de cinza
- **Implementação Matemática Manual**: Sem uso de métodos prontos (cv2, etc.)
- **Type-Safe**: TypeScript end-to-end
- **Arquitetura Monorepo**: Backend Python (FastAPI) + Frontend React

## 📦 Blocos Implementados

### 1. Blocos de Interface
- **📁 Leitura RAW**: Carrega arquivos .raw com dimensões configuráveis
- **👁️ Exibição**: Visualiza a imagem em qualquer ponto do fluxo
- **💾 Gravação RAW**: Salva o resultado como arquivo .raw

### 2. Blocos de Processamento

#### Convolução (🔲)
- Kernel parametrizável (tamanho e pesos)
- **Máscaras predefinidas**:
  - Média (3×3, 5×5)
  - Gaussiano (3×3, 5×5)
  - Laplaciano (4-vizinhos, 8-vizinhos)
  - Nitidez
  - Detecção de Bordas
  - Relevo
  - Sobel (X e Y)
  - Prewitt (X e Y)
- Divisor configurável

#### Operação Pontual (✨)
- **Brilho**: Ajuste aditivo (-255 a +255)
- **Contraste**: Multiplicação centrada em 128 (0.1 a 3.0)
- **Limiarização**: Binarização (0 a 255)
- **Negativo**: Inversão (255 - pixel)

### 3. Blocos de Análise
- **📊 Histograma**: Visualização da distribuição de intensidades (0-255)
- **➖ Diferença**: Calcula diferença absoluta entre duas imagens

## 🗂️ Estrutura do Projeto

```
pse_image/
├── backend/                           # API Python (FastAPI)
│   ├── main.py                       # Servidor FastAPI
│   ├── processor.py                  # Lógica de processamento matemático
│   ├── models.py                     # Modelos de dados (Pydantic)
│   ├── requirements.txt              # Dependências Python
│   └── create_test_images.py         # Script para criar imagens de teste
│
└── frontend/                          # Interface React + TypeScript
    ├── src/
    │   ├── components/ui/            # Componentes Shadcn
    │   │   ├── button.tsx
    │   │   ├── input.tsx
    │   │   ├── label.tsx
    │   │   └── select.tsx
    │   ├── lib/
    │   │   ├── api.ts                # Comunicação com backend
    │   │   └── utils.ts              # Utilitários
    │   ├── nodes/                    # Custom Nodes do React Flow
    │   │   ├── RawReaderNode.tsx
    │   │   ├── ConvolutionNode.tsx
    │   │   ├── PointOpNode.tsx
    │   │   ├── DisplayNode.tsx
    │   │   ├── HistogramNode.tsx
    │   │   ├── DifferenceNode.tsx
    │   │   └── SaveNode.tsx
    │   ├── types/
    │   │   └── index.ts              # Tipos TypeScript
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
4. **Carregar Imagem**: Use o bloco "📁 Leitura RAW" para carregar uma imagem
   - Configure largura e altura
   - Selecione o arquivo .raw
5. **Processar**: Clique em "▶ Processar" para executar o fluxo
6. **Visualizar**: Use blocos "👁️ Exibir" para visualizar resultados intermediários
7. **Salvar**: Use o bloco "💾 Salvar" para exportar o resultado

## 💡 Exemplos de Fluxo

### Exemplo 1: Aplicar Filtro Gaussiano
```
[📁 Leitura RAW] → [🔲 Convolução (Gaussiano)] → [👁️ Exibir]
```

### Exemplo 2: Comparar Original vs Processado
```
[📁 Leitura RAW] ──┬→ [👁️ Exibir Original]
                    └→ [🔲 Convolução] → [👁️ Exibir Processado]
```

### Exemplo 3: Pipeline Completo de Processamento
```
[📁 Leitura RAW] → [✨ Brilho +50] → [🔲 Gaussiano] → [✨ Contraste 1.5] ──┬→ [👁️ Exibir]
                                                                              ├→ [📊 Histograma]
                                                                              └→ [💾 Salvar]
```

### Exemplo 4: Detecção de Bordas e Diferença
```
[📁 Leitura RAW] ──┬→ [🔲 Gaussiano] → Img Suavizada ──┐
                    └───────────────────────────────────┴→ [➖ Diferença] → [👁️ Exibir Bordas]
```

## 🔬 Implementação Matemática (Sem Métodos Prontos)

### Convolução Manual
```python
for y in range(height):
    for x in range(width):
        accumulator = 0
        for ky in range(-radius, radius + 1):
            for kx in range(-radius, radius + 1):
                kernel_value = kernel[ky + radius][kx + radius]
                pixel_value = pixels[(y + ky) * width + (x + kx)]
                accumulator += kernel_value * pixel_value
        output[y * width + x] = clamp(accumulator / divisor, 0, 255)
```

### Operações Pontuais
- **Brilho**: `output[i] = clamp(input[i] + brightness, 0, 255)`
- **Contraste**: `output[i] = clamp((input[i] - 128) * contrast + 128, 0, 255)`
- **Limiarização**: `output[i] = 255 if input[i] >= threshold else 0`
- **Negativo**: `output[i] = 255 - input[i]`

### Histograma
```python
histogram = [0] * 256
for pixel in pixels:
    histogram[pixel] += 1
```

### Diferença
```python
for i in range(len(pixels1)):
    output[i] = abs(pixels1[i] - pixels2[i])
```

## 🛠️ Tecnologias Utilizadas

### Backend
- **FastAPI**: Framework web moderno e rápido
- **Pydantic**: Validação de dados e tipos
- **Uvicorn**: Servidor ASGI de alta performance

### Frontend
- **React 18**: Biblioteca UI moderna
- **TypeScript**: Type safety end-to-end
- **Vite**: Build tool extremamente rápido
- **React Flow**: Biblioteca para grafos interativos
- **Shadcn/UI**: Componentes UI modernos e acessíveis
- **Tailwind CSS**: Utility-first CSS framework
- **Axios**: Cliente HTTP

## 🔌 Endpoints da API

- `GET /`: Informações da API
- `GET /health`: Health check
- `POST /process`: Processa o grafo de nós
- `POST /upload-raw`: Faz upload de arquivo RAW

## 🎨 Features Extras

- **Dark Mode Nativo**: Interface moderna com tema escuro
- **Type Safety**: TypeScript em todo o frontend
- **Componentes Reutilizáveis**: Shadcn/UI
- **Validação de Dados**: Pydantic no backend
- **Múltiplos Presets**: 13 máscaras de convolução predefinidas
- **Visualização em Tempo Real**: Canvas nativo para renderização
- **MiniMap**: Navegação facilitada em grafos grandes
- **Controles Avançados**: Zoom, pan, seleção múltipla

## 🧪 Criando Imagens de Teste

```bash
cd backend
python create_test_images.py
```

Isso criará imagens RAW de exemplo em `backend/test_images/`:
- `gradient_512x512.raw` - Gradiente horizontal
- `checkerboard_512x512.raw` - Padrão xadrez
- `circle_512x512.raw` - Círculo branco
- `noise_512x512.raw` - Ruído aleatório

## 📝 Dicas de Uso

- Use **Ctrl + Scroll** para zoom
- **Arraste** o canvas para mover a visualização
- **Selecione** nós e pressione **Delete** para remover
- Use o **MiniMap** para navegar em grafos grandes
- Conecte múltiplos blocos "Exibir" para ver resultados intermediários
- O bloco "Diferença" tem **duas entradas** (porta superior e inferior)
- Configure kernel "Personalizado" para criar suas próprias máscaras

## 🐛 Troubleshooting

### "Failed to fetch" ou "Network Error"
- Verifique se o backend está rodando em `http://localhost:8000`
- Teste: `curl http://localhost:8000/health`

### "Dimensões inválidas"
- Certifique-se: `largura × altura = tamanho do arquivo em bytes`
- Exemplo: arquivo 512×512 deve ter exatamente 262.144 bytes

### "Grafo contém ciclos"
- Não crie conexões circulares
- O fluxo deve ser sempre da esquerda para a direita

## 👥 Autores

Trabalho desenvolvido para a disciplina de **Processamento de Imagens**
PUC - 2025

## 📄 Licença

Este projeto é de uso acadêmico.
