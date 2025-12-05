import { Handle, Position, type NodeProps } from 'reactflow'
import { useState } from 'react'
import { Sparkles } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { PointOpNodeData, PointOperation } from '@/types'
import { cn } from '@/lib/utils'

const OPERATION_CONFIG: Record<PointOperation, {
  label: string
  min: number
  max: number
  step: string
  default: number
  description: string
}> = {
  brightness: {
    label: 'Ajuste',
    min: -255,
    max: 255,
    step: '1',
    default: 0,
    description: 'Adiciona valor a cada pixel'
  },
  threshold: {
    label: 'Limiar',
    min: 0,
    max: 255,
    step: '1',
    default: 128,
    description: 'Binariza: >= limiar → 255, < limiar → 0'
  },
}

export default function PointOpNode({ data, id, selected }: NodeProps<PointOpNodeData>) {
  const [operation, setOperation] = useState<PointOperation>(data.operation || 'brightness')
  const [value, setValue] = useState(data.value || 0)

  const config = OPERATION_CONFIG[operation]

  const handleOperationChange = (newOp: PointOperation) => {
    setOperation(newOp)
    const newValue = OPERATION_CONFIG[newOp].default
    setValue(newValue)
    data.onChange?.(id, { operation: newOp, value: newValue } as Partial<PointOpNodeData>)
  }

  const handleValueChange = (newValue: string) => {
    const parsed = parseFloat(newValue)
    setValue(parsed)
    data.onChange?.(id, { value: parsed } as Partial<PointOpNodeData>)
  }

  return (
    <div
      className={cn(
        'rounded-lg border-2 bg-card p-3 shadow-lg min-w-[220px]',
        selected ? 'border-primary' : 'border-orange-500'
      )}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!bg-orange-500 !border-orange-600"
      />

      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border">
        <Sparkles className="w-4 h-4 text-orange-500" />
        <h3 className="font-bold text-sm text-orange-500">Operação Pontual</h3>
      </div>

      <div className="space-y-3 text-xs">
        <div>
          <Label htmlFor={`op-${id}`} className="text-xs text-muted-foreground">
            Operação
          </Label>
          <Select value={operation} onValueChange={handleOperationChange}>
            <SelectTrigger id={`op-${id}`} className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="brightness" className="text-xs">Brilho</SelectItem>
              <SelectItem value="threshold" className="text-xs">Limiarização</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor={`value-${id}`} className="text-xs text-muted-foreground">
            {config.label}
          </Label>
          <Input
            id={`value-${id}`}
            type="number"
            value={value}
            onChange={(e) => handleValueChange(e.target.value)}
            className="h-8 text-xs"
            min={config.min}
            max={config.max}
            step={config.step}
          />
        </div>

        <div className="text-[10px] text-muted-foreground bg-secondary p-2 rounded">
          {config.description}
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!bg-orange-500 !border-orange-600"
      />
    </div>
  )
}
