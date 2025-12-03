import { Handle, Position, type NodeProps } from 'reactflow'
import { useEffect, useRef, useState } from 'react'
import { Eye, ImageIcon } from 'lucide-react'
import type { DisplayNodeData } from '@/types'
import { cn } from '@/lib/utils'

export default function DisplayNode({ data, selected }: NodeProps<DisplayNodeData>) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [displaySize, setDisplaySize] = useState({ width: 0, height: 0 })

  // Debug: verificar os dados que chegam
  console.log('DisplayNode data:', data)

  useEffect(() => {
    console.log('DisplayNode useEffect triggered. imageData:', data.imageData)

    if (!data.imageData || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const { width, height, data: pixels } = data.imageData

    console.log('Rendering image:', { width, height, pixelsLength: pixels.length })

    canvas.width = width
    canvas.height = height

    // Calcular dimensões de exibição mantendo aspect ratio
    const maxSize = 200
    const aspectRatio = width / height

    let displayWidth: number
    let displayHeight: number

    if (width > height) {
      // Imagem mais larga que alta
      displayWidth = maxSize
      displayHeight = maxSize / aspectRatio
    } else {
      // Imagem mais alta que larga (ou quadrada)
      displayHeight = maxSize
      displayWidth = maxSize * aspectRatio
    }

    setDisplaySize({ width: displayWidth, height: displayHeight })

    const imageData = ctx.createImageData(width, height)

    for (let i = 0; i < pixels.length; i++) {
      const pixelValue = pixels[i]
      imageData.data[i * 4] = pixelValue     // R
      imageData.data[i * 4 + 1] = pixelValue // G
      imageData.data[i * 4 + 2] = pixelValue // B
      imageData.data[i * 4 + 3] = 255        // A
    }

    ctx.putImageData(imageData, 0, 0)
    console.log('Image rendered successfully with display size:', { displayWidth, displayHeight })
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
              className="border border-border rounded bg-secondary"
              style={{
                width: `${displaySize.width}px`,
                height: `${displaySize.height}px`,
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

      <Handle
        type="source"
        position={Position.Right}
        className="!bg-purple-500 !border-purple-600"
      />
    </div>
  )
}
