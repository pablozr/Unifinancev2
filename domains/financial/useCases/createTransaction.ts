import { Transaction, TransactionType } from '../entities/transaction'
import TransactionRepository from '../repositories/transactionRepository'

export interface CreateTransactionDTO {
  userId: string
  description: string
  amount: number
  type: TransactionType
  date: Date
  categoryId?: string
  metadata?: Record<string, any>
}

export interface CreateTransactionResult {
  success: boolean
  transaction?: Transaction
  error?: string
  duplicateWarning?: boolean
}

export class CreateTransactionUseCase {
  constructor(
    private transactionRepository: TransactionRepository
  ) {}

  async execute(dto: CreateTransactionDTO): Promise<CreateTransactionResult> {
    try {
      // Business validation
      const validationResult = this.validateInput(dto)
      if (!validationResult.isValid) {
        return {
          success: false,
          error: validationResult.error
        }
      }

      // Check for duplicates
      const duplicates = await this.transactionRepository.findDuplicates(
        dto.userId,
        dto.description,
        dto.amount,
        dto.date
      )

      // Create transaction entity
      const transaction = Transaction.create({
        userId: dto.userId,
        description: dto.description,
        amount: dto.amount,
        type: dto.type,
        date: dto.date,
        categoryId: dto.categoryId,
        metadata: dto.metadata
      })

      // Save to repository
      const savedTransaction = await this.transactionRepository.save(transaction)

      return {
        success: true,
        transaction: savedTransaction,
        duplicateWarning: duplicates.length > 0
      }

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  private validateInput(dto: CreateTransactionDTO): { isValid: boolean; error?: string } {
    // Amount validation
    if (dto.amount === 0) {
      return { isValid: false, error: 'Amount cannot be zero' }
    }

    // Description validation
    if (!dto.description || dto.description.trim().length === 0) {
      return { isValid: false, error: 'Description is required' }
    }

    if (dto.description.length > 255) {
      return { isValid: false, error: 'Description is too long' }
    }

    // Date validation
    const now = new Date()
    const maxFutureDate = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate())
    const minPastDate = new Date(now.getFullYear() - 10, now.getMonth(), now.getDate())

    if (dto.date > maxFutureDate) {
      return { isValid: false, error: 'Date cannot be more than 1 year in the future' }
    }

    if (dto.date < minPastDate) {
      return { isValid: false, error: 'Date cannot be more than 10 years in the past' }
    }

    // Type validation
    if (!Object.values(TransactionType).includes(dto.type)) {
      return { isValid: false, error: 'Invalid transaction type' }
    }

    return { isValid: true }
  }
}

export default CreateTransactionUseCase 