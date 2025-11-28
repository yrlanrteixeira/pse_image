import { Handle, Position, type NodeProps } from 'reactflow'
import { Minus } from 'lucide-react'
import type { DifferenceNodeData } from '@/types'
import { cn } from '@/lib/utils'

export default function DifferenceNode({ data, selected }: NodeProps<DifferenceNodeData>) {
  return (
    <div
      className={cn(
        'rounded-lg border-2 bg-card p-3 shadow-lg min-w-[200px]',
        selected ? 'border-primary' : 'border-red-500'
      )}
    >
      <Handle
        type="target"
        position={Position.Left}
        id="input1"
        className="!bg-red-500 !border-red-600"
        style={{ top: '30%' }}
      />
      <Handle
        type="target"
        position={Position.Left}
        id="input2"
        className="!bg-red-500 !border-red-600"
        style={{ top: '70%' }}
      />

      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border">
        <Minus className="w-4 h-4 text-red-500" />
        <h3 className="font-bold text-sm text-red-500">Diferença</h3>
      </div>

      <div className="space-y-2 text-xs">
        <div className="text-muted-foreground bg-secondary p-2 rounded">
          Calcula |imagem1 - imagem2|
        </div>

        <div className="space-y-1 text-[10px] text-muted-foreground">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <span>Entrada 1: porta superior</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <span>Entrada 2: porta inferior</span>
          </div>
        </div>

        {data.result && (
          <div className="text-xs text-red-500 font-medium pt-2 border-t border-border">
            ✓ {data.result.width} × {data.result.height}
          </div>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!bg-red-500 !border-red-600"
      />
    </div>
  )
}
