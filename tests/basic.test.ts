/**
 * Basic Test - Verifies Jest Configuration
 * This test ensures the testing framework is properly set up
 */

describe('Basic Test Setup', () => {
  it('should run Jest correctly', () => {
    expect(true).toBe(true)
  })

  it('should have access to Jest globals', () => {
    expect(jest).toBeDefined()
    expect(describe).toBeDefined()
    expect(it).toBeDefined()
    expect(expect).toBeDefined()
  })

  it('should support TypeScript', () => {
    const testFunction = (value: string): string => {
      return `Hello, ${value}!`
    }
    
    expect(testFunction('World')).toBe('Hello, World!')
  })

  it('should support async/await', async () => {
    const asyncFunction = async (): Promise<string> => {
      return 'async result'
    }
    
    const result = await asyncFunction()
    expect(result).toBe('async result')
  })

  it('should support Jest mocks', () => {
    const mockFn = jest.fn()
    mockFn('test argument')
    
    expect(mockFn).toHaveBeenCalledWith('test argument')
    expect(mockFn).toHaveBeenCalledTimes(1)
  })
})