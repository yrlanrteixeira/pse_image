import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { toast } from '@/components/ui/use-toast'

interface DialogState {
    isOpen: boolean
    title: string
    description: string
}

interface NotificationContextType {
    showDialog: (title: string, description: string) => void
    showToast: (title: string, description?: string) => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: ReactNode }) {
    const [dialog, setDialog] = useState<DialogState>({
        isOpen: false,
        title: '',
        description: '',
    })

    const showDialog = useCallback((title: string, description: string) => {
        setDialog({
            isOpen: true,
            title,
            description,
        })
    }, [])

    const closeDialog = useCallback(() => {
        setDialog((prev) => ({ ...prev, isOpen: false }))
    }, [])

    const showToast = useCallback((title: string, description?: string) => {
        toast({
            title,
            description,
            variant: 'success',
            duration: 3000,
        })
    }, [])

    return (
        <NotificationContext.Provider value={{ showDialog, showToast }}>
            {children}

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
        </NotificationContext.Provider>
    )
}

export function useNotification() {
    const context = useContext(NotificationContext)
    if (!context) {
        throw new Error('useNotification must be used within NotificationProvider')
    }
    return context
}

