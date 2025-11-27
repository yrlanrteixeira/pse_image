import { Node, Edge } from 'reactflow'

// ============ TIPOS DE DADOS DE IMAGEM ============

export interface ImageData {
  width: number
  height: number
  data: number[] // Array de pixels 0-255
}

export interface HistogramData {
  data: number[] // Array de 256 posições com contagem
}

// ============ TIPOS DE NÓS ============

export type NodeType =
  | 'RAW_READER'
  | 'CONVOLUTION'
  | 'POINT_OP'
  | 'DISPLAY'
  | 'HISTOGRAM'
  | 'DIFFERENCE'
  | 'SAVE'

export type PointOperation = 'brightness' | 'contrast' | 'threshold' | 'negative'

export interface KernelPreset {
  name: string
  size: number
  kernel: number[][]
  divisor: number
}

// ============ NODE DATA TYPES ============

export interface BaseNodeData {
  label?: string
  onChange?: (nodeId: string, newData: Partial<BaseNodeData>) => void
}

export interface RawReaderNodeData extends BaseNodeData {
  width: number
  height: number
  imageData?: number[]
  filename?: string
}

export interface ConvolutionNodeData extends BaseNodeData {
  kernelSize: number
  kernel: number[][]
  divisor: number
  preset?: string
}

export interface PointOpNodeData extends BaseNodeData {
  operation: PointOperation
  value: number
}

export interface DisplayNodeData extends BaseNodeData {
  imageData?: ImageData
}

export interface HistogramNodeData extends BaseNodeData {
  histogram?: number[]
}

export interface DifferenceNodeData extends BaseNodeData {
  result?: ImageData
}

export interface SaveNodeData extends BaseNodeData {
  filename: string
  imageData?: ImageData
}

export type NodeDataTypes =
  | RawReaderNodeData
  | ConvolutionNodeData
  | PointOpNodeData
  | DisplayNodeData
  | HistogramNodeData
  | DifferenceNodeData
  | SaveNodeData

// ============ REACT FLOW TYPES ============

export type PSENode = Node<NodeDataTypes>
export type PSEEdge = Edge

// ============ API TYPES ============

export interface ProcessRequest {
  nodes: PSENode[]
  edges: PSEEdge[]
}

export interface ProcessResponse {
  results: Record<string, ProcessResult>
  error?: string
}

export interface ProcessResult {
  type: 'image' | 'histogram' | 'display' | 'save' | 'error'
  width?: number
  height?: number
  data?: number[]
  image?: ImageData
  histogram?: number[]
  filename?: string
  error?: string
}

// ============ PRESET KERNELS ============

export const PRESET_KERNELS: Record<string, KernelPreset> = {
  custom: {
    name: 'Personalizado',
    size: 3,
    kernel: [[0, 0, 0], [0, 1, 0], [0, 0, 0]],
    divisor: 1,
  },
  average: {
    name: 'Média 3x3',
    size: 3,
    kernel: [[1, 1, 1], [1, 1, 1], [1, 1, 1]],
    divisor: 9,
  },
  average5x5: {
    name: 'Média 5x5',
    size: 5,
    kernel: [
      [1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1],
    ],
    divisor: 25,
  },
  gaussian: {
    name: 'Gaussiano 3x3',
    size: 3,
    kernel: [[1, 2, 1], [2, 4, 2], [1, 2, 1]],
    divisor: 16,
  },
  gaussian5x5: {
    name: 'Gaussiano 5x5',
    size: 5,
    kernel: [
      [1, 4, 6, 4, 1],
      [4, 16, 24, 16, 4],
      [6, 24, 36, 24, 6],
      [4, 16, 24, 16, 4],
      [1, 4, 6, 4, 1],
    ],
    divisor: 256,
  },
  laplacian: {
    name: 'Laplaciano',
    size: 3,
    kernel: [[0, -1, 0], [-1, 4, -1], [0, -1, 0]],
    divisor: 1,
  },
  laplacian8: {
    name: 'Laplaciano 8-vizinhos',
    size: 3,
    kernel: [[-1, -1, -1], [-1, 8, -1], [-1, -1, -1]],
    divisor: 1,
  },
  sharpen: {
    name: 'Nitidez',
    size: 3,
    kernel: [[0, -1, 0], [-1, 5, -1], [0, -1, 0]],
    divisor: 1,
  },
  edgeDetect: {
    name: 'Detecção Bordas',
    size: 3,
    kernel: [[-1, -1, -1], [-1, 8, -1], [-1, -1, -1]],
    divisor: 1,
  },
  emboss: {
    name: 'Relevo',
    size: 3,
    kernel: [[-2, -1, 0], [-1, 1, 1], [0, 1, 2]],
    divisor: 1,
  },
  sobelX: {
    name: 'Sobel X (Horizontal)',
    size: 3,
    kernel: [[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]],
    divisor: 1,
  },
  sobelY: {
    name: 'Sobel Y (Vertical)',
    size: 3,
    kernel: [[-1, -2, -1], [0, 0, 0], [1, 2, 1]],
    divisor: 1,
  },
  prewittX: {
    name: 'Prewitt X (Horizontal)',
    size: 3,
    kernel: [[-1, 0, 1], [-1, 0, 1], [-1, 0, 1]],
    divisor: 1,
  },
  prewittY: {
    name: 'Prewitt Y (Vertical)',
    size: 3,
    kernel: [[-1, -1, -1], [0, 0, 0], [1, 1, 1]],
    divisor: 1,
  },
}

// ============ NODE COLORS ============

export const NODE_COLORS: Record<NodeType, string> = {
  RAW_READER: '#22c55e',
  CONVOLUTION: '#3b82f6',
  POINT_OP: '#f59e0b',
  DISPLAY: '#8b5cf6',
  HISTOGRAM: '#ec4899',
  DIFFERENCE: '#ef4444',
  SAVE: '#10b981',
}
