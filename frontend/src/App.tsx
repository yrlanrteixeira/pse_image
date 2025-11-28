import { useGraphState, useGraphProcessor } from '@/features/graph'
import { Toolbar } from '@/features/toolbar'
import { FlowCanvas } from '@/features/canvas'

function App() {
  const {
    nodes,
    edges,
    setNodes,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNode,
    clearWorkspace,
  } = useGraphState()

  const { isProcessing, handleProcess } = useGraphProcessor(nodes, edges, setNodes)

  return (
    <div className="flex flex-col h-screen w-screen bg-background">
      <Toolbar
        onAddNode={addNode}
        onProcess={handleProcess}
        onClear={clearWorkspace}
        isProcessing={isProcessing}
      />

      <FlowCanvas
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
      />
    </div>
  )
}

export default App
