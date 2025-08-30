"use client"

import React, { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { toast } from 'sonner'
import {
  Receipt,
  Printer,
  Download,
  Eye,
  Copy,
  Mail,
  MessageSquare,
  Calendar,
  Clock,
  User,
  CreditCard,
  DollarSign,
  FileText,
  Settings
} from 'lucide-react'

interface BusinessSettings {
  business_name: string
  business_address: string
  business_phone: string
  business_email?: string
  tin_number?: string
  permit_number?: string
  receipt_footer?: string
  logo_url?: string
}

interface TransactionItem {
  id: string
  product_name: string
  unit_name: string
  quantity: number
  unit_price: number
  total_price: number
}

interface Transaction {
  id: string
  transaction_number: string
  transaction_date: string
  transaction_time: string
  customer_name?: string
  customer_phone?: string
  cashier_name: string
  items: TransactionItem[]
  subtotal: number
  tax_amount: number
  discount_amount: number
  total_amount: number
  payment_method: string
  cash_amount?: number
  change_amount?: number
  credit_amount?: number
  split_payments?: Array<{
    method: string
    amount: number
  }>
  notes?: string
  status: 'completed' | 'cancelled' | 'refunded'
}

interface ReceiptGeneratorProps {
  transaction: Transaction
  businessSettings: BusinessSettings
  isOpen: boolean
  onClose: () => void
  onPrint?: () => void
  onEmail?: () => void
  onSMS?: () => void
}

const DEFAULT_BUSINESS_SETTINGS: BusinessSettings = {
  business_name: "TindahanKO POS",
  business_address: "123 Main Street, Barangay Sample, City, Province 1234",
  business_phone: "09123456789",
  business_email: "info@tindahanko.com",
  tin_number: "123-456-789-000",
  permit_number: "BP-2024-001",
  receipt_footer: "Thank you for your business!\nCome back soon!"
}

export function ReceiptGenerator({
  transaction,
  businessSettings = DEFAULT_BUSINESS_SETTINGS,
  isOpen,
  onClose,
  onPrint,
  onEmail,
  onSMS
}: ReceiptGeneratorProps) {
  const [isPreviewMode, setIsPreviewMode] = useState(true)
  const [emailAddress, setEmailAddress] = useState('')
  const [smsNumber, setSmsNumber] = useState('')
  const [showEmailDialog, setShowEmailDialog] = useState(false)
  const [showSMSDialog, setShowSMSDialog] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const receiptRef = useRef<HTMLDivElement>(null)

  const formatCurrency = (amount: number) => {
    return `₱${amount.toFixed(2)}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (timeString: string) => {
    return new Date(`2024-01-01T${timeString}`).toLocaleTimeString('en-PH', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }

  const handlePrint = () => {
    if (receiptRef.current) {
      const printContents = receiptRef.current.innerHTML
      const originalContents = document.body.innerHTML
      document.body.innerHTML = printContents
      window.print()
      document.body.innerHTML = originalContents
      window.location.reload()
    }
    onPrint?.()
    toast.success('Receipt sent to printer')
  }

  const handleDownload = () => {
    if (receiptRef.current) {
      // Create a temporary link to download as HTML
      const blob = new Blob([receiptRef.current.outerHTML], { type: 'text/html' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `receipt-${transaction.transaction_number}.html`
      link.click()
      URL.revokeObjectURL(url)
    }
    toast.success('Receipt downloaded')
  }

  const handleCopy = async () => {
    const receiptText = generateReceiptText()
    try {
      await navigator.clipboard.writeText(receiptText)
      toast.success('Receipt copied to clipboard')
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = receiptText
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      toast.success('Receipt copied to clipboard')
    }
  }

  const generateReceiptText = () => {
    let receipt = `
${businessSettings.business_name}
${businessSettings.business_address}
Phone: ${businessSettings.business_phone}
${businessSettings.business_email ? `Email: ${businessSettings.business_email}` : ''}
${businessSettings.tin_number ? `TIN: ${businessSettings.tin_number}` : ''}

=====================================
           SALES RECEIPT
=====================================

Receipt #: ${transaction.transaction_number}
Date: ${formatDate(transaction.transaction_date)}
Time: ${formatTime(transaction.transaction_time)}
Cashier: ${transaction.cashier_name}
${transaction.customer_name ? `Customer: ${transaction.customer_name}` : ''}

-------------------------------------
ITEMS PURCHASED:
-------------------------------------
`

    transaction.items.forEach(item => {
      receipt += `${item.product_name} (${item.unit_name})\n`
      receipt += `  ${item.quantity} x ${formatCurrency(item.unit_price)} = ${formatCurrency(item.total_price)}\n`
    })

    receipt += `
-------------------------------------
PAYMENT SUMMARY:
-------------------------------------
Subtotal: ${formatCurrency(transaction.subtotal)}
`

    if (transaction.discount_amount > 0) {
      receipt += `Discount: -${formatCurrency(transaction.discount_amount)}\n`
    }

    if (transaction.tax_amount > 0) {
      receipt += `Tax: ${formatCurrency(transaction.tax_amount)}\n`
    }

    receipt += `TOTAL: ${formatCurrency(transaction.total_amount)}\n`

    if (transaction.payment_method === 'cash') {
      receipt += `Cash: ${formatCurrency(transaction.cash_amount || 0)}\n`
      receipt += `Change: ${formatCurrency(transaction.change_amount || 0)}\n`
    } else if (transaction.payment_method === 'credit') {
      receipt += `Credit Payment: ${formatCurrency(transaction.credit_amount || 0)}\n`
    } else if (transaction.payment_method === 'split' && transaction.split_payments) {
      transaction.split_payments.forEach(payment => {
        receipt += `${payment.method}: ${formatCurrency(payment.amount)}\n`
      })
    }

    if (businessSettings.receipt_footer) {
      receipt += `
=====================================
${businessSettings.receipt_footer}
=====================================`
    }

    return receipt
  }

  const handleEmailSend = async () => {
    if (!emailAddress.trim()) {
      toast.error('Please enter an email address')
      return
    }

    setIsProcessing(true)
    try {
      // TODO: Implement actual email sending
      await new Promise(resolve => setTimeout(resolve, 2000))
      toast.success(`Receipt sent to ${emailAddress}`)
      setShowEmailDialog(false)
      setEmailAddress('')
      onEmail?.()
    } catch (error) {
      toast.error('Failed to send email')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleSMSSend = async () => {
    if (!smsNumber.trim()) {
      toast.error('Please enter a phone number')
      return
    }

    setIsProcessing(true)
    try {
      // TODO: Implement actual SMS sending
      await new Promise(resolve => setTimeout(resolve, 2000))
      toast.success(`Receipt sent to ${smsNumber}`)
      setShowSMSDialog(false)
      setSmsNumber('')
      onSMS?.()
    } catch (error) {
      toast.error('Failed to send SMS')
    } finally {
      setIsProcessing(false)
    }
  }

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                <Receipt className="w-5 h-5" />
                Receipt Generator
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsPreviewMode(!isPreviewMode)}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  {isPreviewMode ? 'Edit Mode' : 'Preview'}
                </Button>
                <Button variant="outline" size="sm" onClick={onClose}>
                  Close
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="grid grid-cols-1 lg:grid-cols-3 h-[calc(90vh-120px)]">
              {/* Receipt Preview */}
              <div className="lg:col-span-2 border-r">
                <ScrollArea className="h-full p-6">
                  <div
                    ref={receiptRef}
                    className="max-w-sm mx-auto bg-white p-6 font-mono text-sm border shadow-lg"
                    style={{ fontSize: '12px', lineHeight: '1.4' }}
                  >
                    {/* Business Header */}
                    <div className="text-center mb-4">
                      {businessSettings.logo_url && (
                        <img
                          src={businessSettings.logo_url}
                          alt="Logo"
                          className="w-16 h-16 mx-auto mb-2"
                        />
                      )}
                      <div className="font-bold text-lg uppercase">
                        {businessSettings.business_name}
                      </div>
                      <div className="text-xs mt-1">
                        {businessSettings.business_address}
                      </div>
                      <div className="text-xs">
                        Phone: {businessSettings.business_phone}
                      </div>
                      {businessSettings.business_email && (
                        <div className="text-xs">
                          Email: {businessSettings.business_email}
                        </div>
                      )}
                      {businessSettings.tin_number && (
                        <div className="text-xs">
                          TIN: {businessSettings.tin_number}
                        </div>
                      )}
                      {businessSettings.permit_number && (
                        <div className="text-xs">
                          Permit #: {businessSettings.permit_number}
                        </div>
                      )}
                    </div>

                    <Separator className="my-3" />

                    {/* Receipt Title */}
                    <div className="text-center font-bold mb-3">
                      SALES RECEIPT
                    </div>

                    {/* Transaction Info */}
                    <div className="space-y-1 mb-3">
                      <div className="flex justify-between">
                        <span>Receipt #:</span>
                        <span className="font-bold">{transaction.transaction_number}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Date:</span>
                        <span>{formatDate(transaction.transaction_date)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Time:</span>
                        <span>{formatTime(transaction.transaction_time)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Cashier:</span>
                        <span>{transaction.cashier_name}</span>
                      </div>
                      {transaction.customer_name && (
                        <div className="flex justify-between">
                          <span>Customer:</span>
                          <span>{transaction.customer_name}</span>
                        </div>
                      )}
                    </div>

                    <Separator className="my-3" />

                    {/* Items */}
                    <div className="mb-3">
                      <div className="font-bold mb-2">ITEMS PURCHASED:</div>
                      {transaction.items.map((item, index) => (
                        <div key={index} className="mb-2">
                          <div className="font-medium">
                            {item.product_name} ({item.unit_name})
                          </div>
                          <div className="flex justify-between text-xs">
                            <span>{item.quantity} x {formatCurrency(item.unit_price)}</span>
                            <span className="font-bold">{formatCurrency(item.total_price)}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <Separator className="my-3" />

                    {/* Payment Summary */}
                    <div className="space-y-1 mb-3">
                      <div className="font-bold mb-2">PAYMENT SUMMARY:</div>
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>{formatCurrency(transaction.subtotal)}</span>
                      </div>

                      {transaction.discount_amount > 0 && (
                        <div className="flex justify-between text-green-600">
                          <span>Discount:</span>
                          <span>-{formatCurrency(transaction.discount_amount)}</span>
                        </div>
                      )}

                      {transaction.tax_amount > 0 && (
                        <div className="flex justify-between">
                          <span>Tax:</span>
                          <span>{formatCurrency(transaction.tax_amount)}</span>
                        </div>
                      )}

                      <Separator className="my-2" />

                      <div className="flex justify-between font-bold text-lg">
                        <span>TOTAL:</span>
                        <span>{formatCurrency(transaction.total_amount)}</span>
                      </div>

                      {/* Payment Details */}
                      <div className="mt-2 pt-2 border-t">
                        {transaction.payment_method === 'cash' && (
                          <>
                            <div className="flex justify-between">
                              <span>Cash:</span>
                              <span>{formatCurrency(transaction.cash_amount || 0)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Change:</span>
                              <span>{formatCurrency(transaction.change_amount || 0)}</span>
                            </div>
                          </>
                        )}

                        {transaction.payment_method === 'credit' && (
                          <div className="flex justify-between">
                            <span>Credit Payment:</span>
                            <span>{formatCurrency(transaction.credit_amount || 0)}</span>
                          </div>
                        )}

                        {transaction.payment_method === 'split' && transaction.split_payments && (
                          <div>
                            {transaction.split_payments.map((payment, index) => (
                              <div key={index} className="flex justify-between">
                                <span>{payment.method}:</span>
                                <span>{formatCurrency(payment.amount)}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {transaction.notes && (
                      <>
                        <Separator className="my-3" />
                        <div className="mb-3">
                          <div className="font-bold mb-1">Notes:</div>
                          <div className="text-xs">{transaction.notes}</div>
                        </div>
                      </>
                    )}

                    {/* Footer */}
                    {businessSettings.receipt_footer && (
                      <>
                        <Separator className="my-3" />
                        <div className="text-center text-xs whitespace-pre-line">
                          {businessSettings.receipt_footer}
                        </div>
                      </>
                    )}

                    <div className="text-center text-xs mt-4 opacity-75">
                      Generated on {new Date().toLocaleString()}
                    </div>
                  </div>
                </ScrollArea>
              </div>

              {/* Actions Panel */}
              <div className="p-6 bg-muted/30">
                <div className="space-y-4">
                  <h3 className="font-semibold">Receipt Actions</h3>

                  <div className="grid grid-cols-1 gap-3">
                    <Button onClick={handlePrint} className="w-full">
                      <Printer className="w-4 h-4 mr-2" />
                      Print Receipt
                    </Button>

                    <Button variant="outline" onClick={handleDownload} className="w-full">
                      <Download className="w-4 h-4 mr-2" />
                      Download HTML
                    </Button>

                    <Button variant="outline" onClick={handleCopy} className="w-full">
                      <Copy className="w-4 h-4 mr-2" />
                      Copy to Clipboard
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() => setShowEmailDialog(true)}
                      className="w-full"
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      Email Receipt
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() => setShowSMSDialog(true)}
                      className="w-full"
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      SMS Receipt
                    </Button>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-medium mb-2">Transaction Status</h4>
                    <Badge
                      className={
                        transaction.status === 'completed' ? 'bg-green-100 text-green-800' :
                        transaction.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }
                    >
                      {transaction.status.toUpperCase()}
                    </Badge>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Receipt Information</h4>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {formatDate(transaction.transaction_date)}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {formatTime(transaction.transaction_time)}
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        {transaction.cashier_name}
                      </div>
                      <div className="flex items-center gap-2">
                        {transaction.payment_method === 'cash' ? <DollarSign className="w-4 h-4" /> : <CreditCard className="w-4 h-4" />}
                        {transaction.payment_method.toUpperCase()}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Items ({transaction.items.length})</h4>
                    <div className="text-sm text-muted-foreground">
                      Total Quantity: {transaction.items.reduce((sum, item) => sum + item.quantity, 0)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Email Dialog */}
      <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Email Receipt</DialogTitle>
            <DialogDescription>
              Send the receipt to customer's email address
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={emailAddress}
                onChange={(e) => setEmailAddress(e.target.value)}
                placeholder="customer@example.com"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEmailDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleEmailSend} disabled={isProcessing}>
              {isProcessing ? 'Sending...' : 'Send Email'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* SMS Dialog */}
      <Dialog open={showSMSDialog} onOpenChange={setShowSMSDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>SMS Receipt</DialogTitle>
            <DialogDescription>
              Send the receipt summary to customer's phone number
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="sms">Phone Number</Label>
              <Input
                id="sms"
                type="tel"
                value={smsNumber}
                onChange={(e) => setSmsNumber(e.target.value)}
                placeholder="09123456789"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSMSDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSMSSend} disabled={isProcessing}>
              {isProcessing ? 'Sending...' : 'Send SMS'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default ReceiptGenerator
