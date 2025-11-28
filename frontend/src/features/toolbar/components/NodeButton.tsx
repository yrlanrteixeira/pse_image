import { Button } from '@/components/ui/button'
import type { LucideIcon } from 'lucide-react'
import type { NodeType } from '@/types'
import { NODE_COLORS } from '@/types'

interface NodeButtonProps {
  type: NodeType
  icon: LucideIcon
  label: string
  onClick: (type: NodeType) => void
}

export function NodeButton({ type, icon: Icon, label, onClick }: NodeButtonProps) {
  return (
    <Button onClick={() => onClick(type)} size="sm" variant="outline">
      <Icon className="w-4 h-4 mr-1" style={{ color: NODE_COLORS[type] }} />
      {label}
    </Button>
  )
}
