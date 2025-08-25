#!/usr/bin/env node

/**
 * Test Setup Validation Script
 * This script validates that the entire testing framework is properly configured
 * and can be used by AI agents for automated error detection and fixing.
 */

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

class TestValidator {
  constructor() {
    this.errors = []
    this.warnings = []
    this.passed = []
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString()
    const prefix = {
      error: '❌ ERROR',
      warning: '⚠️  WARNING', 
      success: '✅ SUCCESS',
      info: '📋 INFO'
    }[type] || '📋 INFO'
    
    console.log(`[${timestamp}] ${prefix}: ${message}`)
  }

  addError(message) {
    this.errors.push(message)
    this.log(message, 'error')
  }

  addWarning(message) {
    this.warnings.push(message)
    this.log(message, 'warning')
  }

  addSuccess(message) {
    this.passed.push(message)
    this.log(message, 'success')
  }

  validateFileExists(filePath, description) {
    if (fs.existsSync(filePath)) {
      this.addSuccess(`${description} exists: ${filePath}`)
      return true
    } else {
      this.addError(`${description} missing: ${filePath}`)
      return false
    }
  }

  validatePackageJson() {
    this.log('Validating package.json configuration...')
    
    const packagePath = path.join(process.cwd(), 'package.json')
    if (!this.validateFileExists(packagePath, 'package.json')) return
    
    try {
      const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'))
      
      // Check test scripts
      const requiredScripts = [
        'test', 'test:watch', 'test:coverage', 'test:regression', 
        'test:unit', 'test:integration', 'test:ai-fix'
      ]
      
      requiredScripts.forEach(script => {
        if (packageJson.scripts && packageJson.scripts[script]) {
          this.addSuccess(`Test script '${script}' configured`)
        } else {
          this.addError(`Test script '${script}' missing`)
        }
      })
      
      // Check testing dependencies
      const requiredDevDeps = [
        '@testing-library/jest-dom',
        '@testing-library/react',
        '@testing-library/user-event',
        'jest',
        'jest-environment-jsdom',
        '@types/jest'
      ]
      
      requiredDevDeps.forEach(dep => {
        if (packageJson.devDependencies && packageJson.devDependencies[dep]) {
          this.addSuccess(`Testing dependency '${dep}' installed`)
        } else {
          this.addError(`Testing dependency '${dep}' missing`)
        }
      })
      
    } catch (error) {
      this.addError(`Failed to parse package.json: ${error.message}`)
    }
  }

  validateJestConfig() {
    this.log('Validating Jest configuration...')
    
    const jestConfigPath = path.join(process.cwd(), 'jest.config.js')
    if (!this.validateFileExists(jestConfigPath, 'Jest config')) return
    
    try {
      const jestConfig = require(jestConfigPath)
      
      if (typeof jestConfig === 'function') {
        this.addSuccess('Jest config is properly exported as function')
      } else {
        this.addWarning('Jest config should be exported as function for Next.js')
      }
      
    } catch (error) {
      this.addError(`Failed to load jest.config.js: ${error.message}`)
    }
  }

  validateTestFiles() {
    this.log('Validating test files structure...')
    
    const testStructure = [
      { path: 'tests/setup.ts', description: 'Test setup file' },
      { path: 'tests/mocks/supabase.ts', description: 'Supabase mocks' },
      { path: 'tests/utils/ai-error-reporter.js', description: 'AI error reporter' },
      { path: 'tests/utils/ai-test-helpers.ts', description: 'AI test helpers' },
      { path: 'tests/unit/hooks/useProducts.test.ts', description: 'useProducts unit tests' },
      { path: 'tests/unit/hooks/useCategories.test.ts', description: 'useCategories unit tests' },
      { path: 'tests/integration/dashboard.test.tsx', description: 'Dashboard integration tests' },
      { path: 'tests/regression/critical-functionality.test.tsx', description: 'Regression tests' },
      { path: 'tests/ai-fix/automated-fixes.test.tsx', description: 'AI automated fixes tests' },
    ]
    
    testStructure.forEach(({ path: testPath, description }) => {
      this.validateFileExists(path.join(process.cwd(), testPath), description)
    })
  }

  validateTestDirectories() {
    this.log('Validating test directory structure...')
    
    const requiredDirs = [
      'tests',
      'tests/unit',
      'tests/unit/hooks',
      'tests/integration', 
      'tests/regression',
      'tests/ai-fix',
      'tests/mocks',
      'tests/utils',
      'tests/reports'
    ]
    
    requiredDirs.forEach(dir => {
      const dirPath = path.join(process.cwd(), dir)
      if (fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()) {
        this.addSuccess(`Test directory exists: ${dir}`)
      } else {
        if (dir === 'tests/reports') {
          // Create reports directory if it doesn't exist
          fs.mkdirSync(dirPath, { recursive: true })
          this.addSuccess(`Created test reports directory: ${dir}`)
        } else {
          this.addError(`Test directory missing: ${dir}`)
        }
      }
    })
  }

  async validateTestExecution() {
    this.log('Validating test execution...')
    
    try {
      // Test if Jest can run without errors
      execSync('npm test -- --passWithNoTests --verbose', { 
        stdio: 'pipe',
        timeout: 30000 
      })
      this.addSuccess('Jest execution validation passed')
    } catch (error) {
      this.addError(`Jest execution failed: ${error.message}`)
    }
  }

  validateAIComponents() {
    this.log('Validating AI-specific components...')
    
    // Check if AI error patterns are properly defined
    try {
      const aiHelpersPath = path.join(process.cwd(), 'tests/utils/ai-test-helpers.ts')
      const content = fs.readFileSync(aiHelpersPath, 'utf8')
      
      if (content.includes('AI_ERROR_PATTERNS')) {
        this.addSuccess('AI error patterns defined')
      } else {
        this.addError('AI error patterns not found')
      }
      
      if (content.includes('AIErrorAnalyzer')) {
        this.addSuccess('AI error analyzer class defined')
      } else {
        this.addError('AI error analyzer not found')
      }
      
      if (content.includes('generateAutoFix')) {
        this.addSuccess('Auto-fix generation capability present')
      } else {
        this.addError('Auto-fix generation not implemented')
      }
      
    } catch (error) {
      this.addError(`Failed to validate AI components: ${error.message}`)
    }
  }

  validateSupabaseMocks() {
    this.log('Validating Supabase mocks...')
    
    try {
      const mocksPath = path.join(process.cwd(), 'tests/mocks/supabase.ts')
      const content = fs.readFileSync(mocksPath, 'utf8')
      
      const requiredMocks = [
        'mockSupabaseClient',
        'mockProducts', 
        'mockCategories',
        'mockTransactions',
        'createClient'
      ]
      
      requiredMocks.forEach(mockName => {
        if (content.includes(mockName)) {
          this.addSuccess(`Supabase mock '${mockName}' defined`)
        } else {
          this.addError(`Supabase mock '${mockName}' missing`)
        }
      })
      
    } catch (error) {
      this.addError(`Failed to validate Supabase mocks: ${error.message}`)
    }
  }

  generateReport() {
    this.log('\\n=================================')
    this.log('TEST SETUP VALIDATION REPORT')
    this.log('=================================')
    
    this.log(`✅ Passed: ${this.passed.length}`)
    this.log(`⚠️  Warnings: ${this.warnings.length}`)
    this.log(`❌ Errors: ${this.errors.length}`)
    
    if (this.warnings.length > 0) {
      this.log('\\nWarnings:')
      this.warnings.forEach(warning => this.log(`  - ${warning}`))
    }
    
    if (this.errors.length > 0) {
      this.log('\\nErrors:')
      this.errors.forEach(error => this.log(`  - ${error}`))
    }
    
    const score = (this.passed.length / (this.passed.length + this.warnings.length + this.errors.length)) * 100
    this.log(`\\nOverall Score: ${score.toFixed(1)}%`)
    
    if (score >= 90) {
      this.log('🎉 Excellent! Your test setup is ready for AI-automated error fixing!', 'success')
    } else if (score >= 70) {
      this.log('👍 Good! Address the errors above to improve AI automation capability.', 'warning')
    } else {
      this.log('🔧 Setup needs work. Please fix the errors above before proceeding.', 'error')
    }

    // Generate recommendations
    this.generateRecommendations()
    
    return score
  }

  generateRecommendations() {
    this.log('\\n📋 RECOMMENDATIONS FOR AI AUTOMATION:')
    
    const recommendations = [
      '1. Run tests regularly to build error pattern history',
      '2. Review AI error reports in tests/reports/ directory', 
      '3. Use test:ai-fix script to identify auto-fixable issues',
      '4. Implement suggested fixes from AI error analyzer',
      '5. Add more test coverage for critical functionality',
      '6. Monitor regression tests to prevent functionality breaks',
      '7. Update mocks when adding new Supabase features',
      '8. Use AI test helpers for consistent error tracking'
    ]
    
    recommendations.forEach(rec => this.log(rec))
    
    this.log('\\n🤖 NEXT STEPS:')
    this.log('1. Run: npm run test:unit')
    this.log('2. Run: npm run test:integration') 
    this.log('3. Run: npm run test:regression')
    this.log('4. Run: npm run test:ai-fix')
    this.log('5. Review generated reports in tests/reports/')
  }

  async run() {
    this.log('Starting test setup validation...')
    this.log('====================================\\n')
    
    this.validateTestDirectories()
    this.validatePackageJson()
    this.validateJestConfig()
    this.validateTestFiles()
    this.validateSupabaseMocks()
    this.validateAIComponents()
    
    // Skip test execution validation in CI or if requested
    if (!process.env.SKIP_TEST_EXECUTION) {
      await this.validateTestExecution()
    }
    
    const score = this.generateReport()
    
    // Exit with error code if validation fails
    if (score < 70) {
      process.exit(1)
    }
    
    return score
  }
}

// Run validation if script is executed directly
if (require.main === module) {
  const validator = new TestValidator()
  validator.run().catch(error => {
    console.error('Validation failed:', error)
    process.exit(1)
  })
}

module.exports = TestValidator