import { Handle, Position, type NodeProps } from 'reactflow'
import { useState } from 'react'
import { Save, Download } from 'lucide-react'
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
import type { SaveNodeData } from '@/types'
import { cn } from '@/lib/utils'

export default function SaveNode({ data, id, selected }: NodeProps<SaveNodeData>) {
  const [filename, setFilename] = useState(data.filename || 'output.raw')
  const { dialog, showDialog, closeDialog } = useDialog()

  const handleFilenameChange = (newFilename: string) => {
    setFilename(newFilename)
    data.onChange?.(id, { ...data, filename: newFilename })
  }

  const handleSave = () => {
    if (!data.imageData) {
      showDialog(
        'Nenhuma imagem para salvar',
        'Execute o processamento primeiro para gerar uma imagem.'
      )
      return
    }

    const { data: pixels } = data.imageData
    const uint8Array = new Uint8Array(pixels)
    const blob = new Blob([uint8Array], { type: 'application/octet-stream' })

    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div
      className={cn(
        'rounded-lg border-2 bg-card p-3 shadow-lg min-w-[220px]',
        selected ? 'border-primary' : 'border-green-600'
      )}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!bg-green-600 !border-green-700"
      />

      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border">
        <Save className="w-4 h-4 text-green-600" />
        <h3 className="font-bold text-sm text-green-600">Salvar RAW</h3>
      </div>

      <div className="space-y-3 text-xs">
        <div>
          <Label htmlFor={`filename-${id}`} className="text-xs text-muted-foreground">
            Nome do arquivo
          </Label>
          <Input
            id={`filename-${id}`}
            type="text"
            value={filename}
            onChange={(e) => handleFilenameChange(e.target.value)}
            className="h-8 text-xs"
            placeholder="output.raw"
          />
        </div>

        <Button
          onClick={handleSave}
          disabled={!data.imageData}
          className="w-full h-8 text-xs"
          variant={data.imageData ? 'default' : 'secondary'}
        >
          <Download className="w-3 h-3 mr-1" />
          Baixar Arquivo
        </Button>

        {data.imageData && (
          <div className="text-xs text-green-600 font-medium bg-secondary p-2 rounded">
            ✓ Pronto para salvar ({data.imageData.width} × {data.imageData.height})
          </div>
        )}

        {!data.imageData && (
          <div className="text-xs text-muted-foreground text-center">
            Execute o processamento primeiro
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
