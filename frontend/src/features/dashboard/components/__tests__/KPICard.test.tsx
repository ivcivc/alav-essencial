import { describe, it, expect } from 'vitest'
import { render, screen } from '@/test/utils'
import { KPICard } from '../KPICard'
import { Calendar, DollarSign } from 'lucide-react'

describe('KPICard', () => {
  it('should render basic KPI card with title and value', () => {
    render(
      <KPICard
        title="Total Agendamentos"
        value={25}
        description="agendamentos hoje"
      />
    )

    expect(screen.getByText('Total Agendamentos')).toBeInTheDocument()
    expect(screen.getByText('25')).toBeInTheDocument()
    expect(screen.getByText('agendamentos hoje')).toBeInTheDocument()
  })

  it('should render currency formatted value', () => {
    render(
      <KPICard
        title="Receita do Mês"
        value={1500.50}
        format="currency"
        description="lucro líquido"
      />
    )

    expect(screen.getByText('R$ 1.500,50')).toBeInTheDocument()
  })

  it('should render percentage formatted value', () => {
    render(
      <KPICard
        title="Taxa de Conclusão"
        value={85.5}
        format="percentage"
        description="taxa média"
      />
    )

    expect(screen.getByText('85.5%')).toBeInTheDocument()
  })

  it('should render with icon', () => {
    render(
      <KPICard
        title="Agendamentos"
        value={10}
        icon={<Calendar data-testid="calendar-icon" />}
      />
    )

    expect(screen.getByTestId('calendar-icon')).toBeInTheDocument()
  })

  it('should render positive trend', () => {
    render(
      <KPICard
        title="Receita"
        value={1000}
        trend={{
          value: 15,
          isPositive: true,
          label: 'vs mês anterior'
        }}
      />
    )

    expect(screen.getByText('+15 vs mês anterior')).toBeInTheDocument()
  })

  it('should render negative trend', () => {
    render(
      <KPICard
        title="Cancelamentos"
        value={5}
        trend={{
          value: -2,
          isPositive: false,
          label: 'vs semana anterior'
        }}
      />
    )

    expect(screen.getByText('-2 vs semana anterior')).toBeInTheDocument()
  })

  it('should show loading state', () => {
    render(
      <KPICard
        title="Carregando"
        value={0}
        isLoading={true}
      />
    )

    expect(screen.getByText('...')).toBeInTheDocument()
  })

  it('should apply custom className', () => {
    const { container } = render(
      <KPICard
        title="Test"
        value={1}
        className="custom-class"
      />
    )

    expect(container.firstChild).toHaveClass('custom-class')
  })
})
