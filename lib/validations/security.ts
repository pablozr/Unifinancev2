import { z } from 'zod'

export const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential XSS characters
    .slice(0, 1000) // Limit length to prevent DoS
}

export const validateCSRF = (token: string | null): boolean => {
  return token !== null && token.length > 0
}


export const ipSchema = z.string().ip('IP invÃ¡lido')

export const userAgentSchema = z
  .string()
  .min(1, 'User agent Ã© obrigatÃ³rio')
  .max(500, 'User agent muito longo')
  .refine(
    (ua) => !ua.includes('<script>') && !ua.includes('javascript:'),
    'User agent contÃ©m conteÃºdo suspeito'
  )

export const validateRequest = (headers: Headers): { isValid: boolean; error?: string } => {
  const userAgent = headers.get('user-agent')
  const origin = headers.get('origin')
  const referer = headers.get('referer')

  if (!userAgent || userAgent.length < 10) {
    return { isValid: false, error: 'User agent invÃ¡lido' }
  }

  if (origin && !isValidOrigin(origin)) {
    return { isValid: false, error: 'Origem nÃ£o autorizada' }
  }

  if (referer && !isValidReferer(referer)) {
    return { isValid: false, error: 'Referer invÃ¡lido' }
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

export const validatePasswordStrength = (password: string): { 
  score: number; 
  feedback: string[] 
} => {
  const feedback: string[] = []
  let score = 0

  if (password.length >= 8) score += 1
  else feedback.push('Use pelo menos 8 caracteres')

  if (password.length >= 12) score += 1
  else feedback.push('Recomendado: 12+ caracteres')

  if (/[a-z]/.test(password)) score += 1
  else feedback.push('Adicione letras minÃºsculas')

  if (/[A-Z]/.test(password)) score += 1
  else feedback.push('Adicione letras maiÃºsculas')

  if (/[0-9]/.test(password)) score += 1
  else feedback.push('Adicione nÃºmeros')

  if (/[^a-zA-Z0-9]/.test(password)) score += 1
  else feedback.push('Adicione sÃ­mbolos (!@#$%^&*)')

  if (!/(.)\1{2,}/.test(password)) score += 1
  else feedback.push('Evite caracteres repetidos')

  if (!/123|abc|qwe|password|admin/i.test(password)) score += 1
  else feedback.push('Evite sequÃªncias comuns')

  return { score, feedback }
}

export const validateEmailDomain = async (email: string): Promise<boolean> => {
  try {
    const domain = email.split('@')[1]
    if (!domain) return false

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
