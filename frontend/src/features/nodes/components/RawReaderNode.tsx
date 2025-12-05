import { Handle, Position, type NodeProps } from 'reactflow'
import { useState } from 'react'
import { FileText, Image as ImageIcon } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { useDialog } from '@/hooks/useDialog'
import type { RawReaderNodeData } from '@/types'
import { cn } from '@/lib/utils'
import { uploadRawFile } from '@/lib/api'

export default function RawReaderNode({ data, id, selected }: NodeProps<RawReaderNodeData>) {
  const [width, setWidth] = useState(data.width || 512)
  const [height, setHeight] = useState(data.height || 512)
  const [loading, setLoading] = useState(false)
  const { dialog, showDialog, closeDialog } = useDialog()

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setLoading(true)
    try {
      const filename = file.name.toLowerCase()
      const isRawOrTxtFile = filename.endsWith('.raw') || filename.endsWith('.txt')

      if (isRawOrTxtFile) {
        // Arquivo RAW ou TXT: enviar ao backend para processamento
        // O backend tentará ler como texto primeiro, depois como binário
        try {
          const result = await uploadRawFile(file, width, height)

          // Backend retorna automaticamente as dimensões e dados
          setWidth(result.width)
          setHeight(result.height)

          data.onChange?.(id, {
            imageData: result.data,
            width: result.width,
            height: result.height,
            filename: file.name,
          } as Partial<RawReaderNodeData>)
        } catch (error) {
          console.error('Erro ao processar arquivo:', error)
          showDialog(
            'Erro ao processar arquivo',
            error instanceof Error ? error.message : 'Erro ao processar arquivo RAW/TXT'
          )
          return
        }
      } else {
        // Formato de imagem comum: enviar ao backend para conversão
        try {
          const result = await uploadRawFile(file)

          // Backend retorna automaticamente as dimensões e dados convertidos
          setWidth(result.width)
          setHeight(result.height)

          data.onChange?.(id, {
            imageData: result.data,
            width: result.width,
            height: result.height,
            filename: file.name,
          } as Partial<RawReaderNodeData>)
        } catch (error) {
          console.error('Erro ao converter imagem:', error)
          showDialog(
            'Erro ao converter imagem',
            error instanceof Error ? error.message : 'Erro ao converter imagem'
          )
          return
        }
      }
    } catch (error) {
      console.error('Erro ao ler arquivo:', error)
      showDialog('Erro ao processar arquivo', 'Ocorreu um erro ao processar o arquivo selecionado.')
    } finally {
      setLoading(false)
    }
  }

  const handleDimensionChange = (newWidth: number, newHeight: number) => {
    setWidth(newWidth)
    setHeight(newHeight)
    data.onChange?.(id, { width: newWidth, height: newHeight } as Partial<RawReaderNodeData>)
  }

  return (
    <div
      className={cn(
        'rounded-lg border-2 bg-card p-3 shadow-lg min-w-[220px]',
        selected ? 'border-primary' : 'border-green-500'
      )}
    >
      <Handle
        type="source"
        position={Position.Right}
        className="!bg-green-500 !border-green-600"
      />

      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border">
        <ImageIcon className="w-4 h-4 text-green-500" />
        <h3 className="font-bold text-sm text-green-500">Leitura de Imagem</h3>
      </div>

      <div className="space-y-3 text-xs">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label htmlFor={`width-${id}`} className="text-xs text-muted-foreground">
              Largura
            </Label>
            <Input
              id={`width-${id}`}
              type="number"
              value={width}
              onChange={(e) => handleDimensionChange(parseInt(e.target.value) || 0, height)}
              className="h-8 text-xs"
              min={1}
            />
          </div>
          <div>
            <Label htmlFor={`height-${id}`} className="text-xs text-muted-foreground">
              Altura
            </Label>
            <Input
              id={`height-${id}`}
              type="number"
              value={height}
              onChange={(e) => handleDimensionChange(width, parseInt(e.target.value) || 0)}
              className="h-8 text-xs"
              min={1}
            />
          </div>
        </div>

        <div>
          <Label htmlFor={`file-${id}`} className="text-xs text-muted-foreground">
            Arquivo de Imagem
          </Label>
          <Input
            id={`file-${id}`}
            type="file"
            accept=".raw,.txt,.jpg,.jpeg,.png,.bmp,.tiff,.tif,.gif,.webp"
            onChange={handleFileChange}
            className="h-8 text-xs cursor-pointer"
            disabled={loading}
          />
          <p className="text-[10px] text-muted-foreground mt-1">
            RAW (texto/binário), TXT, JPG, PNG, BMP, TIFF, GIF, WebP
          </p>
        </div>

        {data.filename && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground bg-secondary p-2 rounded">
            <FileText className="w-3 h-3" />
            <span className="truncate">{data.filename}</span>
          </div>
        )}

        {data.imageData && (
          <div className="text-xs text-green-500 font-medium">
            ✓ {width}×{height} ({data.imageData.length} pixels)
          </div>
        )}
      </div>

      <Dialog open={dialog.isOpen} onOpenChange={closeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dialog.title}</DialogTitle>
            <DialogDescription>{dialog.description}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={closeDialog}>OK</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
