import { Handle, Position, type NodeProps } from 'reactflow'
import { useEffect, useRef, useState } from 'react'
import { BarChart3 } from 'lucide-react'
import type { HistogramNodeData } from '@/types'
import { cn } from '@/lib/utils'

export default function HistogramNode({ data, selected }: NodeProps<HistogramNodeData>) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [tooltip, setTooltip] = useState<{ x: number; y: number; value: number; index: number } | null>(null)

  useEffect(() => {
    if (!data.histogram || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = 256
    const height = 180
    const graphHeight = 140 // Altura para o gráfico, deixando espaço para labels

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
    for (let i = 25; i < graphHeight; i += 25) {
      ctx.beginPath()
      ctx.moveTo(0, i)
      ctx.lineTo(width, i)
      ctx.stroke()
    }

    // Encontrar máximo para normalização
    const maxCount = Math.max(...data.histogram, 1)
    const nonZeroCount = data.histogram.filter(v => v > 0).length

    // Se houver poucos valores únicos, desenhar como barras grossas
    const useBars = nonZeroCount <= 20
    const barWidth = useBars ? Math.max(3, Math.floor(width / 100)) : 1

    if (useBars) {
      // Desenhar como barras verticais grossas
      for (let i = 0; i < 256; i++) {
        if (data.histogram[i] > 0) {
          const barHeight = (data.histogram[i] / maxCount) * (graphHeight - 10)
          const x = i
          const y = graphHeight - barHeight

          // Desenhar barra
          ctx.fillStyle = isDark ? '#64748b' : '#94a3b8'
          ctx.fillRect(x - barWidth / 2, y, barWidth, barHeight)

          // Contorno da barra
          ctx.strokeStyle = isDark ? '#475569' : '#64748b'
          ctx.lineWidth = 1
          ctx.strokeRect(x - barWidth / 2, y, barWidth, barHeight)
        }
      }
    } else {
      // Desenhar como área preenchida (código original)
      // Desenhar como área preenchida (código original)
      ctx.beginPath()
      ctx.moveTo(0, graphHeight)

      for (let i = 0; i < 256; i++) {
        const barHeight = (data.histogram[i] / maxCount) * (graphHeight - 10)
        ctx.lineTo(i, graphHeight - barHeight)
      }

      ctx.lineTo(255, graphHeight)
      ctx.closePath()

      // Preencher área com cor cinza
      ctx.fillStyle = isDark ? '#64748b' : '#94a3b8'  // slate-500 / slate-400
      ctx.fill()

      // Adicionar contorno na parte superior
      ctx.strokeStyle = isDark ? '#475569' : '#64748b'  // slate-600 / slate-500
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(0, graphHeight)
      for (let i = 0; i < 256; i++) {
        const barHeight = (data.histogram[i] / maxCount) * (graphHeight - 10)
        ctx.lineTo(i, graphHeight - barHeight)
      }
      ctx.stroke()
    }

    // Adicionar labels no eixo X
    ctx.fillStyle = isDark ? '#94a3b8' : '#64748b'  // slate-400 / slate-500
    ctx.font = '9px sans-serif'
    ctx.textAlign = 'center'

    const labels = [
      { text: 'muito\nescuro', x: 25 },
      { text: 'escuro', x: 75 },
      { text: 'médio', x: 130 },
      { text: 'claro', x: 185 },
      { text: 'muito\nclaro', x: 235 }
    ]

    labels.forEach(label => {
      const lines = label.text.split('\n')
      lines.forEach((line, i) => {
        ctx.fillText(line, label.x, graphHeight + 15 + (i * 10))
      })
    })

    // Adicionar linhas divisórias no eixo X
    ctx.strokeStyle = isDark ? '#334155' : '#e2e8f0'
    ctx.lineWidth = 1
    const divisions = [0, 51, 102, 153, 204, 255]
    divisions.forEach(x => {
      ctx.beginPath()
      ctx.moveTo(x, graphHeight)
      ctx.lineTo(x, graphHeight + 5)
      ctx.stroke()
    })
  }, [data.histogram])

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !data.histogram) return

    const rect = canvasRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left

    // Converter posição do mouse para índice do histograma
    const index = Math.floor(x)

    if (index >= 0 && index < 256) {
      setTooltip({
        x: e.clientX,
        y: e.clientY,
        value: data.histogram[index],
        index
      })
    }
  }

  const handleMouseLeave = () => {
    setTooltip(null)
  }

  return (
    <>
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
            className="w-full border border-border rounded cursor-crosshair"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          />
          <div className="text-xs text-muted-foreground text-center">
            Distribuição de intensidades (0-255)
          </div>
        </div>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="fixed pointer-events-none z-50 px-2 py-1 text-xs rounded shadow-lg bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900"
          style={{
            left: `${tooltip.x + 10}px`,
            top: `${tooltip.y - 30}px`,
          }}
        >
          <div className="font-semibold">{tooltip.value.toLocaleString('pt-BR')} pixels</div>
          <div className="text-[10px] opacity-80">intensidade: {tooltip.index}</div>
        </div>
      )}
    </>
  )
}
