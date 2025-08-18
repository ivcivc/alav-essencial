import { NotificationChannel } from '../types/shared'

// 🔔 INTERFACES E TIPOS PARA PROVEDORES

export interface NotificationResult {
  success: boolean
  messageId?: string
  errorMessage?: string
  providerData?: any
}

export interface NotificationMessage {
  recipient: string
  content: string
  subject?: string
}

export abstract class NotificationProvider {
  abstract channel: NotificationChannel
  abstract send(message: NotificationMessage): Promise<NotificationResult>
  abstract validateRecipient(recipient: string): boolean
  abstract isConfigured(): boolean
}

// 🔔 PROVEDOR WHATSAPP (usando exemplo com API genérica)

export class WhatsAppProvider extends NotificationProvider {
  channel: NotificationChannel = NotificationChannel.WHATSAPP
  
  private apiUrl: string
  private apiKey: string
  private fromNumber: string

  constructor(config: { apiUrl?: string; apiKey?: string; fromNumber?: string } = {}) {
    super()
    this.apiUrl = config.apiUrl || process.env.WHATSAPP_API_URL || ''
    this.apiKey = config.apiKey || process.env.WHATSAPP_API_KEY || ''
    this.fromNumber = config.fromNumber || process.env.WHATSAPP_FROM_NUMBER || ''
  }

  async send(message: NotificationMessage): Promise<NotificationResult> {
    try {
      if (!this.isConfigured()) {
        return {
          success: false,
          errorMessage: 'WhatsApp provider não está configurado'
        }
      }

      if (!this.validateRecipient(message.recipient)) {
        return {
          success: false,
          errorMessage: 'Número de WhatsApp inválido'
        }
      }

      // Exemplo de implementação genérica - adaptar para API específica
      const response = await fetch(`${this.apiUrl}/send`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: this.fromNumber,
          to: message.recipient,
          message: message.content,
          type: 'text'
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        return {
          success: false,
          errorMessage: errorData.message || 'Erro ao enviar WhatsApp',
          providerData: errorData
        }
      }

      const data = await response.json()
      return {
        success: true,
        messageId: data.messageId || data.id,
        providerData: data
      }

    } catch (error) {
      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : 'Erro desconhecido ao enviar WhatsApp',
        providerData: { error: error instanceof Error ? error.message : 'Unknown error' }
      }
    }
  }

  validateRecipient(recipient: string): boolean {
    // Validar formato de número WhatsApp (exemplo: +5511999999999)
    const whatsappRegex = /^\+\d{10,15}$/
    return whatsappRegex.test(recipient)
  }

  isConfigured(): boolean {
    return !!(this.apiUrl && this.apiKey && this.fromNumber)
  }
}

// 🔔 PROVEDOR SMS (usando exemplo com Twilio)

export class SMSProvider extends NotificationProvider {
  channel: NotificationChannel = NotificationChannel.SMS
  
  private accountSid: string
  private authToken: string
  private fromNumber: string

  constructor(config: { accountSid?: string; authToken?: string; fromNumber?: string } = {}) {
    super()
    this.accountSid = config.accountSid || process.env.TWILIO_ACCOUNT_SID || ''
    this.authToken = config.authToken || process.env.TWILIO_AUTH_TOKEN || ''
    this.fromNumber = config.fromNumber || process.env.TWILIO_FROM_NUMBER || ''
  }

  async send(message: NotificationMessage): Promise<NotificationResult> {
    try {
      if (!this.isConfigured()) {
        return {
          success: false,
          errorMessage: 'SMS provider não está configurado'
        }
      }

      if (!this.validateRecipient(message.recipient)) {
        return {
          success: false,
          errorMessage: 'Número de telefone inválido'
        }
      }

      // Implementação usando Twilio (exemplo)
      const auth = Buffer.from(`${this.accountSid}:${this.authToken}`).toString('base64')
      
      const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}/Messages.json`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          From: this.fromNumber,
          To: message.recipient,
          Body: message.content
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        return {
          success: false,
          errorMessage: errorData.message || 'Erro ao enviar SMS',
          providerData: errorData
        }
      }

      const data = await response.json()
      return {
        success: true,
        messageId: data.sid,
        providerData: data
      }

    } catch (error) {
      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : 'Erro desconhecido ao enviar SMS',
        providerData: { error: error instanceof Error ? error.message : 'Unknown error' }
      }
    }
  }

  validateRecipient(recipient: string): boolean {
    // Validar formato de número de telefone
    const phoneRegex = /^\+\d{10,15}$/
    return phoneRegex.test(recipient)
  }

  isConfigured(): boolean {
    return !!(this.accountSid && this.authToken && this.fromNumber)
  }
}

// 🔔 PROVEDOR EMAIL (usando NodeMailer)

export class EmailProvider extends NotificationProvider {
  channel: NotificationChannel = NotificationChannel.EMAIL
  
  private smtpHost: string
  private smtpPort: number
  private smtpUser: string
  private smtpPassword: string
  private fromEmail: string
  private fromName: string

  constructor(config: { 
    smtpHost?: string; 
    smtpPort?: number; 
    smtpUser?: string; 
    smtpPassword?: string;
    fromEmail?: string;
    fromName?: string;
  } = {}) {
    super()
    this.smtpHost = config.smtpHost || process.env.SMTP_HOST || ''
    this.smtpPort = config.smtpPort || parseInt(process.env.SMTP_PORT || '587')
    this.smtpUser = config.smtpUser || process.env.SMTP_USER || ''
    this.smtpPassword = config.smtpPassword || process.env.SMTP_PASSWORD || ''
    this.fromEmail = config.fromEmail || process.env.FROM_EMAIL || ''
    this.fromName = config.fromName || process.env.FROM_NAME || 'Clínica Essencial'
  }

  async send(message: NotificationMessage): Promise<NotificationResult> {
    try {
      if (!this.isConfigured()) {
        return {
          success: false,
          errorMessage: 'Email provider não está configurado'
        }
      }

      if (!this.validateRecipient(message.recipient)) {
        return {
          success: false,
          errorMessage: 'Email inválido'
        }
      }

      // Implementação usando nodemailer (seria necessário instalar: npm install nodemailer @types/nodemailer)
      // Por enquanto, vou simular o envio
      
      console.log(`📧 Simulando envio de email:`)
      console.log(`From: ${this.fromName} <${this.fromEmail}>`)
      console.log(`To: ${message.recipient}`)
      console.log(`Subject: ${message.subject || 'Lembrete de Consulta'}`)
      console.log(`Content: ${message.content}`)

      // Em produção, usar nodemailer:
      /*
      const nodemailer = require('nodemailer')
      const transporter = nodemailer.createTransporter({
        host: this.smtpHost,
        port: this.smtpPort,
        secure: this.smtpPort === 465,
        auth: {
          user: this.smtpUser,
          pass: this.smtpPassword
        }
      })

      const info = await transporter.sendMail({
        from: `"${this.fromName}" <${this.fromEmail}>`,
        to: message.recipient,
        subject: message.subject || 'Lembrete de Consulta',
        text: message.content,
        html: message.content.replace(/\n/g, '<br>')
      })

      return {
        success: true,
        messageId: info.messageId,
        providerData: info
      }
      */

      // Simulação de sucesso
      return {
        success: true,
        messageId: `email-${Date.now()}`,
        providerData: {
          from: `${this.fromName} <${this.fromEmail}>`,
          to: message.recipient,
          subject: message.subject,
          timestamp: new Date().toISOString()
        }
      }

    } catch (error) {
      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : 'Erro desconhecido ao enviar email',
        providerData: { error: error instanceof Error ? error.message : 'Unknown error' }
      }
    }
  }

  validateRecipient(recipient: string): boolean {
    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(recipient)
  }

  isConfigured(): boolean {
    return !!(this.smtpHost && this.smtpUser && this.smtpPassword && this.fromEmail)
  }
}

// 🔔 FACTORY PARA PROVEDORES

export class NotificationProviderFactory {
  private static providers = new Map<NotificationChannel, NotificationProvider>()

  static registerProvider(channel: NotificationChannel, provider: NotificationProvider): void {
    this.providers.set(channel, provider)
  }

  static getProvider(channel: NotificationChannel): NotificationProvider | null {
    return this.providers.get(channel) || null
  }

  static initializeDefaultProviders(): void {
    // Registrar provedores padrão
    this.registerProvider(NotificationChannel.WHATSAPP, new WhatsAppProvider())
    this.registerProvider(NotificationChannel.SMS, new SMSProvider())
    this.registerProvider(NotificationChannel.EMAIL, new EmailProvider())
  }

  static getConfiguredProviders(): NotificationChannel[] {
    const configuredChannels: NotificationChannel[] = []
    
    for (const [channel, provider] of this.providers.entries()) {
      if (provider.isConfigured()) {
        configuredChannels.push(channel)
      }
    }
    
    return configuredChannels
  }
}

// Inicializar provedores padrão
NotificationProviderFactory.initializeDefaultProviders()
