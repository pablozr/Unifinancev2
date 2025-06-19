// Test database setup
export const setupTestDatabase = () => {
  // Note: These would be called from individual test files
  // beforeAll(async () => {
  //   console.log('🚀 Setting up test database...')
  // })
  
  console.log('Test database setup configured')
}

// Mock setup
export const setupMocks = () => {
  console.log('Mock setup configured')
}

// Test environment setup
export const setupTestEnvironment = () => {
  // Set test environment variables (in actual test setup)
  const testConfig = {
    NODE_ENV: 'test',
    NEXT_PUBLIC_SUPABASE_URL: 'http://localhost:54321',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-key'
  }
  console.log('Test environment configured:', testConfig)
}

// Utility functions for tests
export const createTestUser = () => ({
  id: 'test-user-id',
  email: 'test@example.com',
  name: 'Test User'
})

export const createTestTransaction = (overrides = {}) => ({
  id: 'test-transaction-id',
  userId: 'test-user-id',
  description: 'Test Transaction',
  amount: 100,
  type: 'expense',
  date: new Date('2024-01-01'),
  categoryId: 'test-category-id',
  ...overrides
})

export const createTestCategory = (overrides = {}) => ({
  id: 'test-category-id',
  name: 'Test Category',
  type: 'expense',
  userId: 'test-user-id',
  ...overrides
})

// Custom matchers
export const customMatchers = {
  toBeValidTransaction: (received: any) => {
    const pass = received && 
                 typeof received.id === 'string' &&
                 typeof received.description === 'string' &&
                 typeof received.amount === 'number' &&
                 received.date instanceof Date

    return {
      message: () => `expected ${received} to be a valid transaction`,
      pass
    }
  },

  toBeValidMoney: (received: any) => {
    const pass = received &&
                 typeof received.amount === 'number' &&
                 typeof received.currency === 'string' &&
                 received.amount > 0

    return {
      message: () => `expected ${received} to be valid money`,
      pass
    }
  }
}

// Test data factories
export class TestDataFactory {
  static user(overrides = {}) {
    return {
      id: `user-${Math.random().toString(36).substr(2, 9)}`,
      email: `test-${Math.random().toString(36).substr(2, 5)}@example.com`,
      name: 'Test User',
      createdAt: new Date(),
      ...overrides
    }
  }

  static transaction(overrides = {}) {
    return {
      id: `transaction-${Math.random().toString(36).substr(2, 9)}`,
      userId: 'test-user-id',
      description: 'Test Transaction',
      amount: Math.floor(Math.random() * 1000) + 1,
      type: 'expense',
      date: new Date(),
      categoryId: 'test-category-id',
      createdAt: new Date(),
      ...overrides
    }
  }

  static transactions(count: number, overrides = {}) {
    return Array.from({ length: count }, () => this.transaction(overrides))
  }
}

// Mock repository
export class MockTransactionRepository {
  private transactions: any[] = []

  async save(transaction: any) {
    this.transactions.push(transaction)
    return transaction
  }

  async findById(id: string) {
    return this.transactions.find(t => t.id === id) || null
  }

  async findByUserId(userId: string) {
    return this.transactions.filter(t => t.userId === userId)
  }

  async delete(id: string) {
    this.transactions = this.transactions.filter(t => t.id !== id)
  }

  clear() {
    this.transactions = []
  }
}

export default {
  setupTestDatabase,
  setupMocks,
  setupTestEnvironment,
  createTestUser,
  createTestTransaction,
  createTestCategory,
  customMatchers,
  TestDataFactory,
  MockTransactionRepository
} 