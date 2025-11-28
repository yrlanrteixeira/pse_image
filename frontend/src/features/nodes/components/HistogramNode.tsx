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

    // Detectar tema (dark ou light)
    const isDark = document.documentElement.classList.contains('dark')

    // Limpar com cor de fundo apropriada
    ctx.fillStyle = isDark ? '#0f172a' : '#ffffff'  // slate-900 / white
    ctx.fillRect(0, 0, width, height)

    // Grid horizontal ANTES das barras
    ctx.strokeStyle = isDark ? '#334155' : '#e2e8f0'  // slate-700 / slate-200
    ctx.lineWidth = 1
    for (let i = 30; i < height; i += 30) {
      ctx.beginPath()
      ctx.moveTo(0, i)
      ctx.lineTo(width, i)
      ctx.stroke()
    }

    // Encontrar máximo para normalização
    const maxCount = Math.max(...data.histogram, 1)

    // Desenhar barras com cor rosa/pink vibrante
    ctx.fillStyle = isDark ? '#f472b6' : '#ec4899'  // pink-400 / pink-500
    for (let i = 0; i < 256; i++) {
      const barHeight = (data.histogram[i] / maxCount) * (height - 10)
      if (barHeight > 0) {
        ctx.fillRect(i, height - barHeight, 1, barHeight)
      }
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
