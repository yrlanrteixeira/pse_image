import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/features/theme'
import {
  Upload,
  Grid3x3,
  Sparkles,
  Eye,
  BarChart3,
  Minus,
  Save,
  Play,
  Trash2,
} from 'lucide-react'
import { NodeButton } from './NodeButton'
import type { NodeType } from '@/types'

interface ToolbarProps {
  onAddNode: (type: NodeType) => void
  onProcess: () => void
  onClear: () => void
  isProcessing: boolean
}

export function Toolbar({ onAddNode, onProcess, onClear, isProcessing }: ToolbarProps) {
  return (
    <div className="border-b border-border bg-card shadow-sm">
      <div className="flex items-center gap-2 p-2 flex-wrap">
        <div className="flex items-center gap-2 px-2 border-r border-border">
          <h1 className="text-lg font-bold">PSE-Image</h1>
          <span className="text-xs text-muted-foreground">
            Problem-Solving Environment
          </span>
        </div>

        <NodeButton
          type="RAW_READER"
          icon={Upload}
          label="Leitura RAW"
          onClick={onAddNode}
        />

        <NodeButton
          type="CONVOLUTION"
          icon={Grid3x3}
          label="Convolução"
          onClick={onAddNode}
        />

        <NodeButton
          type="POINT_OP"
          icon={Sparkles}
          label="Op. Pontual"
          onClick={onAddNode}
        />

        <NodeButton
          type="DISPLAY"
          icon={Eye}
          label="Exibir"
          onClick={onAddNode}
        />

        <NodeButton
          type="HISTOGRAM"
          icon={BarChart3}
          label="Histograma"
          onClick={onAddNode}
        />

        <NodeButton
          type="DIFFERENCE"
          icon={Minus}
          label="Diferença"
          onClick={onAddNode}
        />

        <NodeButton
          type="SAVE"
          icon={Save}
          label="Salvar"
          onClick={onAddNode}
        />

        <div className="flex-1" />

        <Button
          onClick={onProcess}
          disabled={isProcessing}
          size="sm"
          className="font-bold"
        >
          <Play className="w-4 h-4 mr-1" />
          {isProcessing ? 'Processando...' : 'Processar'}
        </Button>

        <Button onClick={onClear} size="sm" variant="destructive">
          <Trash2 className="w-4 h-4 mr-1" />
          Limpar tudo
        </Button>

        <ThemeToggle />
      </div>
    </div>
  )
}
