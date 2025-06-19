import { z } from 'zod'

// Security validation utilities
export const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential XSS characters
    .slice(0, 1000) // Limit length to prevent DoS
}

export const validateCSRF = (token: string | null): boolean => {
  // Basic CSRF validation (Server Actions have built-in CSRF protection)
  return token !== null && token.length > 0
}

// Rate limiting is handled natively by Supabase Auth
// No need for custom implementation

// IP validation
export const ipSchema = z.string().ip('IP inválido')

// User agent validation
export const userAgentSchema = z
  .string()
  .min(1, 'User agent é obrigatório')
  .max(500, 'User agent muito longo')
  .refine(
    (ua) => !ua.includes('<script>') && !ua.includes('javascript:'),
    'User agent contém conteúdo suspeito'
  )

// Request validation
export const validateRequest = (headers: Headers): { isValid: boolean; error?: string } => {
  const userAgent = headers.get('user-agent')
  const origin = headers.get('origin')
  const referer = headers.get('referer')

  // Validate user agent
  if (!userAgent || userAgent.length < 10) {
    return { isValid: false, error: 'User agent inválido' }
  }

  // Validate origin for CSRF protection
  if (origin && !isValidOrigin(origin)) {
    return { isValid: false, error: 'Origem não autorizada' }
  }

  // Validate referer
  if (referer && !isValidReferer(referer)) {
    return { isValid: false, error: 'Referer inválido' }
  }

  return { isValid: true }
}

const isValidOrigin = (origin: string): boolean => {
  const allowedOrigins = [
    'http://localhost:3000',
    'https://localhost:3000',
    process.env.NEXT_PUBLIC_SITE_URL,
  ].filter(Boolean)

  return allowedOrigins.includes(origin)
}

const isValidReferer = (referer: string): boolean => {
  try {
    const url = new URL(referer)
    return isValidOrigin(url.origin)
  } catch {
    return false
  }
}

// Password strength validation
export const validatePasswordStrength = (password: string): { 
  score: number; 
  feedback: string[] 
} => {
  const feedback: string[] = []
  let score = 0

  // Length check
  if (password.length >= 8) score += 1
  else feedback.push('Use pelo menos 8 caracteres')

  if (password.length >= 12) score += 1
  else feedback.push('Recomendado: 12+ caracteres')

  // Character variety
  if (/[a-z]/.test(password)) score += 1
  else feedback.push('Adicione letras minúsculas')

  if (/[A-Z]/.test(password)) score += 1
  else feedback.push('Adicione letras maiúsculas')

  if (/[0-9]/.test(password)) score += 1
  else feedback.push('Adicione números')

  if (/[^a-zA-Z0-9]/.test(password)) score += 1
  else feedback.push('Adicione símbolos (!@#$%^&*)')

  // Common patterns
  if (!/(.)\1{2,}/.test(password)) score += 1
  else feedback.push('Evite caracteres repetidos')

  if (!/123|abc|qwe|password|admin/i.test(password)) score += 1
  else feedback.push('Evite sequências comuns')

  return { score, feedback }
}

// Email domain validation
export const validateEmailDomain = async (email: string): Promise<boolean> => {
  try {
    const domain = email.split('@')[1]
    if (!domain) return false

    // Check against common disposable email domains
    const disposableDomains = [
      '10minutemail.com',
      'tempmail.org',
      'guerrillamail.com',
      'mailinator.com',
    ]

    return !disposableDomains.includes(domain.toLowerCase())
  } catch {
    return false
  }
}
