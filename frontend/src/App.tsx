import { useState, useCallback } from 'react'
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  type Connection,
  type NodeTypes,
} from 'reactflow'
import 'reactflow/dist/style.css'

import { Button } from '@/components/ui/button'
import {
  Upload,
  Grid3x3,
  Sparkles,
  Eye,
  BarChart3,
  Minus,
  Save,
  Play,
  Trash2,
} from 'lucide-react'

import RawReaderNode from '@/nodes/RawReaderNode'
import ConvolutionNode from '@/nodes/ConvolutionNode'
import PointOpNode from '@/nodes/PointOpNode'
import DisplayNode from '@/nodes/DisplayNode'
import HistogramNode from '@/nodes/HistogramNode'
import DifferenceNode from '@/nodes/DifferenceNode'
import SaveNode from '@/nodes/SaveNode'

import { processGraph } from '@/lib/api'
import type { PSENode, PSEEdge, NodeType } from '@/types'
import { NODE_COLORS } from '@/types'

const nodeTypes: NodeTypes = {
  RAW_READER: RawReaderNode,
  CONVOLUTION: ConvolutionNode,
  POINT_OP: PointOpNode,
  DISPLAY: DisplayNode,
  HISTOGRAM: HistogramNode,
  DIFFERENCE: DifferenceNode,
  SAVE: SaveNode,
}

let nodeIdCounter = 0

function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState<PSENode>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<PSEEdge>([])
  const [isProcessing, setIsProcessing] = useState(false)

  const updateNodeData = useCallback((nodeId: string, newData: any) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId ? { ...node, data: { ...node.data, ...newData } } : node
      )
    )
  }, [setNodes])

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  )

  const addNode = (type: NodeType) => {
    const id = `node_${nodeIdCounter++}`
    const newNode: PSENode = {
      id,
      type,
      position: { x: Math.random() * 400 + 100, y: Math.random() * 300 + 100 },
      data: {
        label: type,
        onChange: updateNodeData,
      } as any,
    }
    setNodes((nds) => [...nds, newNode])
  }

  const handleProcess = async () => {
    setIsProcessing(true)

    try {
      const response = await processGraph(nodes, edges)

      if (response.error) {
        throw new Error(response.error)
      }

      const results = response.results

      // Atualizar nós com os resultados
      setNodes((nds) =>
        nds.map((node) => {
          const result = results[node.id]
          if (!result) return node

          // DISPLAY
          if (node.type === 'DISPLAY' && result.type === 'display' && result.image) {
            return {
              ...node,
              data: { ...node.data, imageData: result.image },
            }
          }

          // HISTOGRAM
          if (node.type === 'HISTOGRAM' && result.type === 'histogram' && result.data) {
            return {
              ...node,
              data: { ...node.data, histogram: result.data },
            }
          }

          // SAVE
          if (node.type === 'SAVE' && result.type === 'save' && result.image) {
            return {
              ...node,
              data: { ...node.data, imageData: result.image },
            }
          }

          return node
        })
      )

      alert('✓ Processamento concluído com sucesso!')
    } catch (error) {
      console.error('Erro ao processar:', error)
      alert(`Erro ao processar: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
    } finally {
      setIsProcessing(false)
    }
  }

  const clearWorkspace = () => {
    if (confirm('Deseja limpar todo o workspace?')) {
      setNodes([])
      setEdges([])
      nodeIdCounter = 0
    }
  }

  return (
    <div className="flex flex-col h-screen w-screen bg-background">
      {/* Toolbar */}
      <div className="border-b border-border bg-card shadow-sm">
        <div className="flex items-center gap-2 p-2 flex-wrap">
          <div className="flex items-center gap-2 px-2 border-r border-border">
            <h1 className="text-lg font-bold">PSE-Image</h1>
            <span className="text-xs text-muted-foreground">
              Problem-Solving Environment
            </span>
          </div>

          <Button onClick={() => addNode('RAW_READER')} size="sm" variant="outline">
            <Upload className="w-4 h-4 mr-1" style={{ color: NODE_COLORS.RAW_READER }} />
            Leitura RAW
          </Button>

          <Button onClick={() => addNode('CONVOLUTION')} size="sm" variant="outline">
            <Grid3x3 className="w-4 h-4 mr-1" style={{ color: NODE_COLORS.CONVOLUTION }} />
            Convolução
          </Button>

          <Button onClick={() => addNode('POINT_OP')} size="sm" variant="outline">
            <Sparkles className="w-4 h-4 mr-1" style={{ color: NODE_COLORS.POINT_OP }} />
            Op. Pontual
          </Button>

          <Button onClick={() => addNode('DISPLAY')} size="sm" variant="outline">
            <Eye className="w-4 h-4 mr-1" style={{ color: NODE_COLORS.DISPLAY }} />
            Exibir
          </Button>

          <Button onClick={() => addNode('HISTOGRAM')} size="sm" variant="outline">
            <BarChart3 className="w-4 h-4 mr-1" style={{ color: NODE_COLORS.HISTOGRAM }} />
            Histograma
          </Button>

          <Button onClick={() => addNode('DIFFERENCE')} size="sm" variant="outline">
            <Minus className="w-4 h-4 mr-1" style={{ color: NODE_COLORS.DIFFERENCE }} />
            Diferença
          </Button>

          <Button onClick={() => addNode('SAVE')} size="sm" variant="outline">
            <Save className="w-4 h-4 mr-1" style={{ color: NODE_COLORS.SAVE }} />
            Salvar
          </Button>

          <div className="flex-1" />

          <Button
            onClick={handleProcess}
            disabled={isProcessing}
            size="sm"
            className="font-bold"
          >
            <Play className="w-4 h-4 mr-1" />
            {isProcessing ? 'Processando...' : 'Processar'}
          </Button>

          <Button onClick={clearWorkspace} size="sm" variant="destructive">
            <Trash2 className="w-4 h-4 mr-1" />
            Limpar
          </Button>
        </div>
      </div>

      {/* React Flow Canvas */}
      <div className="flex-1">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          deleteKeyCode={['Delete', 'Backspace']}
          fitView
          defaultEdgeOptions={{
            animated: true,
            style: { strokeWidth: 2 },
          }}
        >
          <Controls />
          <MiniMap
            nodeColor={(node) => {
              return NODE_COLORS[node.type as NodeType] || '#ccc'
            }}
            pannable
            zoomable
          />
          <Background variant="dots" gap={16} size={1} />
        </ReactFlow>
      </div>
    </div>
  )
}

export default App
