import { Handle, Position, type NodeProps } from 'reactflow'
import { useState } from 'react'
import { Grid3x3 } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { ConvolutionNodeData } from '@/types'
import { PRESET_KERNELS } from '@/types'
import { cn } from '@/lib/utils'

export default function ConvolutionNode({ data, id, selected }: NodeProps<ConvolutionNodeData>) {
  const [preset, setPreset] = useState(data.preset || 'average')
  const [kernelSize, setKernelSize] = useState(data.kernelSize || 3)
  const [kernel, setKernel] = useState(data.kernel || PRESET_KERNELS.average.kernel)
  const [divisor, setDivisor] = useState(data.divisor || 9)

  const handlePresetChange = (presetKey: string) => {
    setPreset(presetKey)
    const selected = PRESET_KERNELS[presetKey]
    setKernelSize(selected.size)
    setKernel(selected.kernel)
    setDivisor(selected.divisor)

    data.onChange?.(id, {
      ...data,
      preset: presetKey,
      kernelSize: selected.size,
      kernel: selected.kernel,
      divisor: selected.divisor,
    })
  }

  const handleKernelChange = (row: number, col: number, value: string) => {
    const newKernel = kernel.map((r, i) =>
      r.map((c, j) => (i === row && j === col ? parseFloat(value) || 0 : c))
    )
    setKernel(newKernel)
    data.onChange?.(id, { ...data, kernel: newKernel })
  }

  const handleDivisorChange = (value: string) => {
    const newDivisor = parseFloat(value) || 1
    setDivisor(newDivisor)
    data.onChange?.(id, { ...data, divisor: newDivisor })
  }

  return (
    <div
      className={cn(
        'rounded-lg border-2 bg-card p-3 shadow-lg min-w-[260px]',
        selected ? 'border-primary' : 'border-blue-500'
      )}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!bg-blue-500 !border-blue-600"
      />

      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border">
        <Grid3x3 className="w-4 h-4 text-blue-500" />
        <h3 className="font-bold text-sm text-blue-500">Convolução</h3>
      </div>

      <div className="space-y-3 text-xs">
        <div>
          <Label htmlFor={`preset-${id}`} className="text-xs text-muted-foreground">
            Máscara Predefinida
          </Label>
          <Select value={preset} onValueChange={handlePresetChange}>
            <SelectTrigger id={`preset-${id}`} className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(PRESET_KERNELS).map(([key, value]) => (
                <SelectItem key={key} value={key} className="text-xs">
                  {value.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-xs text-muted-foreground mb-1 block">
            Kernel {kernelSize}×{kernelSize}
          </Label>
          <div
            className="grid gap-1"
            style={{
              gridTemplateColumns: `repeat(${kernelSize}, 1fr)`,
            }}
          >
            {kernel.map((row, i) =>
              row.map((val, j) => (
                <Input
                  key={`${i}-${j}`}
                  type="number"
                  value={val}
                  onChange={(e) => handleKernelChange(i, j, e.target.value)}
                  disabled={preset !== 'custom'}
                  className="h-7 text-xs text-center p-0"
                  step="0.1"
                />
              ))
            )}
          </div>
        </div>

        <div>
          <Label htmlFor={`divisor-${id}`} className="text-xs text-muted-foreground">
            Divisor
          </Label>
          <Input
            id={`divisor-${id}`}
            type="number"
            value={divisor}
            onChange={(e) => handleDivisorChange(e.target.value)}
            className="h-8 text-xs"
            step="0.1"
          />
        </div>

        <div className="text-[10px] text-muted-foreground bg-secondary p-2 rounded">
          {preset === 'custom' ? 'Kernel personalizado' : PRESET_KERNELS[preset]?.name}
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!bg-blue-500 !border-blue-600"
      />
    </div>
  )
}
