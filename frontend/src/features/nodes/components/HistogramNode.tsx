import { Handle, Position, type NodeProps } from 'reactflow'
import { useEffect, useRef } from 'react'
import { BarChart3 } from 'lucide-react'
import type { HistogramNodeData } from '@/types'
import { cn } from '@/lib/utils'

export default function HistogramNode({ data, selected }: NodeProps<HistogramNodeData>) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!data.histogram || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = 256
    const height = 120

    canvas.width = width
    canvas.height = height

    // Limpar
    ctx.fillStyle = 'hsl(var(--secondary))'
    ctx.fillRect(0, 0, width, height)

    // Encontrar máximo para normalização
    const maxCount = Math.max(...data.histogram, 1)

    // Desenhar barras
    ctx.fillStyle = 'hsl(var(--primary))'
    for (let i = 0; i < 256; i++) {
      const barHeight = (data.histogram[i] / maxCount) * (height - 10)
      ctx.fillRect(i, height - barHeight, 1, barHeight)
    }

    // Grid
    ctx.strokeStyle = 'hsl(var(--border))'
    ctx.lineWidth = 1
    for (let i = 0; i < height; i += 30) {
      ctx.beginPath()
      ctx.moveTo(0, i)
      ctx.lineTo(width, i)
      ctx.stroke()
    }
  }, [data.histogram])

  return (
    <div
      className={cn(
        'rounded-lg border-2 bg-card p-3 shadow-lg min-w-[270px]',
        selected ? 'border-primary' : 'border-pink-500'
      )}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!bg-pink-500 !border-pink-600"
      />

      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border">
        <BarChart3 className="w-4 h-4 text-pink-500" />
        <h3 className="font-bold text-sm text-pink-500">Histograma</h3>
      </div>

      <div className="space-y-2">
        <canvas
          ref={canvasRef}
          className="w-full border border-border rounded"
        />
        <div className="text-xs text-muted-foreground text-center">
          Distribuição de intensidades (0-255)
        </div>
      </div>
    </div>
  )
}
