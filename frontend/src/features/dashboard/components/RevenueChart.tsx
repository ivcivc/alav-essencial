import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts'

interface RevenueChartProps {
  dailyData?: Array<{
    date: string
    revenue: number
    expenses: number
    profit: number
  }>
  categoryData?: Array<{
    category: string
    amount: number
    percentage: number
  }>
  isLoading?: boolean
}

const CATEGORY_COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
  '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6b7280'
]

export function RevenueChart({ dailyData, categoryData, isLoading }: RevenueChartProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Receitas e Despesas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] flex items-center justify-center">
              <div className="text-muted-foreground">Carregando...</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Receitas por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] flex items-center justify-center">
              <div className="text-muted-foreground">Carregando...</div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  const barData = dailyData?.map(item => ({
    date: formatDate(item.date),
    receitas: item.revenue,
    despesas: item.expenses,
    lucro: item.profit
  })) || []

  const pieData = categoryData?.map((item, index) => ({
    name: item.category,
    value: item.amount,
    percentage: item.percentage,
    color: CATEGORY_COLORS[index % CATEGORY_COLORS.length]
  })) || []

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Receitas e Despesas</CardTitle>
          <CardDescription>
            Evolução financeira no período
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={formatCurrency}
              />
              <Tooltip 
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-lg border bg-background p-2 shadow-md">
                        <div className="grid grid-cols-1 gap-2">
                          <div className="flex flex-col">
                            <span className="text-[0.70rem] uppercase text-muted-foreground">
                              Data: {label}
                            </span>
                          </div>
                          {payload.map((entry, index) => (
                            <div key={index} className="flex justify-between">
                              <span style={{ color: entry.color }}>
                                {entry.name === 'receitas' ? 'Receitas' : 
                                 entry.name === 'despesas' ? 'Despesas' : 'Lucro'}:
                              </span>
                              <span className="font-bold">
                                {formatCurrency(entry.value as number)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Legend 
                formatter={(value) => {
                  return value === 'receitas' ? 'Receitas' : 
                         value === 'despesas' ? 'Despesas' : 'Lucro'
                }}
              />
              <Bar dataKey="receitas" fill="#10b981" name="receitas" />
              <Bar dataKey="despesas" fill="#ef4444" name="despesas" />
              <Bar dataKey="lucro" fill="#3b82f6" name="lucro" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Receitas por Categoria</CardTitle>
          <CardDescription>
            Distribuição das receitas no período
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload
                    return (
                      <div className="rounded-lg border bg-background p-2 shadow-md">
                        <div className="grid grid-cols-1 gap-2">
                          <div className="flex flex-col">
                            <span className="text-[0.70rem] uppercase text-muted-foreground">
                              {data.name}
                            </span>
                            <span className="font-bold">
                              {formatCurrency(data.value)} ({data.percentage.toFixed(1)}%)
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Legend 
                verticalAlign="bottom" 
                height={36}
                formatter={(value, entry) => (
                  <span style={{ color: entry.color }}>
                    {value}
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
