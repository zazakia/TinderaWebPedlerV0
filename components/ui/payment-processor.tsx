"use client"

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { toast } from 'sonner'
import { CreditCard, DollarSign, Clock, Calculator, Receipt, User, Check, AlertCircle } from 'lucide-react'

interface PaymentMethod {
  id: string
  name: string
  type: 'cash' | 'credit' | 'split'
  icon: React.ReactNode
}

interface Customer {
  id: string
  name: string
  credit_limit: number
  current_balance: number
  available_credit: number
}

interface CartItem {
  id: string
  name: string
  quantity: number
  unit_price: number
  total: number
}

interface PaymentProcessorProps {
  totalAmount: number
  cartItems: CartItem[]
  selectedCustomer?: Customer | null
  onPaymentComplete: (paymentData: PaymentData) => void
  onCancel: () => void
  isOpen: boolean
}

interface PaymentData {
  payment_method: string
  cash_amount?: number
  change_amount?: number
  credit_amount?: number
  customer_id?: string
  split_payments?: Array<{
    method: string
    amount: number
  }>
  notes?: string
}

const PAYMENT_METHODS: PaymentMethod[] = [
  { id: 'cash', name: 'Cash', type: 'cash', icon: <DollarSign className="w-5 h-5" /> },
  { id: 'credit', name: 'Credit/Utang', type: 'credit', icon: <CreditCard className="w-5 h-5" /> },
  { id: 'split', name: 'Split Payment', type: 'split', icon: <Calculator className="w-5 h-5" /> },
]

const QUICK_AMOUNTS = [10, 20, 50, 100, 200, 500, 1000, 2000]

export function PaymentProcessor({
  totalAmount,
  cartItems,
  selectedCustomer,
  onPaymentComplete,
  onCancel,
  isOpen
}: PaymentProcessorProps) {
  const [selectedMethod, setSelectedMethod] = useState<string>('cash')
  const [cashAmount, setCashAmount] = useState<string>('')
  const [changeAmount, setChangeAmount] = useState<number>(0)
  const [creditAmount, setCreditAmount] = useState<number>(0)
  const [splitPayments, setSplitPayments] = useState<Array<{method: string, amount: string}>>([
    { method: 'cash', amount: '' },
    { method: 'credit', amount: '' }
  ])
  const [notes, setNotes] = useState<string>('')
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false)
  const [isProcessing, setIsProcessing] = useState<boolean>(false)

  // Reset form when dialog opens
  useEffect(() => {
    if (isOpen) {
      setSelectedMethod('cash')
      setCashAmount('')
      setChangeAmount(0)
      setCreditAmount(totalAmount)
      setSplitPayments([
        { method: 'cash', amount: '' },
        { method: 'credit', amount: '' }
      ])
      setNotes('')
      setShowConfirmation(false)
      setIsProcessing(false)
    }
  }, [isOpen, totalAmount])

  // Calculate change when cash amount changes
  useEffect(() => {
    const cash = parseFloat(cashAmount) || 0
    const change = Math.max(0, cash - totalAmount)
    setChangeAmount(change)
  }, [cashAmount, totalAmount])

  // Handle quick amount selection
  const handleQuickAmount = (amount: number) => {
    setCashAmount(amount.toString())
  }

  // Handle split payment changes
  const handleSplitPaymentChange = (index: number, field: 'method' | 'amount', value: string) => {
    const newSplitPayments = [...splitPayments]
    newSplitPayments[index] = { ...newSplitPayments[index], [field]: value }
    setSplitPayments(newSplitPayments)
  }

  // Add new split payment
  const addSplitPayment = () => {
    setSplitPayments([...splitPayments, { method: 'cash', amount: '' }])
  }

  // Remove split payment
  const removeSplitPayment = (index: number) => {
    if (splitPayments.length > 2) {
      const newSplitPayments = splitPayments.filter((_, i) => i !== index)
      setSplitPayments(newSplitPayments)
    }
  }

  // Calculate split payment totals
  const getSplitTotal = () => {
    return splitPayments.reduce((total, payment) => {
      return total + (parseFloat(payment.amount) || 0)
    }, 0)
  }

  // Validate payment
  const validatePayment = (): { isValid: boolean, errors: string[] } => {
    const errors: string[] = []

    if (selectedMethod === 'cash') {
      const cash = parseFloat(cashAmount) || 0
      if (cash < totalAmount) {
        errors.push(`Cash amount (₱${cash.toFixed(2)}) is less than total (₱${totalAmount.toFixed(2)})`)
      }
    }

    if (selectedMethod === 'credit') {
      if (!selectedCustomer) {
        errors.push('Please select a customer for credit payment')
      } else if (selectedCustomer.available_credit < creditAmount) {
        errors.push(`Credit amount (₱${creditAmount.toFixed(2)}) exceeds available credit limit (₱${selectedCustomer.available_credit.toFixed(2)})`)
      }
    }

    if (selectedMethod === 'split') {
      const splitTotal = getSplitTotal()
      const difference = Math.abs(splitTotal - totalAmount)

      if (difference > 0.01) { // Allow for small rounding differences
        errors.push(`Split payment total (₱${splitTotal.toFixed(2)}) does not match transaction total (₱${totalAmount.toFixed(2)})`)
      }

      // Check if any split payment has credit but no customer selected
      const hasCreditPayment = splitPayments.some(p => p.method === 'credit' && parseFloat(p.amount) > 0)
      if (hasCreditPayment && !selectedCustomer) {
        errors.push('Please select a customer for credit portion of split payment')
      }

      // Check credit limit for split payments
      if (selectedCustomer && hasCreditPayment) {
        const totalCreditInSplit = splitPayments
          .filter(p => p.method === 'credit')
          .reduce((total, p) => total + (parseFloat(p.amount) || 0), 0)

        if (totalCreditInSplit > selectedCustomer.available_credit) {
          errors.push(`Credit portion (₱${totalCreditInSplit.toFixed(2)}) exceeds available credit limit`)
        }
      }
    }

    return { isValid: errors.length === 0, errors }
  }

  // Handle payment processing
  const handleProcessPayment = () => {
    const validation = validatePayment()

    if (!validation.isValid) {
      validation.errors.forEach(error => {
        toast.error(error)
      })
      return
    }

    setShowConfirmation(true)
  }

  // Confirm and complete payment
  const confirmPayment = async () => {
    setIsProcessing(true)

    try {
      let paymentData: PaymentData = {
        payment_method: selectedMethod,
        notes
      }

      if (selectedMethod === 'cash') {
        paymentData.cash_amount = parseFloat(cashAmount)
        paymentData.change_amount = changeAmount
      } else if (selectedMethod === 'credit') {
        paymentData.credit_amount = creditAmount
        paymentData.customer_id = selectedCustomer?.id
      } else if (selectedMethod === 'split') {
        paymentData.split_payments = splitPayments.map(sp => ({
          method: sp.method,
          amount: parseFloat(sp.amount) || 0
        }))
        paymentData.customer_id = selectedCustomer?.id
      }

      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 1500))

      onPaymentComplete(paymentData)
      toast.success('Payment processed successfully!')

    } catch (error) {
      console.error('Payment processing error:', error)
      toast.error('Failed to process payment. Please try again.')
    } finally {
      setIsProcessing(false)
      setShowConfirmation(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="w-5 h-5" />
            Process Payment
          </CardTitle>
          <div className="text-2xl font-bold text-primary">
            Total: ₱{totalAmount.toFixed(2)}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Customer Info */}
          {selectedCustomer && (
            <Card className="bg-muted/50">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <User className="w-4 h-4" />
                  <span className="font-medium">{selectedCustomer.name}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  <div>Credit Limit: ₱{selectedCustomer.credit_limit.toFixed(2)}</div>
                  <div>Current Balance: ₱{selectedCustomer.current_balance.toFixed(2)}</div>
                  <div className="font-medium text-green-600">
                    Available Credit: ₱{selectedCustomer.available_credit.toFixed(2)}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Payment Methods */}
          <Tabs value={selectedMethod} onValueChange={setSelectedMethod}>
            <TabsList className="grid w-full grid-cols-3">
              {PAYMENT_METHODS.map((method) => (
                <TabsTrigger key={method.id} value={method.id} className="flex items-center gap-1">
                  {method.icon}
                  <span className="hidden sm:inline">{method.name}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {/* Cash Payment */}
            <TabsContent value="cash" className="space-y-4">
              <div>
                <Label htmlFor="cash-amount">Cash Amount</Label>
                <Input
                  id="cash-amount"
                  type="number"
                  step="0.01"
                  value={cashAmount}
                  onChange={(e) => setCashAmount(e.target.value)}
                  placeholder="Enter cash amount"
                  className="text-lg"
                />
              </div>

              {/* Quick Amount Buttons */}
              <div>
                <Label>Quick Amounts</Label>
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {QUICK_AMOUNTS.map((amount) => (
                    <Button
                      key={amount}
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickAmount(amount)}
                    >
                      ₱{amount}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Change Display */}
              {changeAmount > 0 && (
                <Card className="bg-green-50 border-green-200">
                  <CardContent className="pt-4">
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground">Change</div>
                      <div className="text-2xl font-bold text-green-600">
                        ₱{changeAmount.toFixed(2)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Credit Payment */}
            <TabsContent value="credit" className="space-y-4">
              {!selectedCustomer ? (
                <div className="text-center p-6 text-muted-foreground">
                  <AlertCircle className="w-12 h-12 mx-auto mb-4" />
                  <p>Please select a customer to process credit payment</p>
                </div>
              ) : (
                <>
                  <div>
                    <Label htmlFor="credit-amount">Credit Amount</Label>
                    <Input
                      id="credit-amount"
                      type="number"
                      step="0.01"
                      value={creditAmount}
                      onChange={(e) => setCreditAmount(parseFloat(e.target.value) || 0)}
                      className="text-lg"
                      disabled
                    />
                    <div className="text-sm text-muted-foreground mt-1">
                      Amount will be added to customer's balance
                    </div>
                  </div>

                  {creditAmount > selectedCustomer.available_credit && (
                    <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                      <AlertCircle className="w-4 h-4 inline mr-2" />
                      Credit amount exceeds available credit limit
                    </div>
                  )}
                </>
              )}
            </TabsContent>

            {/* Split Payment */}
            <TabsContent value="split" className="space-y-4">
              <div>
                <Label>Split Payment Methods</Label>
                <div className="space-y-3 mt-2">
                  {splitPayments.map((payment, index) => (
                    <div key={index} className="flex gap-2">
                      <Select
                        value={payment.method}
                        onValueChange={(value) => handleSplitPaymentChange(index, 'method', value)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cash">Cash</SelectItem>
                          <SelectItem value="credit">Credit</SelectItem>
                          <SelectItem value="gcash">GCash</SelectItem>
                          <SelectItem value="check">Check</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        type="number"
                        step="0.01"
                        value={payment.amount}
                        onChange={(e) => handleSplitPaymentChange(index, 'amount', e.target.value)}
                        placeholder="Amount"
                        className="flex-1"
                      />
                      {splitPayments.length > 2 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeSplitPayment(index)}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center mt-4">
                  <Button variant="outline" size="sm" onClick={addSplitPayment}>
                    Add Payment Method
                  </Button>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">Total Split</div>
                    <div className={`font-bold ${
                      Math.abs(getSplitTotal() - totalAmount) < 0.01
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}>
                      ₱{getSplitTotal().toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Notes */}
          <div>
            <Label htmlFor="payment-notes">Notes (Optional)</Label>
            <Textarea
              id="payment-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any payment notes..."
              rows={2}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={onCancel} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleProcessPayment} className="flex-1">
              Process Payment
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Payment</AlertDialogTitle>
            <AlertDialogDescription>
              Please review the payment details before processing:
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Total Amount:</span>
              <span className="font-bold">₱{totalAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Payment Method:</span>
              <span className="capitalize">{selectedMethod}</span>
            </div>

            {selectedMethod === 'cash' && (
              <>
                <div className="flex justify-between">
                  <span>Cash Amount:</span>
                  <span>₱{parseFloat(cashAmount || '0').toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Change:</span>
                  <span>₱{changeAmount.toFixed(2)}</span>
                </div>
              </>
            )}

            {selectedMethod === 'credit' && selectedCustomer && (
              <div className="flex justify-between">
                <span>Customer:</span>
                <span>{selectedCustomer.name}</span>
              </div>
            )}

            {selectedMethod === 'split' && (
              <div className="space-y-1">
                {splitPayments.map((payment, index) => (
                  <div key={index} className="flex justify-between text-xs">
                    <span>{payment.method}:</span>
                    <span>₱{(parseFloat(payment.amount) || 0).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmPayment} disabled={isProcessing}>
              {isProcessing ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processing...
                </div>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Confirm Payment
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default PaymentProcessor
