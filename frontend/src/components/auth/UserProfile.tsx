import React from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { User, Mail, Shield } from 'lucide-react'

export function UserProfile() {
 const { user } = useAuth()

 if (!user) {
  return null
 }

 const getRoleBadgeVariant = (role: string) => {
  return role === 'ADMIN' ? 'destructive' : 'secondary'
 }

 const getRoleLabel = (role: string) => {
  return role === 'ADMIN' ? 'Administrador' : 'Usuário'
 }

 return (
  <Card>
   <CardHeader>
    <CardTitle className="flex items-center gap-2">
     <User className="h-5 w-5" />
     Perfil do Usuário
    </CardTitle>
   </CardHeader>
   <CardContent className="space-y-4">
    <div className="flex items-center gap-2">
     <User className="h-4 w-4 text-muted-foreground" />
     <span className="font-medium">{user.name}</span>
    </div>
    
    <div className="flex items-center gap-2">
     <Mail className="h-4 w-4 text-muted-foreground" />
     <span>{user.email}</span>
    </div>
    
    <div className="flex items-center gap-2">
     <Shield className="h-4 w-4 text-muted-foreground" />
     <Badge variant={getRoleBadgeVariant(user.role)}>
      {getRoleLabel(user.role)}
     </Badge>
    </div>
    
    <div className="text-sm text-muted-foreground">
     <p>Conta criada em: {new Date(user.createdAt).toLocaleDateString('pt-BR')}</p>
     {user.updatedAt && (
      <p>Última atualização: {new Date(user.updatedAt).toLocaleDateString('pt-BR')}</p>
     )}
    </div>
   </CardContent>
  </Card>
 )
}