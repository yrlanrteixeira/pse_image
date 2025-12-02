import { useState, useCallback } from 'react'

interface DialogState {
    isOpen: boolean
    title: string
    description: string
}

export function useDialog() {
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

    return {
        dialog,
        showDialog,
        closeDialog,
    }
}

