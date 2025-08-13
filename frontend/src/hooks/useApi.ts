import { useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../services/api'

export function useApi() {
  const queryClient = useQueryClient()

  const invalidateQueries = (queryKey: string[]) => {
    queryClient.invalidateQueries({ queryKey })
  }

  return {
    queryClient,
    invalidateQueries,
    apiClient,
  }
}