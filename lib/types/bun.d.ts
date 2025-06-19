declare module 'bun:test' {
  export function describe(name: string, fn: () => void): void
  export function it(name: string, fn: () => void): void
  
  interface Matchers {
    toBe(expected: any): void
    toEqual(expected: any): void
    toBeNull(): void
    toBeTruthy(): void
    toHaveLength(length: number): void
    toContain(expected: any): void
    toBeInstanceOf(constructor: any): void
    toThrow(): void
  }
  
  export function expect(actual: any): Matchers & {
    not: Matchers
  }
} 