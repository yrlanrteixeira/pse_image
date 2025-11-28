import ReactFlow, {
  MiniMap,
  Controls,
  Background,
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

export function FlowCanvas({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
}: FlowCanvasProps) {
  return (
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
  )
}
