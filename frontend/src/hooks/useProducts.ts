import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  productsService, 
  categoriesService,
  ProductServiceFilters,
  CategoryFilters,
  CreateProductServiceData,
  UpdateProductServiceData,
  StockUpdateData,
  CreateCategoryData,
  UpdateCategoryData
} from '../services/products'
import { ProductServiceWithRelations, Category, ServiceType } from '../types'
import { useToast } from './useToast'

// Products/Services hooks
export const useProducts = (filters: ProductServiceFilters = {}) => {
  const { toast } = useToast()

  return useQuery({
    queryKey: ['products', filters],
    queryFn: () => productsService.getAll(filters),
    onError: (error: any) => {
      toast({
        title: 'Erro ao carregar produtos/serviços',
        description: error.message || 'Ocorreu um erro inesperado',
        variant: 'destructive'
      })
    }
  })
}

export const useProductSearch = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchFilters, setSearchFilters] = useState<Omit<ProductServiceFilters, 'q'>>({})
  const { toast } = useToast()

  const searchResults = useQuery({
    queryKey: ['products-search', searchQuery, searchFilters],
    queryFn: () => productsService.search(searchQuery, searchFilters),
    enabled: searchQuery.length > 0,
    onError: (error: any) => {
      toast({
        title: 'Erro na busca',
        description: error.message || 'Ocorreu um erro inesperado',
        variant: 'destructive'
      })
    }
  })

  return {
    searchQuery,
    setSearchQuery,
    searchFilters,
    setSearchFilters,
    searchResults: searchResults.data,
    isSearching: searchResults.isLoading,
    searchError: searchResults.error
  }
}

export const useProduct = (id: string) => {
  const { toast } = useToast()

  return useQuery({
    queryKey: ['product', id],
    queryFn: () => productsService.getById(id),
    enabled: !!id,
    onError: (error: any) => {
      toast({
        title: 'Erro ao carregar produto/serviço',
        description: error.message || 'Ocorreu um erro inesperado',
        variant: 'destructive'
      })
    }
  })
}

export const useBookableServices = (filters: Pick<ProductServiceFilters, 'page' | 'limit' | 'q' | 'categoryId'> = {}) => {
  const { toast } = useToast()

  return useQuery({
    queryKey: ['bookable-services', filters],
    queryFn: () => productsService.getBookableServices(filters),
    onError: (error: any) => {
      toast({
        title: 'Erro ao carregar serviços disponíveis',
        description: error.message || 'Ocorreu um erro inesperado',
        variant: 'destructive'
      })
    }
  })
}

export const useLowStockProducts = () => {
  const { toast } = useToast()

  return useQuery({
    queryKey: ['low-stock-products'],
    queryFn: () => productsService.getLowStockProducts(),
    onError: (error: any) => {
      toast({
        title: 'Erro ao carregar produtos com estoque baixo',
        description: error.message || 'Ocorreu um erro inesperado',
        variant: 'destructive'
      })
    }
  })
}

export const useStockReport = () => {
  const { toast } = useToast()

  return useQuery({
    queryKey: ['stock-report'],
    queryFn: () => productsService.getStockReport(),
    onError: (error: any) => {
      toast({
        title: 'Erro ao carregar relatório de estoque',
        description: error.message || 'Ocorreu um erro inesperado',
        variant: 'destructive'
      })
    }
  })
}

export const useProductsByCategory = (categoryId: string, filters: Omit<ProductServiceFilters, 'categoryId'> = {}) => {
  const { toast } = useToast()

  return useQuery({
    queryKey: ['products-by-category', categoryId, filters],
    queryFn: () => productsService.getByCategory(categoryId, filters),
    enabled: !!categoryId,
    onError: (error: any) => {
      toast({
        title: 'Erro ao carregar produtos/serviços da categoria',
        description: error.message || 'Ocorreu um erro inesperado',
        variant: 'destructive'
      })
    }
  })
}

export const useCreateProduct = () => {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (data: CreateProductServiceData) => productsService.create(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({ queryKey: ['stock-report'] })
      toast({
        title: 'Sucesso',
        description: response.message || 'Produto/serviço criado com sucesso'
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao criar produto/serviço',
        description: error.message || 'Ocorreu um erro inesperado',
        variant: 'destructive'
      })
    }
  })
}

export const useUpdateProduct = () => {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProductServiceData }) => 
      productsService.update(id, data),
    onSuccess: (response, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({ queryKey: ['product', id] })
      queryClient.invalidateQueries({ queryKey: ['stock-report'] })
      toast({
        title: 'Sucesso',
        description: response.message || 'Produto/serviço atualizado com sucesso'
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao atualizar produto/serviço',
        description: error.message || 'Ocorreu um erro inesperado',
        variant: 'destructive'
      })
    }
  })
}

export const useUpdateStock = () => {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: StockUpdateData }) => 
      productsService.updateStock(id, data),
    onSuccess: (response, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({ queryKey: ['product', id] })
      queryClient.invalidateQueries({ queryKey: ['stock-report'] })
      queryClient.invalidateQueries({ queryKey: ['low-stock-products'] })
      toast({
        title: 'Sucesso',
        description: response.message || 'Estoque atualizado com sucesso'
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao atualizar estoque',
        description: error.message || 'Ocorreu um erro inesperado',
        variant: 'destructive'
      })
    }
  })
}

export const useDeleteProduct = () => {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (id: string) => productsService.delete(id),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({ queryKey: ['stock-report'] })
      queryClient.invalidateQueries({ queryKey: ['low-stock-products'] })
      toast({
        title: 'Sucesso',
        description: response.message || 'Produto/serviço removido com sucesso'
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao remover produto/serviço',
        description: error.message || 'Ocorreu um erro inesperado',
        variant: 'destructive'
      })
    }
  })
}

// Categories hooks
export const useCategories = (filters: CategoryFilters = {}) => {
  const { toast } = useToast()

  return useQuery({
    queryKey: ['categories', filters],
    queryFn: async () => {
      console.log('🔍 useCategories: Fazendo chamada para API com filtros:', filters)
      try {
        const result = await categoriesService.getAll(filters)
        console.log('🔍 useCategories: Resultado da API:', result)
        console.log('🔍 useCategories: Tipo do resultado:', typeof result)
        console.log('🔍 useCategories: Estrutura:', {
          hasCategories: !!(result?.categories),
          categoriesCount: result?.categories?.length || 0,
          total: result?.total
        })
        return result
      } catch (error) {
        console.log('🔍 useCategories: Erro na queryFn:', error)
        throw error
      }
    },
    onSuccess: (data) => {
      console.log('🔍 useCategories: onSuccess chamado:', data)
    },
    onError: (error: any) => {
      console.log('🔍 useCategories: onError chamado:', error)
      toast({
        title: 'Erro ao carregar categorias',
        description: error.message || 'Ocorreu um erro inesperado',
        variant: 'destructive'
      })
    },
    retry: false, // Desabilitar retry para debug
    refetchOnWindowFocus: false // Desabilitar refetch automático
  })
}

export const useCategorySearch = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchFilters, setSearchFilters] = useState<Omit<CategoryFilters, 'q'>>({})
  const { toast } = useToast()

  const searchResults = useQuery({
    queryKey: ['categories-search', searchQuery, searchFilters],
    queryFn: () => categoriesService.search(searchQuery, searchFilters),
    enabled: searchQuery.length > 0,
    onError: (error: any) => {
      toast({
        title: 'Erro na busca de categorias',
        description: error.message || 'Ocorreu um erro inesperado',
        variant: 'destructive'
      })
    }
  })

  return {
    searchQuery,
    setSearchQuery,
    searchFilters,
    setSearchFilters,
    searchResults: searchResults.data,
    isSearching: searchResults.isLoading,
    searchError: searchResults.error
  }
}

export const useCategory = (id: string) => {
  const { toast } = useToast()

  return useQuery({
    queryKey: ['category', id],
    queryFn: () => categoriesService.getById(id),
    enabled: !!id,
    onError: (error: any) => {
      toast({
        title: 'Erro ao carregar categoria',
        description: error.message || 'Ocorreu um erro inesperado',
        variant: 'destructive'
      })
    }
  })
}

export const useCreateCategory = () => {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (data: CreateCategoryData) => categoriesService.create(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      toast({
        title: 'Sucesso',
        description: response.message || 'Categoria criada com sucesso'
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao criar categoria',
        description: error.message || 'Ocorreu um erro inesperado',
        variant: 'destructive'
      })
    }
  })
}

export const useUpdateCategory = () => {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCategoryData }) => 
      categoriesService.update(id, data),
    onSuccess: (response, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      queryClient.invalidateQueries({ queryKey: ['category', id] })
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast({
        title: 'Sucesso',
        description: response.message || 'Categoria atualizada com sucesso'
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao atualizar categoria',
        description: error.message || 'Ocorreu um erro inesperado',
        variant: 'destructive'
      })
    }
  })
}

export const useDeleteCategory = () => {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (id: string) => categoriesService.delete(id),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast({
        title: 'Sucesso',
        description: response.message || 'Categoria removida com sucesso'
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao remover categoria',
        description: error.message || 'Ocorreu um erro inesperado',
        variant: 'destructive'
      })
    }
  })
}