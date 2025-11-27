import { Handle, Position, type NodeProps } from 'reactflow'
import { useEffect, useRef } from 'react'
import { Eye, ImageIcon } from 'lucide-react'
import type { DisplayNodeData } from '@/types'
import { cn } from '@/lib/utils'

export default function DisplayNode({ data, selected }: NodeProps<DisplayNodeData>) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!data.imageData || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const { width, height, data: pixels } = data.imageData

    canvas.width = width
    canvas.height = height

    const imageData = ctx.createImageData(width, height)

    for (let i = 0; i < pixels.length; i++) {
      const pixelValue = pixels[i]
      imageData.data[i * 4] = pixelValue     // R
      imageData.data[i * 4 + 1] = pixelValue // G
      imageData.data[i * 4 + 2] = pixelValue // B
      imageData.data[i * 4 + 3] = 255        // A
    }

    ctx.putImageData(imageData, 0, 0)
  }, [data.imageData])

  return (
    <div
      className={cn(
        'rounded-lg border-2 bg-card p-3 shadow-lg min-w-[220px]',
        selected ? 'border-primary' : 'border-purple-500'
      )}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!bg-purple-500 !border-purple-600"
      />

      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border">
        <Eye className="w-4 h-4 text-purple-500" />
        <h3 className="font-bold text-sm text-purple-500">Exibir Imagem</h3>
      </div>

      <div className="space-y-2">
        {data.imageData ? (
          <>
            <canvas
              ref={canvasRef}
              className="w-full border border-border rounded bg-secondary"
              style={{
                maxWidth: '200px',
                maxHeight: '200px',
                imageRendering: 'pixelated',
              }}
            />
            <div className="text-xs text-muted-foreground text-center">
              {data.imageData.width} × {data.imageData.height}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
            <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
            <p className="text-xs">Aguardando processamento</p>
          </div>
        )}
      </div>
    </div>
  )
}
