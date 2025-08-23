import React from 'react'
import { Badge } from './badge'
import { cva } from 'class-variance-authority'

// Documentação das cores padrão para badges de status
// Estas cores seguem o padrão oficial solicitado pelo cliente
// 
// Pago (Sucesso): Verde Escuro (#28a745) - Cor universal para sucesso, conclusão e confirmação
// Vencido (Alerta): Vermelho Escuro (#dc3545) - Cor para perigo, erro e urgência
// Pendente (Aguardando): Laranja Vibrante (#fd7e14) - Cor para cautela ou estado de espera
// Parcial (Em Andamento): Azul Turquesa (#17a2b8) - Cor neutra para processo em andamento
// Cancelado (Inativo): Cinza Escuro (#6c757d) - Cor para itens inativos ou desconsiderados

const statusBadgeVariants = cva('', {
 variants: {
  variant: {
   success: 'status-success',
   danger: 'status-danger',
   warning: 'status-warning',
   info: 'status-info',
   muted: 'status-muted',
  },
 },
 defaultVariants: {
  variant: 'muted',
 },
})

interface StatusBadgeProps {
 variant?: 'success' | 'danger' | 'warning' | 'info' | 'muted'
 children: React.ReactNode
}

export function StatusBadge({ variant = 'muted', children }: StatusBadgeProps) {
 return (
  <span className={statusBadgeVariants({ variant })}>
   {children}
  </span>
 )
}

// Função auxiliar para obter o variant correto com base no status
export function getFinancialStatusBadge(status: string) {
 switch (status.toUpperCase()) {
  case 'PAID':
   return 'success'
  case 'OVERDUE':
   return 'danger'
  case 'PENDING':
   return 'warning'
  case 'PARTIAL':
   return 'info'
  case 'CANCELLED':
   return 'muted'
  default:
   return 'muted'
 }
}