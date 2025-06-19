
export const supabaseErrorCodes = {
  INVALID_CREDENTIALS: 'invalid_credentials',
  EMAIL_NOT_CONFIRMED: 'email_not_confirmed',
  USER_NOT_FOUND: 'user_not_found',
  USER_ALREADY_REGISTERED: 'user_already_registered',
  
  TOO_MANY_REQUESTS: 'too_many_requests',
  EMAIL_RATE_LIMIT_EXCEEDED: 'email_rate_limit_exceeded',
  
  WEAK_PASSWORD: 'weak_password',
  EMAIL_ADDRESS_INVALID: 'email_address_invalid',
  SIGNUP_DISABLED: 'signup_disabled',
  
  SESSION_NOT_FOUND: 'session_not_found',
  REFRESH_TOKEN_NOT_FOUND: 'refresh_token_not_found',
} as const

export const errorMessages = {
  [supabaseErrorCodes.INVALID_CREDENTIALS]: 'Email ou senha incorretos',
  [supabaseErrorCodes.EMAIL_NOT_CONFIRMED]: 'Verifique seu email para confirmar sua conta',
  [supabaseErrorCodes.USER_NOT_FOUND]: 'UsuÃ¡rio nÃ£o encontrado',
  [supabaseErrorCodes.USER_ALREADY_REGISTERED]: 'Este email jÃ¡ estÃ¡ cadastrado',
  
  [supabaseErrorCodes.TOO_MANY_REQUESTS]: 'Muitas tentativas. Aguarde alguns minutos antes de tentar novamente',
  [supabaseErrorCodes.EMAIL_RATE_LIMIT_EXCEEDED]: 'Limite de emails excedido. Aguarde 60 segundos antes de tentar novamente',
  
  [supabaseErrorCodes.WEAK_PASSWORD]: 'Senha nÃ£o atende aos critÃ©rios de seguranÃ§a',
  [supabaseErrorCodes.EMAIL_ADDRESS_INVALID]: 'Formato de email invÃ¡lido',
  [supabaseErrorCodes.SIGNUP_DISABLED]: 'Cadastro temporariamente desabilitado',
  
  [supabaseErrorCodes.SESSION_NOT_FOUND]: 'SessÃ£o expirada. FaÃ§a login novamente',
  [supabaseErrorCodes.REFRESH_TOKEN_NOT_FOUND]: 'SessÃ£o invÃ¡lida. FaÃ§a login novamente',
} as const

export const getErrorMessage = (error: any): string => {
  if (!error?.message) {return 'Erro inesperado. Tente novamente.'}

  const message = error.message.toLowerCase()

  if (message.includes('invalid login credentials') || message.includes('invalid_credentials')) {
    return errorMessages[supabaseErrorCodes.INVALID_CREDENTIALS]
  }

  if (message.includes('email not confirmed') || message.includes('email_not_confirmed')) {
    return errorMessages[supabaseErrorCodes.EMAIL_NOT_CONFIRMED]
  }

  if (message.includes('user already registered') || message.includes('already_registered')) {
    return errorMessages[supabaseErrorCodes.USER_ALREADY_REGISTERED]
  }

  if (
    message.includes('too many requests') ||
    message.includes('rate limit') ||
    message.includes('429') ||
    error.status === 429 ||
    error.statusCode === 429 ||
    message.includes('too_many_requests') ||
    message.includes('rate_limit_exceeded') ||
    message.includes('too many login attempts') ||
    message.includes('please wait') ||
    message.includes('temporarily blocked') ||
    message.includes('try again later') ||
    message.includes('slow down')
  ) {
    return errorMessages[supabaseErrorCodes.TOO_MANY_REQUESTS]
  }

  if (message.includes('email rate limit exceeded') || message.includes('email_rate_limit_exceeded')) {
    return errorMessages[supabaseErrorCodes.EMAIL_RATE_LIMIT_EXCEEDED]
  }

  if (message.includes('weak_password') || message.includes('password should be at least')) {
    return errorMessages[supabaseErrorCodes.WEAK_PASSWORD]
  }

  if (message.includes('email_address_invalid') || message.includes('unable to validate email')) {
    return errorMessages[supabaseErrorCodes.EMAIL_ADDRESS_INVALID]
  }

  if (message.includes('signup_disabled') || message.includes('signup is disabled')) {
    return errorMessages[supabaseErrorCodes.SIGNUP_DISABLED]
  }

  if (message.includes('session_not_found') || message.includes('session not found')) {
    return errorMessages[supabaseErrorCodes.SESSION_NOT_FOUND]
  }

  if (message.includes('refresh_token_not_found') || message.includes('refresh token not found')) {
    return errorMessages[supabaseErrorCodes.REFRESH_TOKEN_NOT_FOUND]
  }

  return 'Erro inesperado. Tente novamente.'
}
