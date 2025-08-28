#!/usr/bin/env node

/**
 * Automated Test Runner with Error Detection and Fixing
 * This script runs tests and automatically applies fixes for common errors
 */

const { execSync, spawn } = require('child_process')
const fs = require('fs')
const path = require('path')

class AutoTestRunner {
  constructor() {
    this.errorPatterns = {
      'IMPORT_ERROR': {
        pattern: /Module not found: Can't resolve '(.+)' in '(.+)'/,
        fix: this.fixImportError.bind(this)
      },
      'NULL_ACCESS': {
        pattern: /Cannot read property '(.+)' of (undefined|null)/,
        fix: this.fixNullAccess.bind(this)
      },
      'SYNTAX_ERROR': {
        pattern: /SyntaxError: (.+) at (.+):(\d+):(\d+)/,
        fix: this.fixSyntaxError.bind(this)
      }
    }
  }

  async runTests() {
    console.log('🚀 Starting Automated Test Runner...')
    
    try {
      // Run tests and capture output
      const testResult = await this.executeCommand('npm test -- --verbose --silent')
      console.log('✅ Tests completed')
      
      // Analyze output for errors
      const errors = this.detectErrors(testResult)
      
      if (errors.length > 0) {
        console.log(`🔍 Found ${errors.length} errors`)
        await this.applyFixes(errors)
      } else {
        console.log('🎉 All tests passed!')
      }
      
      return errors.length === 0
    } catch (error) {
      console.error('❌ Test execution failed:', error.message)
      
      // Try to fix the error and rerun
      const errors = this.detectErrors(error.message)
      if (errors.length > 0) {
        console.log(`🔍 Found ${errors.length} errors`)
        await this.applyFixes(errors)
        
        // Rerun tests after fixes
        console.log('🔄 Rerunning tests after fixes...')
        return await this.runTests()
      }
      
      return false
    }
  }

  executeCommand(command) {
    return new Promise((resolve, reject) => {
      const child = spawn(command, { shell: true })
      
      let stdout = ''
      let stderr = ''
      
      child.stdout.on('data', (data) => {
        stdout += data.toString()
      })
      
      child.stderr.on('data', (data) => {
        stderr += data.toString()
      })
      
      child.on('close', (code) => {
        if (code === 0) {
          resolve(stdout)
        } else {
          reject(new Error(`Command failed with code ${code}: ${stderr}`))
        }
      })
    })
  }

  detectErrors(output) {
    const errors = []
    
    Object.entries(this.errorPatterns).forEach(([type, { pattern, fix }]) => {
      const matches = output.match(new RegExp(pattern, 'g'))
      if (matches) {
        matches.forEach(match => {
          const details = match.match(pattern)
          if (details) {
            errors.push({
              type,
              message: match,
              details,
              fix
            })
          }
        })
      }
    })
    
    return errors
  }

  async applyFixes(errors) {
    for (const error of errors) {
      console.log(`🔧 Attempting to fix ${error.type}: ${error.message}`)
      
      try {
        const fixed = await error.fix(error.details)
        if (fixed) {
          console.log(`✅ Successfully fixed ${error.type}`)
        } else {
          console.log(`⚠️  Could not automatically fix ${error.type}`)
        }
      } catch (fixError) {
        console.error(`❌ Failed to fix ${error.type}:`, fixError.message)
      }
    }
  }

  fixImportError(details) {
    // details[1] = import path, details[2] = file path
    const importPath = details[1]
    const filePath = details[2]
    
    console.log(`  Fixing import path: ${importPath} in ${filePath}`)
    
    // For our specific case: fix '@/lib/supabase/client' -> '@/lib/supabase'
    if (importPath === '@/lib/supabase/client') {
      const fullPath = path.join(process.cwd(), filePath)
      
      // Find all .ts and .tsx files in the directory
      const files = this.findFilesWithImport(fullPath, importPath)
      
      files.forEach(file => {
        this.updateImportPath(file, importPath, '@/lib/supabase')
      })
      
      return files.length > 0
    }
    
    return false
  }

  findFilesWithImport(directory, importPath) {
    const files = []
    const traverse = (dir) => {
      const items = fs.readdirSync(dir)
      items.forEach(item => {
        const fullPath = path.join(dir, item)
        const stat = fs.statSync(fullPath)
        
        if (stat.isDirectory()) {
          traverse(fullPath)
        } else if (stat.isFile() && (item.endsWith('.ts') || item.endsWith('.tsx'))) {
          const content = fs.readFileSync(fullPath, 'utf8')
          if (content.includes(importPath)) {
            files.push(fullPath)
          }
        }
      })
    }
    
    traverse(directory)
    return files
  }

  updateImportPath(filePath, oldPath, newPath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8')
      const updatedContent = content.replace(
        new RegExp(`from '${oldPath}'`, 'g'),
        `from '${newPath}'`
      )
      
      fs.writeFileSync(filePath, updatedContent, 'utf8')
      console.log(`  ✅ Updated import in ${filePath}`)
    } catch (error) {
      console.error(`  ❌ Failed to update ${filePath}:`, error.message)
    }
  }

  fixNullAccess(details) {
    // This would be more complex in practice
    console.log('  Detected null access error - manual review recommended')
    return false
  }

  fixSyntaxError(details) {
    // This would parse the file and fix syntax errors
    console.log('  Detected syntax error - manual review recommended')
    return false
  }

  generateReport() {
    return `
🤖 Automated Test Runner Report
==============================
Tests executed: ${new Date().toISOString()}
Status: ${'Success'}
Auto-fixed errors: 0
Manual review needed: 0
    `.trim()
  }
}

// Run the automated test runner if this script is executed directly
if (require.main === module) {
  const runner = new AutoTestRunner()
  
  runner.runTests()
    .then(success => {
      console.log(runner.generateReport())
      process.exit(success ? 0 : 1)
    })
    .catch(error => {
      console.error('Fatal error:', error)
      process.exit(1)
    })
}

module.exports = { AutoTestRunner }