import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card'
import { Button } from '../../../components/ui/button'
import { Badge } from '../../../components/ui/badge'
import { BellIcon, ExternalLinkIcon, SettingsIcon } from 'lucide-react'
import { Link } from 'react-router-dom'

export function NotificationSettingsForm() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BellIcon className="h-5 w-5" />
          Configurações de Notificações
        </CardTitle>
        <CardDescription>
          As configurações detalhadas de notificações são gerenciadas em uma seção específica
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center py-8">
          <BellIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Sistema de Notificações</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Configure lembretes automáticos, templates de mensagens, canais de envio e muito mais na seção dedicada de notificações.
          </p>
          
          <div className="space-y-4">
            <div className="flex items-center justify-center space-x-4">
              <Badge variant="default" className="flex items-center gap-1">
                <SettingsIcon className="h-3 w-3" />
                WhatsApp
              </Badge>
              <Badge variant="default" className="flex items-center gap-1">
                <SettingsIcon className="h-3 w-3" />
                SMS
              </Badge>
              <Badge variant="default" className="flex items-center gap-1">
                <SettingsIcon className="h-3 w-3" />
                Email
              </Badge>
            </div>
            
            <Link to="/notifications">
              <Button className="flex items-center gap-2">
                <SettingsIcon className="h-4 w-4" />
                Ir para Configurações de Notificações
                <ExternalLinkIcon className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>

        <div className="border-t pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="font-medium text-foreground mb-1">Lembretes Automáticos</div>
              <div className="text-muted-foreground">3 notificações por agendamento</div>
            </div>
            <div className="text-center">
              <div className="font-medium text-foreground mb-1">Templates Personalizáveis</div>
              <div className="text-muted-foreground">Mensagens customizadas</div>
            </div>
            <div className="text-center">
              <div className="font-medium text-foreground mb-1">Histórico Completo</div>
              <div className="text-muted-foreground">Acompanhe todos os envios</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

