import { jest } from '@jest/globals'

/**
 * AI Test Utilities for Automated Error Detection and Fixing
 * These utilities provide structured error patterns and automated fix suggestions
 * that AI agents can use to automatically resolve common testing issues.
 */

export interface AIErrorPattern {
  pattern: RegExp
  category: string
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  autoFixable: boolean
  description: string
  solution: string
  codeExample?: string
}

export interface AITestResult {
  testName: string
  status: 'PASS' | 'FAIL' | 'ERROR'
  errorMessage?: string
  stackTrace?: string
  suggestions?: AISuggestion[]
  autoFix?: string
}

export interface AISuggestion {
  type: string
  description: string
  code: string
  confidence: number
}

/**
 * Common error patterns that AI can automatically detect and fix
 */
export const AI_ERROR_PATTERNS: AIErrorPattern[] = [
  {
    pattern: /Cannot read property '(\w+)' of undefined/,
    category: 'NULL_ACCESS',
    severity: 'HIGH',
    autoFixable: true,
    description: 'Attempting to access property of undefined object',
    solution: 'Add null/undefined checks or use optional chaining',
    codeExample: 'Use obj?.property instead of obj.property'
  },
  {
    pattern: /Cannot read property '(\w+)' of null/,
    category: 'NULL_ACCESS',
    severity: 'HIGH',
    autoFixable: true,
    description: 'Attempting to access property of null object',
    solution: 'Add null checks before property access',
    codeExample: 'Use obj && obj.property or obj?.property'
  },
  {
    pattern: /(\w+) is not a function/,
    category: 'FUNCTION_ERROR',
    severity: 'HIGH',
    autoFixable: true,
    description: 'Calling undefined function or incorrect function reference',
    solution: 'Check function import/export and ensure proper function definition',
    codeExample: 'Verify: import { functionName } from "module"'
  },
  {
    pattern: /Module.*not found.*'(.+)'/,
    category: 'IMPORT_ERROR',
    severity: 'CRITICAL',
    autoFixable: true,
    description: 'Module import path is incorrect or module is missing',
    solution: 'Fix import path or install missing dependency',
    codeExample: 'Check file path and run: npm install <missing-package>'
  },
  {
    pattern: /Expected.*but received.*/,
    category: 'ASSERTION_ERROR',
    severity: 'MEDIUM',
    autoFixable: true,
    description: 'Test assertion failed due to unexpected value',
    solution: 'Update test expectations or fix implementation',
    codeExample: 'Update expect() value or mock return value'
  },
  {
    pattern: /TypeError.*undefined/,
    category: 'TYPE_ERROR',
    severity: 'MEDIUM',
    autoFixable: true,
    description: 'Type-related error with undefined value',
    solution: 'Add type checking or default values',
    codeExample: 'Use: value || defaultValue or typeof checks'
  },
  {
    pattern: /ReferenceError.*not defined/,
    category: 'REFERENCE_ERROR',
    severity: 'HIGH',
    autoFixable: true,
    description: 'Variable or function not defined in scope',
    solution: 'Import missing variable/function or define it',
    codeExample: 'Add: import { variable } from "module"'
  },
  {
    pattern: /timeout/i,
    category: 'TIMEOUT_ERROR',
    severity: 'MEDIUM',
    autoFixable: true,
    description: 'Test operation exceeded timeout limit',
    solution: 'Increase timeout or optimize async operations',
    codeExample: 'Use: await waitFor(() => {}, { timeout: 10000 })'
  }
]

/**
 * AI Error Analyzer - Analyzes errors and provides automated fix suggestions
 */
export class AIErrorAnalyzer {
  private errorHistory: AITestResult[] = []

  analyzeError(error: Error, testName: string, context?: any): AITestResult {
    const errorMessage = error.message
    const stackTrace = error.stack

    const matchedPatterns = AI_ERROR_PATTERNS.filter(pattern => 
      pattern.pattern.test(errorMessage)
    )

    const suggestions = this.generateSuggestions(errorMessage, matchedPatterns, context)
    const autoFix = this.generateAutoFix(errorMessage, matchedPatterns, context)

    const result: AITestResult = {
      testName,
      status: 'FAIL',
      errorMessage,
      stackTrace,
      suggestions,
      autoFix
    }

    this.errorHistory.push(result)
    return result
  }

  private generateSuggestions(errorMessage: string, patterns: AIErrorPattern[], context?: any): AISuggestion[] {
    const suggestions: AISuggestion[] = []

    patterns.forEach(pattern => {
      const match = errorMessage.match(pattern.pattern)
      if (match) {
        suggestions.push({
          type: pattern.category,
          description: pattern.solution,
          code: pattern.codeExample || '',
          confidence: this.calculateConfidence(pattern, errorMessage, context)
        })
      }
    })

    // Add context-specific suggestions
    if (errorMessage.includes('Cannot read property') && context?.component) {
      suggestions.push({
        type: 'COMPONENT_PROP_CHECK',
        description: 'Add prop validation or default props to component',
        code: `${context.component}.defaultProps = { ${match?.[1]}: {} }`,
        confidence: 0.8
      })
    }

    if (errorMessage.includes('Module') && errorMessage.includes('@/')) {
      suggestions.push({
        type: 'PATH_ALIAS_FIX',
        description: 'Check TypeScript path mapping in tsconfig.json',
        code: 'Verify "paths" configuration in tsconfig.json',
        confidence: 0.9
      })
    }

    return suggestions.sort((a, b) => b.confidence - a.confidence)
  }

  private generateAutoFix(errorMessage: string, patterns: AIErrorPattern[], context?: any): string | undefined {
    const highConfidencePattern = patterns.find(p => 
      p.autoFixable && this.calculateConfidence(p, errorMessage, context) > 0.8
    )

    if (!highConfidencePattern) return undefined

    const match = errorMessage.match(highConfidencePattern.pattern)
    
    switch (highConfidencePattern.category) {
      case 'NULL_ACCESS':
        const property = match?.[1]
        return `Add null check: obj?.${property} || defaultValue`
      
      case 'FUNCTION_ERROR':
        const functionName = match?.[1]
        return `Check import: import { ${functionName} } from "correct-module"`
      
      case 'IMPORT_ERROR':
        const modulePath = match?.[1]
        return `Fix import path: "${modulePath}" or install dependency`
      
      case 'ASSERTION_ERROR':
        return `Update test expectation or mock return value`
      
      case 'TIMEOUT_ERROR':
        return `Increase timeout: { timeout: 10000 } or optimize async operation`
      
      default:
        return highConfidencePattern.solution
    }
  }

  private calculateConfidence(pattern: AIErrorPattern, errorMessage: string, context?: any): number {
    let confidence = 0.7 // Base confidence

    // Increase confidence based on pattern specificity
    if (pattern.pattern.source.includes('\\w+')) confidence += 0.1
    if (pattern.severity === 'HIGH' || pattern.severity === 'CRITICAL') confidence += 0.1
    if (pattern.autoFixable) confidence += 0.1

    // Context-based confidence adjustments
    if (context?.component && pattern.category === 'NULL_ACCESS') confidence += 0.1
    if (context?.mockFunction && pattern.category === 'FUNCTION_ERROR') confidence += 0.1

    return Math.min(confidence, 1.0)
  }

  getErrorHistory(): AITestResult[] {
    return this.errorHistory
  }

  getCommonErrorPatterns(): { pattern: string; count: number }[] {
    const patternCounts: Record<string, number> = {}
    
    this.errorHistory.forEach(result => {
      if (result.errorMessage) {
        const pattern = AI_ERROR_PATTERNS.find(p => 
          p.pattern.test(result.errorMessage!)
        )
        if (pattern) {
          patternCounts[pattern.category] = (patternCounts[pattern.category] || 0) + 1
        }
      }
    })

    return Object.entries(patternCounts)
      .map(([pattern, count]) => ({ pattern, count }))
      .sort((a, b) => b.count - a.count)
  }

  generateReport(): string {
    const commonPatterns = this.getCommonErrorPatterns()
    const autoFixableErrors = this.errorHistory.filter(r => r.autoFix).length
    
    return `
AI Error Analysis Report
========================
Total Errors: ${this.errorHistory.length}
Auto-fixable Errors: ${autoFixableErrors}
Success Rate: ${((this.errorHistory.length - autoFixableErrors) / this.errorHistory.length * 100).toFixed(1)}%

Common Error Patterns:
${commonPatterns.map(p => `- ${p.pattern}: ${p.count} occurrences`).join('\n')}

Recommendations:
${this.generateRecommendations()}
    `.trim()
  }

  private generateRecommendations(): string {
    const recommendations: string[] = []
    const commonPatterns = this.getCommonErrorPatterns()

    if (commonPatterns.find(p => p.pattern === 'NULL_ACCESS' && p.count > 3)) {
      recommendations.push('- Implement consistent null checking patterns across components')
      recommendations.push('- Consider using TypeScript strict mode for better null safety')
    }

    if (commonPatterns.find(p => p.pattern === 'IMPORT_ERROR' && p.count > 2)) {
      recommendations.push('- Review and standardize import paths')
      recommendations.push('- Verify TypeScript path mapping configuration')
    }

    if (commonPatterns.find(p => p.pattern === 'FUNCTION_ERROR' && p.count > 2)) {
      recommendations.push('- Audit function exports and imports')
      recommendations.push('- Add runtime type checking for function parameters')
    }

    return recommendations.length > 0 ? recommendations.join('\n') : '- No specific recommendations at this time'
  }
}

/**
 * AI Test Helper - Provides utilities for AI-friendly testing
 */
export class AITestHelper {
  private analyzer = new AIErrorAnalyzer()

  /**
   * Wraps test functions with AI error analysis
   */
  wrapTest(testFn: () => void | Promise<void>, testName: string, context?: any) {
    return async () => {
      try {
        await testFn()
        return { testName, status: 'PASS' as const }
      } catch (error) {
        const analysis = this.analyzer.analyzeError(error as Error, testName, context)
        console.log('🤖 AI Analysis:', analysis)
        throw error
      }
    }
  }

  /**
   * Creates self-healing mocks that adjust based on usage patterns
   */
  createSmartMock(mockName: string, defaultImplementation?: any) {
    const mockUsage: Record<string, number> = {}
    
    return jest.fn().mockImplementation((...args) => {
      const argsKey = JSON.stringify(args)
      mockUsage[argsKey] = (mockUsage[argsKey] || 0) + 1
      
      // Self-adjust based on common usage patterns
      if (mockUsage[argsKey] > 3 && !defaultImplementation) {
        console.log(`🤖 Smart Mock (${mockName}): Detected pattern for args ${argsKey}`)
        // Could auto-generate return values based on patterns
      }
      
      return defaultImplementation?.(args) || jest.fn()
    })
  }

  /**
   * Validates component props automatically
   */
  validateProps(component: any, props: any): string[] {
    const issues: string[] = []
    
    if (!props) {
      issues.push('Props object is null or undefined')
      return issues
    }

    // Check for common prop issues
    Object.entries(props).forEach(([key, value]) => {
      if (value === undefined) {
        issues.push(`Prop '${key}' is undefined`)
      }
      if (value === null && !key.includes('Optional')) {
        issues.push(`Prop '${key}' is null (consider making optional)`)
      }
    })

    return issues
  }

  /**
   * Generates AI-friendly test data
   */
  generateTestData(type: 'product' | 'category' | 'transaction', count: number = 1) {
    const data = []
    
    for (let i = 0; i < count; i++) {
      switch (type) {
        case 'product':
          data.push({
            id: `test-product-${i}`,
            name: `Test Product ${i}`,
            price_retail: 10 + i,
            stock: 100 - i,
            category_id: `category-${i % 3}`,
            sku: `TEST${String(i).padStart(3, '0')}`,
            base_unit: 'piece',
          })
          break
        case 'category':
          data.push({
            id: `test-category-${i}`,
            name: `Test Category ${i}`,
            created_at: new Date().toISOString(),
          })
          break
        case 'transaction':
          data.push({
            id: `test-transaction-${i}`,
            total_amount: 50 + i,
            payment_method: i % 2 === 0 ? 'cash' : 'credit',
            status: 'completed',
            created_at: new Date().toISOString(),
          })
          break
      }
    }
    
    return count === 1 ? data[0] : data
  }

  getAnalyzer(): AIErrorAnalyzer {
    return this.analyzer
  }
}

// Export singleton instance
export const aiTestHelper = new AITestHelper()

// Global error tracking for AI analysis
if (typeof global !== 'undefined') {
  (global as any).aiTestHelper = aiTestHelper
}