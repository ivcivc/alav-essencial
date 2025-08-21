import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { ReportSummary } from '../../../services/reports'

interface ReportChartsProps {
  data: ReportSummary
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#ff7300']

export function ReportCharts({ data }: ReportChartsProps) {
  // Preparar dados para gráfico de agendamentos por data
  const appointmentsByDate = Object.entries(data.trends.appointmentsByDate)
    .map(([date, count]) => ({
      date,
      agendamentos: count,
      dateFormatted: format(parseISO(date), 'dd/MM', { locale: ptBR })
    }))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-14) // Últimos 14 dias

  // Preparar dados para gráfico de receita por data
  const revenueByDate = Object.entries(data.trends.revenueByDate)
    .map(([date, revenue]) => ({
      date,
      receita: revenue,
      dateFormatted: format(parseISO(date), 'dd/MM', { locale: ptBR })
    }))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-14) // Últimos 14 dias

  // Preparar dados para gráfico de pizza - Top Serviços
  const topServices = Object.entries(data.trends.topServices)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 6)
    .map(([service, count]) => ({
      name: service.length > 20 ? service.substring(0, 20) + '...' : service,
      value: count,
      fullName: service
    }))

  // Preparar dados para gráfico de pizza - Top Parceiros
  const topPartners = Object.entries(data.trends.topPartners)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 6)
    .map(([partner, count]) => ({
      name: partner.length > 20 ? partner.substring(0, 20) + '...' : partner,
      value: count,
      fullName: partner
    }))

  // Combinar dados de agendamentos e receita por data
  const combinedData = appointmentsByDate.map(item => {
    const revenueItem = revenueByDate.find(r => r.date === item.date)
    return {
      ...item,
      receita: revenueItem?.receita || 0
    }
  })

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{`Data: ${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.dataKey === 'receita' 
                ? `${entry.name}: ${formatCurrency(entry.value)}`
                : `${entry.name}: ${entry.value}`
              }
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  const PieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{data.fullName}</p>
          <p style={{ color: payload[0].color }}>
            Quantidade: {data.value}
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Gráfico Combinado - Agendamentos e Receita */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Tendência de Agendamentos e Receita</CardTitle>
          <CardDescription>Últimos 14 dias com dados</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={combinedData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="dateFormatted" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip content={<CustomTooltip />} />
              <Bar yAxisId="left" dataKey="agendamentos" fill="#0088FE" name="Agendamentos" />
              <Line 
                yAxisId="right" 
                type="monotone" 
                dataKey="receita" 
                stroke="#00C49F" 
                strokeWidth={2}
                name="Receita"
                dot={{ fill: '#00C49F', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Gráfico de Barras - Agendamentos por Data */}
      <Card>
        <CardHeader>
          <CardTitle>Agendamentos por Data</CardTitle>
          <CardDescription>Distribuição diária dos agendamentos</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={appointmentsByDate}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="dateFormatted" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="agendamentos" fill="#0088FE" name="Agendamentos" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Gráfico de Linha - Receita por Data */}
      <Card>
        <CardHeader>
          <CardTitle>Receita por Data</CardTitle>
          <CardDescription>Evolução da receita diária</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={revenueByDate}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="dateFormatted" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="receita" 
                stroke="#00C49F" 
                strokeWidth={2}
                name="Receita"
                dot={{ fill: '#00C49F', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Gráfico de Pizza - Top Serviços */}
      <Card>
        <CardHeader>
          <CardTitle>Top Serviços</CardTitle>
          <CardDescription>Serviços mais agendados no período</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={topServices}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {topServices.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<PieTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Gráfico de Pizza - Top Parceiros */}
      <Card>
        <CardHeader>
          <CardTitle>Top Parceiros</CardTitle>
          <CardDescription>Parceiros com mais agendamentos</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={topPartners}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {topPartners.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<PieTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
