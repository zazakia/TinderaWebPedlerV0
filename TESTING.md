# Testing Framework for AI-Automated Error Fixing

This comprehensive testing framework is designed to enable AI agents to automatically detect, analyze, and fix errors in the TinderaWebPedlerV0 codebase.

## 🎯 Overview

The testing framework includes:
- **Unit Tests** - Individual component and hook testing
- **Integration Tests** - Cross-component functionality testing  
- **Regression Tests** - Critical functionality protection
- **AI-Specific Tests** - Automated error pattern detection and fixing
- **Smart Mocking** - Realistic data simulation for Supabase operations

## 🚀 Quick Start

### Installation
```bash
# Install testing dependencies
npm install

# Validate test setup
node tests/validate-setup.js

# Run all tests
npm test
```

### Available Test Commands
```bash
npm run test                 # Run all tests
npm run test:watch          # Run tests in watch mode
npm run test:coverage       # Run with coverage report
npm run test:unit           # Run unit tests only
npm run test:integration    # Run integration tests only
npm run test:regression     # Run regression tests only
npm run test:ai-fix         # Run AI automated fix tests
```

## 🧠 AI-Automated Error Fixing

### How It Works

1. **Error Detection**: Tests capture errors with detailed context
2. **Pattern Analysis**: AI analyzer categorizes errors by common patterns
3. **Fix Generation**: Automated suggestions for resolving errors
4. **Learning**: System learns from error patterns to prevent future issues

### Error Categories

The AI system recognizes these error patterns:

| Category | Description | Auto-Fixable | Example Fix |
|----------|-------------|--------------|-------------|
| `NULL_ACCESS` | Property access on null/undefined | ✅ | `obj?.prop` or null checks |
| `FUNCTION_ERROR` | Undefined function calls | ✅ | Import fixes or optional calls |
| `IMPORT_ERROR` | Missing module imports | ✅ | Path corrections or installations |
| `TYPE_ERROR` | Type-related errors | ✅ | Type guards or default values |
| `ASSERTION_ERROR` | Test expectation failures | ✅ | Updated expectations or mocks |
| `TIMEOUT_ERROR` | Test timeout issues | ✅ | Timeout adjustments or mocking |

### AI Error Reports

After running tests, check `tests/reports/` for:
- `ai-error-report.json` - Detailed error analysis
- `ai-fix-suggestions.json` - Automated fix recommendations

## 📁 Project Structure

```
tests/
├── setup.ts                          # Global test configuration
├── validate-setup.js                 # Test framework validation
│
├── mocks/
│   └── supabase.ts                   # Supabase client mocks
│
├── utils/
│   ├── ai-error-reporter.js          # Custom Jest reporter for AI
│   └── ai-test-helpers.ts            # AI testing utilities
│
├── unit/
│   └── hooks/
│       ├── useProducts.test.ts       # Product hook tests
│       └── useCategories.test.ts     # Category hook tests
│
├── integration/
│   └── dashboard.test.tsx            # Dashboard component tests
│
├── regression/
│   └── critical-functionality.test.tsx # Regression protection
│
├── ai-fix/
│   └── automated-fixes.test.tsx      # AI fix pattern tests
│
└── reports/                          # Generated AI reports
    ├── ai-error-report.json
    └── ai-fix-suggestions.json
```

## 🔧 Configuration Files

### Jest Configuration (`jest.config.js`)
- Next.js integration
- TypeScript support
- AI error reporting
- Coverage thresholds
- Custom module mapping

### Test Setup (`tests/setup.ts`)
- Global mocks (Router, window objects)
- Supabase environment variables
- AI error tracking
- Test utilities

## 🎭 Mocking Strategy

### Supabase Mocks
Comprehensive mocks for all Supabase operations:
```typescript
// Example usage
import { mockSupabaseClient, mockProducts } from '../mocks/supabase'

// Automatic query building with realistic data
const products = await mockSupabaseClient
  .from('products')
  .select('*')
  .eq('category_id', '1')
```

### Smart Mocks
AI-enhanced mocks that adapt based on usage patterns:
```typescript
import { aiTestHelper } from '../utils/ai-test-helpers'

const smartMock = aiTestHelper.createSmartMock('apiCall', (args) => {
  // Auto-adjusts return values based on common patterns
  return mockData
})
```

## 📊 Testing Best Practices for AI

### 1. Descriptive Test Names
```typescript
// Good - AI can understand intent
it('should handle null product data gracefully', () => {})

// Better - AI can categorize error type
it('AI-FIX: Should detect and fix null property access', () => {})
```

### 2. Error Context Tracking
```typescript
const testFn = aiTestHelper.wrapTest(async () => {
  // Test implementation
}, 'test-name', { 
  component: 'ProductCard',
  expectedError: 'NULL_ACCESS'
})
```

### 3. Self-Healing Test Patterns
```typescript
it('should gracefully handle API failures', async () => {
  try {
    // Potentially failing operation
    await riskyOperation()
  } catch (error) {
    // AI-generated fix applied
    const fallbackResult = applyFallbackStrategy()
    expect(fallbackResult).toBeDefined()
  }
})
```

### 4. Regression Protection
```typescript
describe('REGRESSION: Critical POS Functionality', () => {
  it('REGRESSION: Cart operations must work correctly', () => {
    // Critical functionality that must never break
  })
})
```

## 🔍 Debugging and Troubleshooting

### Common Issues and AI Fixes

**Issue**: `Cannot read property 'name' of undefined`
```typescript
// AI Auto-Fix
const safeName = product?.name || 'Unknown Product'
```

**Issue**: `Module not found: '@/components/Button'`
```typescript
// AI Auto-Fix: Check import path
import Button from '@/components/ui/button'
```

**Issue**: `Expected 1 but received undefined`
```typescript
// AI Auto-Fix: Update mock return value
mockFunction.mockReturnValue(1)
```

### Manual Debugging
```bash
# Run tests with verbose output
npm test -- --verbose

# Run specific test file
npm test -- useProducts.test.ts

# Run with coverage
npm run test:coverage

# Debug AI error patterns
npm run test:ai-fix -- --verbose
```

## 📈 Monitoring and Metrics

### Coverage Targets
- **Branches**: 70%+
- **Functions**: 70%+
- **Lines**: 70%+
- **Statements**: 70%+

### AI Success Metrics
- **Auto-fixable Error Rate**: Track percentage of errors AI can fix
- **Pattern Recognition**: Monitor common error categories
- **Fix Accuracy**: Measure success rate of AI-suggested fixes

### Reports Location
- Coverage: `coverage/lcov-report/index.html`
- AI Analysis: `tests/reports/ai-error-report.json`
- Fix Suggestions: `tests/reports/ai-fix-suggestions.json`

## 🤖 AI Agent Instructions

For AI agents working with this codebase:

1. **Before Making Changes**: Run `npm run test:regression` to establish baseline
2. **After Changes**: Run full test suite and analyze AI error reports
3. **Error Handling**: Use patterns from `ai-test-helpers.ts` for consistent error detection
4. **Fix Application**: Implement suggestions from `ai-fix-suggestions.json`
5. **Learning**: Review error patterns to improve future code generation

### AI-Friendly Error Messages
The framework generates structured error messages that AI can easily parse:
```json
{
  "error": "Cannot read property 'name' of undefined",
  "category": "NULL_ACCESS",
  "autoFixable": true,
  "suggestion": "Add null check: obj?.name || defaultValue"
}
```

## 🔄 Continuous Integration

### GitHub Actions Integration
```yaml
# Example CI configuration
- name: Run Tests with AI Analysis
  run: |
    npm run test:coverage
    npm run test:ai-fix
    
- name: Upload AI Reports
  uses: actions/upload-artifact@v2
  with:
    name: ai-test-reports
    path: tests/reports/
```

### Pre-commit Hooks
```bash
# Install husky for pre-commit testing
npm install --save-dev husky

# Add pre-commit hook
npx husky add .husky/pre-commit "npm run test:regression"
```

## 📚 Additional Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Testing Next.js](https://nextjs.org/docs/testing)
- [Supabase Testing Guide](https://supabase.com/docs/guides/getting-started/local-development)

## 🆘 Support

If you encounter issues:

1. Run `node tests/validate-setup.js` to check configuration
2. Review AI error reports for automated suggestions
3. Check the console for detailed error messages with fix recommendations
4. Use AI test helpers for consistent error patterns

Remember: This framework is designed to learn and improve. The more you use it, the better it becomes at detecting and fixing errors automatically!