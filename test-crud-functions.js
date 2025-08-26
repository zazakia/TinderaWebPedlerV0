/**
 * Comprehensive CRUD Functions Test Suite
 * Tests all Create, Read, Update, Delete operations for the POS system
 */

const { createClient } = require('@supabase/supabase-js')

// Initialize Supabase client
const supabaseUrl = 'https://cfsabfpjnigdcqwrqfxr.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmc2FiZnBqbmlnZGNxd3JxZnhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYwMjM5MTQsImV4cCI6MjA3MTU5OTkxNH0.TuSyFIyJ_HbSvEE0j6mY6z2Vl75ckzJp50czQ0WVu8Y'

const supabase = createClient(supabaseUrl, supabaseKey)

// Test results storage
const testResults = {
  categories: { create: false, read: false, update: false, delete: false },
  products: { create: false, read: false, update: false, delete: false },
  transactions: { create: false, read: false, update: false, delete: false },
  stock: { update: false, lowStock: false }
}

let testCategoryId = null
let testProductId = null
let testTransactionId = null

console.log('🧪 Starting CRUD Functions Test Suite...\n')

// === CATEGORIES CRUD TESTS ===
async function testCategoriesCRUD() {
  console.log('📁 Testing Categories CRUD...')
  
  try {
    // CREATE Category
    console.log('   ✏️  Testing Category CREATE...')
    const { data: newCategory, error: createError } = await supabase
      .from('categories')
      .insert({ name: `Test Category ${Date.now()}` })
      .select()
      .single()
    
    if (createError) throw createError
    testCategoryId = newCategory.id
    testResults.categories.create = true
    console.log('   ✅ Category CREATE: PASSED')
    
    // READ Categories
    console.log('   📖 Testing Category READ...')
    const { data: categories, error: readError } = await supabase
      .from('categories')
      .select('*')
      .order('name')
    
    if (readError) throw readError
    if (categories.length > 0) {
      testResults.categories.read = true
      console.log('   ✅ Category READ: PASSED')
    }
    
    // UPDATE Category
    console.log('   🔄 Testing Category UPDATE...')
    const { error: updateError } = await supabase
      .from('categories')
      .update({ name: `Updated Test Category ${Date.now()}` })
      .eq('id', testCategoryId)
    
    if (updateError) throw updateError
    testResults.categories.update = true
    console.log('   ✅ Category UPDATE: PASSED')
    
    // DELETE Category (will be done at the end)
    
  } catch (error) {
    console.log('   ❌ Category CRUD Error:', error.message)
  }
}

// === PRODUCTS CRUD TESTS ===
async function testProductsCRUD() {
  console.log('\n📦 Testing Products CRUD...')
  
  try {
    // CREATE Product
    console.log('   ✏️  Testing Product CREATE...')
    const { data: newProduct, error: createError } = await supabase
      .from('products')
      .insert({
        name: `Test Product ${Date.now()}`,
        sku: `TEST-${Date.now()}`,
        category_id: testCategoryId,
        price_retail: 100.00,
        cost: 50.00,
        stock: 50,
        unit: 'pcs',
        is_active: true
      })
      .select()
      .single()
    
    if (createError) throw createError
    testProductId = newProduct.id
    testResults.products.create = true
    console.log('   ✅ Product CREATE: PASSED')
    
    // READ Products
    console.log('   📖 Testing Product READ...')
    const { data: products, error: readError } = await supabase
      .from('products')
      .select(`
        *,
        product_group:product_groups(*)
      `)
      .eq('is_active', true)
      .order('name')
    
    if (readError) throw readError
    if (products.length > 0) {
      testResults.products.read = true
      console.log('   ✅ Product READ: PASSED')
    }
    
    // UPDATE Product
    console.log('   🔄 Testing Product UPDATE...')
    const { error: updateError } = await supabase
      .from('products')
      .update({ 
        name: `Updated Test Product ${Date.now()}`,
        price_retail: 120.00 
      })
      .eq('id', testProductId)
    
    if (updateError) throw updateError
    testResults.products.update = true
    console.log('   ✅ Product UPDATE: PASSED')
    
  } catch (error) {
    console.log('   ❌ Product CRUD Error:', error.message)
  }
}

// === STOCK MANAGEMENT TESTS ===
async function testStockManagement() {
  console.log('\n📊 Testing Stock Management...')
  
  try {
    // Test Stock Update via RPC
    console.log('   🔄 Testing Stock UPDATE via RPC...')
    const { error: stockError } = await supabase.rpc('update_product_stock', {
      p_product_id: testProductId,
      p_quantity_sold: 5
    })
    
    if (stockError) throw stockError
    testResults.stock.update = true
    console.log('   ✅ Stock UPDATE: PASSED')
    
    // Test Low Stock Products
    console.log('   📉 Testing Low Stock Products...')
    const { data: lowStockData, error: lowStockError } = await supabase
      .rpc('get_low_stock_products', { threshold: 10 })
    
    if (lowStockError) throw lowStockError
    testResults.stock.lowStock = true
    console.log('   ✅ Low Stock Query: PASSED')
    
  } catch (error) {
    console.log('   ❌ Stock Management Error:', error.message)
  }
}

// === TRANSACTIONS CRUD TESTS ===
async function testTransactionsCRUD() {
  console.log('\n💳 Testing Transactions CRUD...')
  
  try {
    // Generate receipt number
    const { data: receiptNumber, error: receiptError } = await supabase
      .rpc('generate_receipt_number')
    
    if (receiptError) throw receiptError
    
    // CREATE Transaction
    console.log('   ✏️  Testing Transaction CREATE...')
    const cartItems = [{
      product_id: testProductId,
      product_name: 'Test Product',
      quantity: 2,
      unit_name: 'pcs',
      unit_price: 100.00,
      subtotal: 200.00
    }]
    
    const { data: newTransaction, error: createError } = await supabase
      .from('transactions')
      .insert({
        receipt_number: receiptNumber,
        items: cartItems,
        subtotal: 200.00,
        tax: 20.00,
        discount: 0,
        service_fee: 0,
        delivery_fee: 0,
        total: 220.00,
        payment_method: 'cash',
        is_credit: false,
        status: 'completed'
      })
      .select()
      .single()
    
    if (createError) throw createError
    testTransactionId = newTransaction.id
    testResults.transactions.create = true
    console.log('   ✅ Transaction CREATE: PASSED')
    
    // Create transaction items
    const { error: itemsError } = await supabase
      .from('transaction_items')
      .insert({
        transaction_id: testTransactionId,
        product_id: testProductId,
        quantity: 2,
        price: 100.00,
        unit_type: 'retail'
      })
    
    if (itemsError) throw itemsError
    
    // READ Transactions
    console.log('   📖 Testing Transaction READ...')
    const { data: transactions, error: readError } = await supabase
      .from('transactions')
      .select(`
        *,
        customer:customers(*),
        transaction_items(*)
      `)
      .order('created_at', { ascending: false })
      .limit(10)
    
    if (readError) throw readError
    if (transactions.length > 0) {
      testResults.transactions.read = true
      console.log('   ✅ Transaction READ: PASSED')
    }
    
    // UPDATE Transaction (void transaction)
    console.log('   🔄 Testing Transaction UPDATE (void)...')
    const { error: updateError } = await supabase
      .from('transactions')
      .update({ 
        status: 'voided',
        notes: 'TEST: Transaction voided for testing'
      })
      .eq('id', testTransactionId)
    
    if (updateError) throw updateError
    testResults.transactions.update = true
    console.log('   ✅ Transaction UPDATE: PASSED')
    
  } catch (error) {
    console.log('   ❌ Transaction CRUD Error:', error.message)
  }
}

// === CLEANUP FUNCTION ===
async function cleanup() {
  console.log('\n🧹 Cleaning up test data...')
  
  try {
    // Delete test transaction items
    if (testTransactionId) {
      await supabase.from('transaction_items').delete().eq('transaction_id', testTransactionId)
      
      // DELETE Transaction
      const { error: deleteTransactionError } = await supabase
        .from('transactions')
        .delete()
        .eq('id', testTransactionId)
      
      if (!deleteTransactionError) {
        testResults.transactions.delete = true
        console.log('   ✅ Transaction DELETE: PASSED')
      }
    }
    
    // DELETE Product (soft delete)
    if (testProductId) {
      const { error: deleteProductError } = await supabase
        .from('products')
        .update({ is_active: false })
        .eq('id', testProductId)
      
      if (!deleteProductError) {
        testResults.products.delete = true
        console.log('   ✅ Product DELETE: PASSED')
      }
    }
    
    // DELETE Category
    if (testCategoryId) {
      const { error: deleteCategoryError } = await supabase
        .from('categories')
        .delete()
        .eq('id', testCategoryId)
      
      if (!deleteCategoryError) {
        testResults.categories.delete = true
        console.log('   ✅ Category DELETE: PASSED')
      }
    }
    
  } catch (error) {
    console.log('   ❌ Cleanup Error:', error.message)
  }
}

// === RESULTS SUMMARY ===
function printResults() {
  console.log('\n📊 CRUD Test Results Summary:')
  console.log('=====================================')
  
  // Categories
  console.log('\n📁 Categories:')
  console.log(`   CREATE: ${testResults.categories.create ? '✅ PASS' : '❌ FAIL'}`)
  console.log(`   READ:   ${testResults.categories.read ? '✅ PASS' : '❌ FAIL'}`)
  console.log(`   UPDATE: ${testResults.categories.update ? '✅ PASS' : '❌ FAIL'}`)
  console.log(`   DELETE: ${testResults.categories.delete ? '✅ PASS' : '❌ FAIL'}`)
  
  // Products
  console.log('\n📦 Products:')
  console.log(`   CREATE: ${testResults.products.create ? '✅ PASS' : '❌ FAIL'}`)
  console.log(`   READ:   ${testResults.products.read ? '✅ PASS' : '❌ FAIL'}`)
  console.log(`   UPDATE: ${testResults.products.update ? '✅ PASS' : '❌ FAIL'}`)
  console.log(`   DELETE: ${testResults.products.delete ? '✅ PASS' : '❌ FAIL'}`)
  
  // Stock Management
  console.log('\n📊 Stock Management:')
  console.log(`   UPDATE:    ${testResults.stock.update ? '✅ PASS' : '❌ FAIL'}`)
  console.log(`   LOW STOCK: ${testResults.stock.lowStock ? '✅ PASS' : '❌ FAIL'}`)
  
  // Transactions
  console.log('\n💳 Transactions:')
  console.log(`   CREATE: ${testResults.transactions.create ? '✅ PASS' : '❌ FAIL'}`)
  console.log(`   READ:   ${testResults.transactions.read ? '✅ PASS' : '❌ FAIL'}`)
  console.log(`   UPDATE: ${testResults.transactions.update ? '✅ PASS' : '❌ FAIL'}`)
  console.log(`   DELETE: ${testResults.transactions.delete ? '✅ PASS' : '❌ FAIL'}`)
  
  // Overall Score
  const totalTests = Object.values(testResults).reduce((sum, category) => 
    sum + Object.keys(category).length, 0)
  const passedTests = Object.values(testResults).reduce((sum, category) => 
    sum + Object.values(category).filter(Boolean).length, 0)
  
  console.log('\n=====================================')
  console.log(`Overall Score: ${passedTests}/${totalTests} tests passed`)
  console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`)
  
  if (passedTests === totalTests) {
    console.log('🎉 All CRUD functions are working correctly!')
  } else {
    console.log('⚠️  Some CRUD functions need attention.')
  }
}

// === RUN ALL TESTS ===
async function runAllTests() {
  try {
    await testCategoriesCRUD()
    await testProductsCRUD()
    await testStockManagement()
    await testTransactionsCRUD()
    await cleanup()
    printResults()
  } catch (error) {
    console.error('❌ Test suite error:', error.message)
  }
}

// Run the tests
runAllTests()