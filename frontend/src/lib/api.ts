import axios from 'axios'
import type { PSENode, PSEEdge, ProcessResponse } from '@/types'

const API_URL = 'http://localhost:8000'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export async function processGraph(
  nodes: PSENode[],
  edges: PSEEdge[]
): Promise<ProcessResponse> {
  try {
    const response = await api.post<ProcessResponse>('/process', {
      nodes,
      edges,
    })

    return response.data
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.detail || 'Erro ao processar grafo')
    }
    throw error
  }
}

export async function uploadRawFile(
  file: File,
  width: number,
  height: number
): Promise<{ width: number; height: number; data: number[] }> {
  try {
    const formData = new FormData()
    formData.append('file', file)

    const response = await api.post(
      `/upload-raw?width=${width}&height=${height}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    )

    return response.data
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.detail || 'Erro ao fazer upload do arquivo')
    }
    throw error
  }
}

export async function checkHealth(): Promise<{ status: string }> {
  try {
    const response = await api.get('/health')
    return response.data
  } catch (error) {
    throw new Error('Backend não está respondendo')
  }
}
