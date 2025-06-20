'use client'

import { useQueryState } from 'nuqs'
import BaseModal from './BaseModal'

export interface ConfirmationModalProps {
  // Configuração do modal
  title: string
  subtitle?: string
  message: string
  dangerLevel?: 'low' | 'medium' | 'high' | 'extreme'
  
  // Configuração da confirmação
  confirmText?: string
  cancelText?: string
  requireTextConfirmation?: boolean
  confirmationPhrase?: string
  
  // Dados e ações
  data?: {
    count?: number
    amount?: number
    period?: string
  }
  
  // Handlers
  onConfirm: () => Promise<void> | void
  onCancel?: () => void
  
  // Estado
  isLoading?: boolean
}

const dangerStyles = {
  low: {
    bgColor: 'bg-blue-900/20',
    borderColor: 'border-blue-500/30',
    titleColor: 'text-blue-300',
    confirmBg: 'bg-blue-600 hover:bg-blue-700',
    icon: '💡'
  },
  medium: {
    bgColor: 'bg-yellow-900/20',
    borderColor: 'border-yellow-500/30',
    titleColor: 'text-yellow-300',
    confirmBg: 'bg-yellow-600 hover:bg-yellow-700',
    icon: '⚠️'
  },
  high: {
    bgColor: 'bg-red-900/20',
    borderColor: 'border-red-500/30',
    titleColor: 'text-red-300',
    confirmBg: 'bg-red-600 hover:bg-red-700',
    icon: '🚨'
  },
  extreme: {
    bgColor: 'bg-red-900/40',
    borderColor: 'border-red-400/50',
    titleColor: 'text-red-200',
    confirmBg: 'bg-red-700 hover:bg-red-800',
    icon: '💀'
  }
}

interface ConfirmationModalInternalProps extends ConfirmationModalProps {
  modalId?: string
}

export default function ConfirmationModal({
  title,
  subtitle,
  message,
  dangerLevel = 'medium',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  requireTextConfirmation = false,
  confirmationPhrase,
  data,
  onConfirm,
  onCancel,
  isLoading = false,
  modalId
}: ConfirmationModalInternalProps) {
  const [isOpen, setIsOpen] = useQueryState('confirm', { defaultValue: '' })
  const [textConfirmation, setTextConfirmation] = useQueryState('confirmText', { defaultValue: '' })
  
  // O modal deve abrir quando há um valor na query string
  const isModalOpen = Boolean(isOpen)
  const styles = dangerStyles[dangerLevel]
  
  const handleClose = () => {
    setIsOpen('')
    setTextConfirmation('')
    onCancel?.()
  }
  
  const handleConfirm = async () => {
    if (requireTextConfirmation && confirmationPhrase) {
      if (textConfirmation !== confirmationPhrase) {
        // Não usar alert, deixar o modal aberto para o usuário tentar novamente
        return
      }
    }
    
    try {
      await onConfirm()
      handleClose()
    } catch (error) {
      console.error('Erro na confirmação:', error)
    }
  }
  
  const isConfirmDisabled = isLoading || (requireTextConfirmation && textConfirmation !== confirmationPhrase)
  
  return (
    <BaseModal
      isOpen={isModalOpen}
      onClose={handleClose}
      title={`${styles.icon} ${title}`}
      subtitle={subtitle}
      size="md"
      showCloseButton={!isLoading}
    >
      <div className={`${styles.bgColor} ${styles.borderColor} border rounded-xl p-6 space-y-4`}>
        {/* Mensagem principal */}
        <div className="space-y-3">
          <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">
            {message}
          </p>
          
          {/* Dados da operação */}
          {data && (
            <div className="bg-gray-800/50 rounded-lg p-4 space-y-2">
              {data.count !== undefined && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Transações:</span>
                  <span className="text-white font-medium">{data.count}</span>
                </div>
              )}
              {data.amount !== undefined && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Valor total:</span>
                  <span className="text-white font-medium">
                    R$ {data.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              )}
              {data.period && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Período:</span>
                  <span className="text-white font-medium">{data.period}</span>
                </div>
              )}
            </div>
          )}
          
          {/* Campo de confirmação por texto */}
          {requireTextConfirmation && confirmationPhrase && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                Digite &ldquo;{confirmationPhrase}&rdquo; para confirmar:
              </label>
              <input
                type="text"
                value={textConfirmation}
                onChange={(e) => setTextConfirmation(e.target.value)}
                placeholder={confirmationPhrase}
                disabled={isLoading}
                className={`w-full bg-gray-800 border rounded-lg px-3 py-2 text-white placeholder-gray-500 disabled:opacity-50 ${
                  textConfirmation && textConfirmation !== confirmationPhrase 
                    ? 'border-red-500 focus:border-red-400' 
                    : 'border-gray-600 focus:border-blue-500'
                }`}
              />
              {textConfirmation && textConfirmation !== confirmationPhrase && (
                <p className="text-red-400 text-xs">
                  Texto de confirmação incorreto. Digite exatamente: &ldquo;{confirmationPhrase}&rdquo;
                </p>
              )}
            </div>
          )}
        </div>
        
        {/* Botões de ação */}
        <div className="flex gap-3 pt-4">
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="flex-1 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition-colors"
          >
            {cancelText}
          </button>
          
          <button
            onClick={handleConfirm}
            disabled={isConfirmDisabled}
            className={`flex-1 ${styles.confirmBg} disabled:bg-gray-600 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-medium transition-colors`}
          >
            {isLoading ? 'Processando...' : confirmText}
          </button>
        </div>
      </div>
    </BaseModal>
  )
}

// Hook personalizado para facilitar o uso
export function useConfirmationModal() {
  const [isOpen, setIsOpen] = useQueryState('confirm', { defaultValue: '' })
  const [, setTextConfirmation] = useQueryState('confirmText', { defaultValue: '' })
  
  const openModal = (modalId: string) => {
    setIsOpen(modalId)
  }
  
  const closeModal = () => {
    setIsOpen('')
    setTextConfirmation('')
  }
  
  return {
    isOpen: Boolean(isOpen),
    modalId: isOpen,
    openModal,
    closeModal
  }
} 