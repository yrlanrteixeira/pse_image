import { useState, useCallback } from 'react'
import type { Node } from 'reactflow'
import type { PSENode, PSEEdge, NodeDataTypes } from '@/types'
import { processGraph } from '@/lib/api'
import { useNotification } from '@/contexts/NotificationContext'

export function useGraphProcessor(
  nodes: Node<NodeDataTypes>[],
  edges: PSEEdge[],
  setNodes: (nodes: Node<NodeDataTypes>[] | ((nodes: Node<NodeDataTypes>[]) => Node<NodeDataTypes>[])) => void
) {
  const [isProcessing, setIsProcessing] = useState(false)
  const { showDialog, showToast } = useNotification()

  const handleProcess = useCallback(async () => {
    setIsProcessing(true)

    try {
      // Validar nós RAW_READER antes de processar
      const rawReaderNodes = nodes.filter(n => n.type === 'RAW_READER')
      const errors: string[] = []

      for (const node of rawReaderNodes) {
        const { width, height, imageData } = node.data as any

        // Validar largura
        if (!width || width <= 0) {
          errors.push(`Nó "${node.id}": largura inválida ou não definida`)
        }

        // Validar altura
        if (!height || height <= 0) {
          errors.push(`Nó "${node.id}": altura inválida ou não definida`)
        }

        // Validar se imageData existe
        if (!imageData || !Array.isArray(imageData)) {
          errors.push(`Nó "${node.id}": nenhuma imagem carregada`)
        } else {
          // Validar se imageData tem dados
          if (imageData.length === 0) {
            errors.push(`Nó "${node.id}": arquivo de imagem vazio`)
          }

          // Validar se dimensões correspondem ao tamanho do arquivo
          if (width && height && width * height !== imageData.length) {
            errors.push(
              `Nó "${node.id}": dimensões não correspondem ao arquivo\n` +
              `Esperado: ${width}×${height} = ${width * height} pixels\n` +
              `Arquivo contém: ${imageData.length} pixels`
            )
          }
        }
      }

      // Se houver erros, mostrar diálogo e interromper processamento
      if (errors.length > 0) {
        showDialog(
          'Validação de Imagens',
          'Por favor, corrija os seguintes problemas antes de processar:\n\n' + errors.join('\n\n')
        )
        setIsProcessing(false)
        return
      }

      // Converter para PSENode[] para a API
      const response = await processGraph(nodes as PSENode[], edges)

      if (response.error) {
        throw new Error(response.error)
      }

      const results = response.results

      // Debug: verificar o que está chegando
      console.log('Results from backend:', results)

      setNodes((nds) =>
        nds.map((node) => {
          const result = results[node.id]
          if (!result) return node

          // Debug: verificar cada nó DISPLAY
          if (node.type === 'DISPLAY') {
            console.log('DISPLAY Node:', node.id, 'Result:', result)
          }

          if (node.type === 'DISPLAY' && result.type === 'image' && result.width && result.height && result.data) {
            const imageData = {
              width: result.width,
              height: result.height,
              data: result.data
            }
            console.log('Setting imageData for DISPLAY:', imageData)
            return {
              ...node,
              data: {
                ...node.data,
                imageData
              },
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

      showToast('Processamento concluído!', 'O grafo foi processado com sucesso.')
    } catch (error) {
      console.error('Erro ao processar:', error)
      showDialog(
        'Erro ao processar',
        error instanceof Error ? error.message : 'Erro desconhecido ao processar o grafo.'
      )
    } finally {
      setIsProcessing(false)
    }
  }, [nodes, edges, setNodes, showDialog, showToast])

  return {
    isProcessing,
    handleProcess,
  }
}
