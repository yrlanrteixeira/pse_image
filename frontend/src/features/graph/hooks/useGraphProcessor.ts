import { useState, useCallback } from 'react'
import type { Node } from 'reactflow'
import type { PSENode, PSEEdge, NodeDataTypes } from '@/types'
import { processGraph } from '@/lib/api'

export function useGraphProcessor(
  nodes: Node<NodeDataTypes>[],
  edges: PSEEdge[],
  setNodes: (nodes: Node<NodeDataTypes>[] | ((nodes: Node<NodeDataTypes>[]) => Node<NodeDataTypes>[])) => void
) {
  const [isProcessing, setIsProcessing] = useState(false)

  const handleProcess = useCallback(async () => {
    setIsProcessing(true)

    try {
      // Converter para PSENode[] para a API
      const response = await processGraph(nodes as PSENode[], edges)

      if (response.error) {
        throw new Error(response.error)
      }

      const results = response.results

      setNodes((nds) =>
        nds.map((node) => {
          const result = results[node.id]
          if (!result) return node

          if (node.type === 'DISPLAY' && result.type === 'display' && result.image) {
            return {
              ...node,
              data: { ...node.data, imageData: result.image },
            }
          }

          if (node.type === 'HISTOGRAM' && result.type === 'histogram' && result.data) {
            return {
              ...node,
              data: { ...node.data, histogram: result.data },
            }
          }

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
  }, [nodes, edges, setNodes])

  return {
    isProcessing,
    handleProcess,
  }
}
