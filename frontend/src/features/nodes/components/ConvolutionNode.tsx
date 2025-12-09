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
import { PRESET_KERNELS, generateAverageKernel, generateLaplacianKernel } from '@/types'
import { cn } from '@/lib/utils'

const KERNEL_SIZES = [3, 5, 7, 9]

export default function ConvolutionNode({ data, id, selected }: NodeProps<ConvolutionNodeData>) {
  const [preset, setPreset] = useState(data.preset || 'average')
  const [kernelSize, setKernelSize] = useState(data.kernelSize || 3)
  const [kernel, setKernel] = useState(data.kernel || PRESET_KERNELS.average.kernel)
  const [divisor, setDivisor] = useState(data.divisor || 9)
  const [filterType, setFilterType] = useState<'convolution' | 'median'>(data.filterType || 'convolution')

  const handlePresetChange = (presetKey: string) => {
    setPreset(presetKey)
    const isMedian = presetKey === 'median'
    const newFilterType = isMedian ? 'median' : 'convolution'
    setFilterType(newFilterType)

    let kernelData
    if (presetKey === 'average') {
      kernelData = generateAverageKernel(kernelSize)
    } else if (presetKey === 'laplacian') {
      kernelData = generateLaplacianKernel(kernelSize)
    } else {
      // median - gera máscara de 1's para visualização
      const medianMask = Array(kernelSize).fill(0).map(() => Array(kernelSize).fill(1))
      kernelData = { kernel: medianMask, divisor: 1 }
    }

    setKernel(kernelData.kernel)
    setDivisor(kernelData.divisor)

    data.onChange?.(id, {
      preset: presetKey,
      kernelSize: kernelSize,
      kernel: kernelData.kernel,
      divisor: kernelData.divisor,
      filterType: newFilterType,
    } as Partial<ConvolutionNodeData>)
  }

  const handleKernelSizeChange = (size: string) => {
    const newSize = parseInt(size)
    setKernelSize(newSize)

    let kernelData
    if (preset === 'average') {
      kernelData = generateAverageKernel(newSize)
    } else if (preset === 'laplacian') {
      kernelData = generateLaplacianKernel(newSize)
    } else {
      // median - gera máscara de 1's para visualização
      const medianMask = Array(newSize).fill(0).map(() => Array(newSize).fill(1))
      kernelData = { kernel: medianMask, divisor: 1 }
    }

    setKernel(kernelData.kernel)
    setDivisor(kernelData.divisor)

    data.onChange?.(id, {
      kernelSize: newSize,
      kernel: kernelData.kernel,
      divisor: kernelData.divisor,
    } as Partial<ConvolutionNodeData>)
  }

  const handleKernelChange = (row: number, col: number, value: string) => {
    // Permitir campo vazio - converter para 0 apenas se não for vazio
    const numValue = value === '' ? 0 : (isNaN(parseFloat(value)) ? 0 : parseFloat(value))
    const newKernel = kernel.map((r, i) =>
      r.map((c, j) => (i === row && j === col ? numValue : c))
    )
    setKernel(newKernel)
    data.onChange?.(id, { kernel: newKernel } as Partial<ConvolutionNodeData>)
  }

  const handleDivisorChange = (value: string) => {
    // Permitir campo vazio - converter para 1 apenas se não for vazio
    const newDivisor = value === '' ? 1 : (isNaN(parseFloat(value)) ? 1 : parseFloat(value))
    setDivisor(newDivisor)
    data.onChange?.(id, { divisor: newDivisor } as Partial<ConvolutionNodeData>)
  }

  const isMedianFilter = filterType === 'median'

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
            Tipo de Filtro
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
          <Label htmlFor={`size-${id}`} className="text-xs text-muted-foreground">
            Tamanho da Máscara
          </Label>
          <Select value={kernelSize.toString()} onValueChange={handleKernelSizeChange}>
            <SelectTrigger id={`size-${id}`} className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {KERNEL_SIZES.map((size) => (
                <SelectItem key={size} value={size.toString()} className="text-xs">
                  {size}×{size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-xs text-muted-foreground mb-1 block">
            {isMedianFilter ? `Janela ${kernelSize}×${kernelSize}` : `Kernel ${kernelSize}×${kernelSize}`}
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
                  value={val || ''}
                  onChange={(e) => handleKernelChange(i, j, e.target.value)}
                  className="h-7 text-xs text-center p-0"
                  step="0.1"
                  placeholder="0"
                  disabled={isMedianFilter}
                  readOnly={isMedianFilter}
                />
              ))
            )}
          </div>
        </div>

        {!isMedianFilter && (
          <div>
            <Label htmlFor={`divisor-${id}`} className="text-xs text-muted-foreground">
              Divisor
            </Label>
            <Input
              id={`divisor-${id}`}
              type="number"
              value={divisor || ''}
              onChange={(e) => handleDivisorChange(e.target.value)}
              className="h-8 text-xs"
              placeholder="1"
              step="0.1"
            />
          </div>
        )}

        {isMedianFilter && (
          <div className="text-[10px] text-muted-foreground bg-secondary p-2 rounded">
            Filtro de mediana {kernelSize}×{kernelSize} - Coleta todos os pixels da janela
          </div>
        )}

        {!isMedianFilter && (
          <div className="text-[10px] text-muted-foreground bg-secondary p-2 rounded">
            {PRESET_KERNELS[preset]?.name} - Kernel editável
          </div>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!bg-blue-500 !border-blue-600"
      />
    </div>
  )
}
