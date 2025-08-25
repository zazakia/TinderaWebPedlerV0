const fs = require('fs')
const path = require('path')

class AIErrorReporter {
  constructor(globalConfig, options) {
    this._globalConfig = globalConfig
    this._options = options
    this.errorPatterns = []
  }

  onRunStart() {
    // Clear previous error patterns
    this.errorPatterns = []
  }

  onTestResult(test, testResult) {
    if (testResult.numFailingTests > 0) {
      testResult.testResults.forEach(result => {
        if (result.status === 'failed') {
          result.failureMessages.forEach(message => {
            this.analyzeError(message, result.title, test.path)
          })
        }
      })
    }
  }

  onRunComplete() {
    this.generateErrorReport()
    this.generateAIFixSuggestions()
  }

  analyzeError(errorMessage, testTitle, filePath) {
    const errorPattern = {
      message: errorMessage,
      testTitle,
      filePath,
      timestamp: new Date().toISOString(),
      category: this.categorizeError(errorMessage),
      severity: this.calculateSeverity(errorMessage),
      autoFixable: this.isAutoFixable(errorMessage),
      suggestions: this.generateFixSuggestions(errorMessage),
    }

    this.errorPatterns.push(errorPattern)
  }

  categorizeError(errorMessage) {
    if (errorMessage.includes('TypeError')) return 'TYPE_ERROR'
    if (errorMessage.includes('ReferenceError')) return 'REFERENCE_ERROR'
    if (errorMessage.includes('SyntaxError')) return 'SYNTAX_ERROR'
    if (errorMessage.includes('Cannot read property')) return 'NULL_UNDEFINED_ACCESS'
    if (errorMessage.includes('is not a function')) return 'FUNCTION_NOT_FOUND'
    if (errorMessage.includes('Module not found')) return 'IMPORT_ERROR'
    if (errorMessage.includes('Expected')) return 'ASSERTION_FAILURE'
    if (errorMessage.includes('timeout')) return 'TIMEOUT_ERROR'
    if (errorMessage.includes('Network')) return 'NETWORK_ERROR'
    return 'UNKNOWN'
  }

  calculateSeverity(errorMessage) {
    if (errorMessage.includes('SyntaxError') || errorMessage.includes('Module not found')) {
      return 'HIGH'
    }
    if (errorMessage.includes('TypeError') || errorMessage.includes('ReferenceError')) {
      return 'MEDIUM'
    }
    return 'LOW'
  }

  isAutoFixable(errorMessage) {
    const autoFixablePatterns = [
      /Cannot read property '(\w+)' of undefined/,
      /Cannot read property '(\w+)' of null/,
      /(\w+) is not a function/,
      /Module.*not found/,
      /Expected.*but received/,
      /TypeError.*undefined/,
    ]

    return autoFixablePatterns.some(pattern => pattern.test(errorMessage))
  }

  generateFixSuggestions(errorMessage) {
    const suggestions = []

    // Null/undefined access
    if (errorMessage.includes("Cannot read property") && errorMessage.includes("undefined")) {
      suggestions.push({
        type: 'ADD_NULL_CHECK',
        description: 'Add null/undefined checks before property access',
        code: 'Use optional chaining (?.) or add conditional checks'
      })
    }

    // Function not found
    if (errorMessage.includes("is not a function")) {
      suggestions.push({
        type: 'CHECK_IMPORT',
        description: 'Verify function import and export',
        code: 'Check if function is properly exported and imported'
      })
    }

    // Module not found
    if (errorMessage.includes("Module") && errorMessage.includes("not found")) {
      suggestions.push({
        type: 'FIX_IMPORT_PATH',
        description: 'Fix import path or install missing dependency',
        code: 'Check file path and npm dependencies'
      })
    }

    // Type errors
    if (errorMessage.includes("TypeError")) {
      suggestions.push({
        type: 'ADD_TYPE_VALIDATION',
        description: 'Add type checking or validation',
        code: 'Use TypeScript types or runtime validation'
      })
    }

    return suggestions
  }

  generateErrorReport() {
    const reportDir = path.join(process.cwd(), 'tests', 'reports')
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true })
    }

    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalErrors: this.errorPatterns.length,
        autoFixableErrors: this.errorPatterns.filter(e => e.autoFixable).length,
        errorsByCategory: this.groupBy(this.errorPatterns, 'category'),
        errorsBySeverity: this.groupBy(this.errorPatterns, 'severity'),
      },
      errors: this.errorPatterns,
      recommendations: this.generateRecommendations(),
    }

    fs.writeFileSync(
      path.join(reportDir, 'ai-error-report.json'),
      JSON.stringify(report, null, 2)
    )

    console.log(`\\n🤖 AI Error Report generated: ${this.errorPatterns.length} errors analyzed`)
    console.log(`📊 Auto-fixable errors: ${report.summary.autoFixableErrors}`)
  }

  generateAIFixSuggestions() {
    const fixSuggestions = this.errorPatterns
      .filter(error => error.autoFixable)
      .map(error => ({
        file: error.filePath,
        test: error.testTitle,
        error: error.message,
        category: error.category,
        fixes: error.suggestions,
        priority: error.severity,
      }))

    if (fixSuggestions.length > 0) {
      const reportDir = path.join(process.cwd(), 'tests', 'reports')
      fs.writeFileSync(
        path.join(reportDir, 'ai-fix-suggestions.json'),
        JSON.stringify({ fixes: fixSuggestions }, null, 2)
      )

      console.log(`\\n🔧 Generated ${fixSuggestions.length} auto-fix suggestions`)
      console.log('📁 Check tests/reports/ai-fix-suggestions.json for detailed fixes')
    }
  }

  generateRecommendations() {
    const recommendations = []
    const errorsByCategory = this.groupBy(this.errorPatterns, 'category')

    // Analyze patterns and generate recommendations
    if (errorsByCategory.NULL_UNDEFINED_ACCESS?.length > 3) {
      recommendations.push({
        type: 'PATTERN_DETECTION',
        issue: 'Multiple null/undefined access errors detected',
        solution: 'Implement consistent null checking patterns across the codebase',
        priority: 'HIGH'
      })
    }

    if (errorsByCategory.IMPORT_ERROR?.length > 2) {
      recommendations.push({
        type: 'DEPENDENCY_ISSUE',
        issue: 'Multiple import errors detected',
        solution: 'Review and standardize import paths and dependencies',
        priority: 'MEDIUM'
      })
    }

    return recommendations
  }

  groupBy(array, key) {
    return array.reduce((groups, item) => {
      const group = item[key]
      groups[group] = groups[group] || []
      groups[group].push(item)
      return groups
    }, {})
  }
}

module.exports = AIErrorReporter