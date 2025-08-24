import { describe, it, expect } from 'vitest'
import { render, screen } from '@/test/utils'
import { StatusBadge, getFinancialStatusBadge } from '../status-badge'

describe('StatusBadge', () => {
  it('should render with success variant', () => {
    render(<StatusBadge variant="success">Sucesso</StatusBadge>)
    
    const badge = screen.getByText('Sucesso')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveClass('status-success')
  })

  it('should render warning variant', () => {
    render(<StatusBadge variant="warning">Aviso</StatusBadge>)
    
    const badge = screen.getByText('Aviso')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveClass('status-warning')
  })

  it('should render danger variant', () => {
    render(<StatusBadge variant="danger">Erro</StatusBadge>)
    
    const badge = screen.getByText('Erro')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveClass('status-danger')
  })

  it('should render info variant', () => {
    render(<StatusBadge variant="info">Info</StatusBadge>)
    
    const badge = screen.getByText('Info')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveClass('status-info')
  })

  it('should render muted variant', () => {
    render(<StatusBadge variant="muted">Desabilitado</StatusBadge>)
    
    const badge = screen.getByText('Desabilitado')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveClass('status-muted')
  })

  it('should render with default muted variant when no variant specified', () => {
    render(<StatusBadge>Padrão</StatusBadge>)
    
    const badge = screen.getByText('Padrão')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveClass('status-muted')
  })
})

describe('getFinancialStatusBadge', () => {
  it('should return correct variant for PAID status', () => {
    const result = getFinancialStatusBadge('PAID')
    
    expect(result).toBe('success')
  })

  it('should return correct variant for PENDING status', () => {
    const result = getFinancialStatusBadge('PENDING')
    
    expect(result).toBe('warning')
  })

  it('should return correct variant for OVERDUE status', () => {
    const result = getFinancialStatusBadge('OVERDUE')
    
    expect(result).toBe('danger')
  })

  it('should return correct variant for CANCELLED status', () => {
    const result = getFinancialStatusBadge('CANCELLED')
    
    expect(result).toBe('muted')
  })

  it('should return correct variant for PARTIAL status', () => {
    const result = getFinancialStatusBadge('PARTIAL')
    
    expect(result).toBe('info')
  })

  it('should return muted variant for unknown status', () => {
    const result = getFinancialStatusBadge('UNKNOWN')
    
    expect(result).toBe('muted')
  })

  it('should handle lowercase status', () => {
    const result = getFinancialStatusBadge('paid')
    
    expect(result).toBe('success')
  })
})
