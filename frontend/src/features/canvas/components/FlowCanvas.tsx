import { useState, useEffect } from 'react'
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  ReactFlowProvider,
  useReactFlow,
  type OnNodesChange,
  type OnEdgesChange,
  type OnConnect,
  type Node,
} from 'reactflow'
import 'reactflow/dist/style.css'

import type { PSEEdge, NodeType, NodeDataTypes } from '@/types'
import { NODE_COLORS } from '@/types'
import { nodeTypes } from '@/features/nodes'

interface FlowCanvasProps {
  nodes: Node<NodeDataTypes>[]
  edges: PSEEdge[]
  onNodesChange: OnNodesChange
  onEdgesChange: OnEdgesChange
  onConnect: OnConnect
}

interface KeyboardHandlerProps {
  onLockChange: (locked: boolean) => void
}

function KeyboardHandler({ onLockChange }: KeyboardHandlerProps) {
  const { zoomIn, zoomOut } = useReactFlow()

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Atalho para zoom in: tecla "+" ou "="
      if (event.key === '+' || event.key === '=') {
        event.preventDefault()
        zoomIn()
      }

      // Atalho para zoom out: tecla "-" ou "_"
      if (event.key === '-' || event.key === '_') {
        event.preventDefault()
        zoomOut()
      }

      // Atalho para alternar cadeado: tecla "Alt"
      if (event.key === 'Alt') {
        event.preventDefault()
        onLockChange(true)
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [zoomIn, zoomOut, onLockChange])

  return null
}

function FlowCanvasInner({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
}: FlowCanvasProps) {
  const [isLocked, setIsLocked] = useState(false)

  const handleLockToggle = () => {
    setIsLocked((prev) => !prev)
  }

  return (
    <div className="flex-1">
      <KeyboardHandler onLockChange={handleLockToggle} />
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        nodesDraggable={!isLocked}
        nodesConnectable={!isLocked}
        elementsSelectable={!isLocked}
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
  )
}

export function FlowCanvas(props: FlowCanvasProps) {
  return (
    <ReactFlowProvider>
      <FlowCanvasInner {...props} />
    </ReactFlowProvider>
  )
}
