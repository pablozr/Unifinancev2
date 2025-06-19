export interface TransactionId {
  value: string
}

export interface Money {
  amount: number
  currency: string
}

export interface TransactionDescription {
  value: string
  normalized: string
}

export interface TransactionDate {
  value: Date
  period: {
    year: number
    month: number
    day: number
  }
}

export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense',
  TRANSFER = 'transfer'
}

export enum TransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export class Transaction {
  constructor(
    public readonly id: TransactionId,
    public readonly userId: string,
    public readonly description: TransactionDescription,
    public readonly amount: Money,
    public readonly type: TransactionType,
    public readonly date: TransactionDate,
    public readonly categoryId: string | null,
    public readonly status: TransactionStatus,
    public readonly metadata: Record<string, any> = {},
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date()
  ) {}

  static create(data: {
    userId: string
    description: string
    amount: number
    type: TransactionType
    date: Date
    categoryId?: string
    metadata?: Record<string, any>
  }): Transaction {
    return new Transaction(
      { value: crypto.randomUUID() },
      data.userId,
      {
        value: data.description,
        normalized: data.description.toLowerCase().trim()
      },
      { amount: data.amount, currency: 'BRL' },
      data.type,
      {
        value: data.date,
        period: {
          year: data.date.getFullYear(),
          month: data.date.getMonth() + 1,
          day: data.date.getDate()
        }
      },
      data.categoryId || null,
      TransactionStatus.COMPLETED,
      data.metadata || {}
    )
  }

  // Domain methods
  isIncome(): boolean {
    return this.type === TransactionType.INCOME
  }

  isExpense(): boolean {
    return this.type === TransactionType.EXPENSE
  }

  isTransfer(): boolean {
    return this.type === TransactionType.TRANSFER
  }

  isSameMonth(date: Date): boolean {
    return this.date.period.year === date.getFullYear() &&
           this.date.period.month === date.getMonth() + 1
  }

  isSameCategory(categoryId: string): boolean {
    return this.categoryId === categoryId
  }

  updateCategory(categoryId: string): Transaction {
    return new Transaction(
      this.id,
      this.userId,
      this.description,
      this.amount,
      this.type,
      this.date,
      categoryId,
      this.status,
      this.metadata,
      this.createdAt,
      new Date()
    )
  }

  // Business rules
  canBeDeleted(): boolean {
    return this.status !== TransactionStatus.CANCELLED
  }

  canBeUpdated(): boolean {
    return this.status === TransactionStatus.COMPLETED
  }

  // Value calculations
  getAbsoluteAmount(): number {
    return Math.abs(this.amount.amount)
  }

  getSignedAmount(): number {
    if (this.isIncome()) return this.amount.amount
    if (this.isExpense()) return -this.amount.amount
    return this.amount.amount // Transfer keeps original sign
  }

  // Serialization
  toJSON() {
    return {
      id: this.id.value,
      userId: this.userId,
      description: this.description.value,
      amount: this.amount.amount,
      currency: this.amount.currency,
      type: this.type,
      date: this.date.value.toISOString(),
      categoryId: this.categoryId,
      status: this.status,
      metadata: this.metadata,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString()
    }
  }
}

export default Transaction 