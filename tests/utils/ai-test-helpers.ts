/**
 * Lightweight AI test helpers used by the test-suite.
 *
 * This file provides a minimal in-memory error analyzer used by a few tests
 * to simulate error analysis, suggestions, and basic reporting. It is intentionally
 * small and synchronous-friendly so tests can rely on predictable behavior.
 *
 * Exported:
 *  - type AIErrorAnalyzer
 *  - const aiTestHelper
 */

export type AIErrorSuggestion = {
  type: string
  description: string
}

export type AIAnalysis = {
  context?: string
  suggestions: AIErrorSuggestion[]
  autoFix: string[]
}

export interface AIErrorAnalyzer {
  getErrorHistory(): Array<{ error: any; label?: string; time: number }>
  analyzeError(err: any, context?: string): AIAnalysis
  generateReport(): string
  clear(): void
}

/**
 * Factory that creates a minimal AI error analyzer.
 */
function createAnalyzer(): AIErrorAnalyzer {
  const errorHistory: Array<{ error: any; label?: string; time: number }> = []

  return {
    getErrorHistory() {
      return errorHistory
    },

    analyzeError(err: any, context?: string): AIAnalysis {
      // Record the error for later inspection
      try {
        errorHistory.push({ error: err, label: context, time: Date.now() })
      } catch {
        // be defensive — tests shouldn't throw from analyzer
      }

      // Produce a small set of deterministic suggestions so tests can assert them
      const suggestions: AIErrorSuggestion[] = []

      const message = String(err?.message ?? err ?? '')

      if (/Cannot read property|Cannot read|of undefined|null/.test(message)) {
        suggestions.push({
          type: 'NULL_ACCESS',
          description: 'Add null/undefined checks or optional chaining to avoid runtime null access.',
        })
        return {
          context,
          suggestions,
          autoFix: ['Add optional chaining or null checks where values may be null/undefined'],
        }
      }

      if (/Module not found|Can'?t resolve|Cannot find module/.test(message)) {
        suggestions.push({
          type: 'IMPORT_ERROR',
          description: 'Fix import path or install missing dependency.',
        })
        return {
          context,
          suggestions,
          autoFix: ['Check and correct the import path', 'Install the missing dependency if required'],
        }
      }

      // Generic fallback suggestion
      suggestions.push({
        type: 'GENERIC',
        description: 'Inspect the error message and stack trace to determine the root cause.',
      })

      return {
        context,
        suggestions,
        autoFix: ['No automatic fix available'],
      }
    },

    generateReport(): string {
      const total = errorHistory.length
      const lines = errorHistory.map(
        (e, i) => `${i + 1}. ${String(e.error?.message ?? e.error ?? 'unknown')} (${e.label ?? 'no-context'})`
      )
      return `AI Error Analysis Report\nTotal Errors: ${total}\n${lines.join('\n')}`
    },

    clear() {
      errorHistory.length = 0
    },
  }
}

/**
 * The exported test helper.
 *
 * Provides:
 *  - getAnalyzer(): AIErrorAnalyzer
 *  - wrapTest(fn, name?, opts?): runs a test function and records errors if thrown
 */
export const aiTestHelper = (() => {
  const analyzer = createAnalyzer()

  async function wrapTest<T = any>(fn: () => T | Promise<T>, _name?: string, _opts?: any): Promise<T> {
    try {
      const result = fn()
      if (result && typeof (result as any).then === 'function') {
        return await (result as Promise<T>)
      }
      return result as T
    } catch (err) {
      // Ensure the analyzer records the error before rethrowing
      try {
        analyzer.analyzeError(err, _name)
      } catch {
        // swallow analyzer errors
      }
      throw err
    }
  }

  return {
    getAnalyzer: () => analyzer,
    wrapTest,
  }
})()
