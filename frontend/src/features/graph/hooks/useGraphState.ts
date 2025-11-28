import { useCallback } from 'react'
import {
  useNodesState,
  useEdgesState,
  addEdge,
  type Connection,
  type Node,
} from 'reactflow'
import type { PSEEdge, NodeType, NodeDataTypes } from '@/types'

let nodeIdCounter = 0

export function useGraphState() {
  const [nodes, setNodes, onNodesChange] = useNodesState<NodeDataTypes>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<PSEEdge>([])

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

  const addNode = useCallback((type: NodeType) => {
    const id = `node_${nodeIdCounter++}`
    const newNode: Node<NodeDataTypes> = {
      id,
      type,
      position: { x: Math.random() * 400 + 100, y: Math.random() * 300 + 100 },
      data: {
        label: type,
        onChange: updateNodeData,
      } as any,
    }
    setNodes((nds) => [...nds, newNode])
  }, [setNodes, updateNodeData])

  const clearWorkspace = useCallback(() => {
    if (confirm('Deseja limpar todo o workspace?')) {
      setNodes([])
      setEdges([])
      nodeIdCounter = 0
    }
  }, [setNodes, setEdges])

  return {
    nodes,
    edges,
    setNodes,
    setEdges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNode,
    clearWorkspace,
    updateNodeData,
  }
}
