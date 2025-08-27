"use client"

import React, { useState, useEffect } from 'react'
import { 
  ArrowLeft, 
  BarChart3, 
  TrendingUp, 
  Package, 
  Users, 
  CreditCard, 
  Filter, 
  Download,
  MapPin,
  Calendar,
  FileText
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent
} from '@/components/ui/chart'
import { useAnalytics } from '@/lib/hooks/useAnalytics'
import { useLocations } from '@/lib/hooks/useLocations'
import { CartesianGrid, Line, LineChart, Bar, BarChart, Pie, PieChart as RechartsPieChart, Cell, XAxis, YAxis } from 'recharts'

const COLORS = ['#1e40af', '#7c3aed', '#0d9488', '#d97706', '#dc2626', '#059669', '#7c2d12', '#4338ca']

export default function ConsolidatedReporting({ onBack }: { onBack: () => void }) {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d')
  const [selectedLocation, setSelectedLocation] = useState<string | 'all'>('all')
  const [activeTab, setActiveTab] = useState<'overview' | 'sales' | 'inventory' | 'customers'>('overview')
  
  const {
    loading,
    locationSalesData,
    consolidatedReportData,
    fetchAllAnalytics,
    fetchLocationSalesData
  } = useAnalytics()
  
  const { locations, loading: locationsLoading } = useLocations()

  useEffect(() => {
    fetchAllAnalytics()
  }, [])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount)
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-PH', {
      month: 'short',
      day: 'numeric'
    })
  }

  // Calculate date range based on selected time range
  const getDateRange = () => {
    const endDate = new Date()
    let startDate = new Date()
    
    switch (timeRange) {
      case '7d':
        startDate.setDate(endDate.getDate() - 7)
        break
      case '30d':
        startDate.setMonth(endDate.getMonth() - 1)
        break
      case '90d':
        startDate.setMonth(endDate.getMonth() - 3)
        break
      case '1y':
        startDate.setFullYear(endDate.getFullYear() - 1)
        break
    }
    
    return { startDate, endDate }
  }

  // Handle time range change
  const handleTimeRangeChange = (range: '7d' | '30d' | '90d' | '1y') => {
    setTimeRange(range)
    const { startDate, endDate } = getDateRange()
    fetchAllAnalytics(startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0])
  }

  // Handle location change
  const handleLocationChange = (locationId: string | 'all') => {
    setSelectedLocation(locationId)
    const { startDate, endDate } = getDateRange()
    fetchAllAnalytics(startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0], locationId === 'all' ? undefined : locationId)
  }

  return (
    <div className="min-h-screen bg-gray-50 max-w-sm mx-auto">
      {/* Header */}
      <div className="bg-white px-4 py-4 flex items-center justify-between border-b">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" className="p-2" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">Consolidated Reports</h1>
        </div>
        <Button variant="ghost" size="sm" className="p-2">
          <Download className="h-5 w-5" />
        </Button>
      </div>

      {/* Filters */}
      <div className="p-4 space-y-4">
        {/* Time Range Selector */}
        <div className="flex gap-2 bg-white rounded-lg p-1">
          {(['7d', '30d', '90d', '1y'] as const).map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? "default" : "ghost"}
              size="sm"
              className={`flex-1 text-xs capitalize ${timeRange === range ? 'bg-pink-500 text-white' : ''}`}
              onClick={() => handleTimeRangeChange(range)}
            >
              {range}
            </Button>
          ))}
        </div>

        {/* Location Filter */}
        <div className="bg-white rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Location</span>
          </div>
          
          {locationsLoading ? (
            <div className="h-8 flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-pink-500"></div>
            </div>
          ) : (
            <div className="flex gap-2 overflow-x-auto pb-2">
              <Button
                variant={selectedLocation === 'all' ? "default" : "outline"}
                size="sm"
                className={`whitespace-nowrap ${selectedLocation === 'all' ? 'bg-pink-500 text-white' : ''}`}
                onClick={() => handleLocationChange('all')}
              >
                All Locations
              </Button>
              
              {locations.map((location) => (
                <Button
                  key={location.id}
                  variant={selectedLocation === location.id ? "default" : "outline"}
                  size="sm"
                  className={`whitespace-nowrap ${selectedLocation === location.id ? 'bg-pink-500 text-white' : ''}`}
                  onClick={() => handleLocationChange(location.id)}
                >
                  {location.name}
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="px-4 mb-4">
        <div className="flex gap-1 bg-white rounded-lg p-1">
          {([
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'sales', label: 'Sales', icon: TrendingUp },
            { id: 'inventory', label: 'Inventory', icon: Package },
            { id: 'customers', label: 'Customers', icon: Users }
          ] as const).map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? "default" : "ghost"}
              size="sm"
              className={`flex-1 flex-col items-center gap-1 text-xs py-2 ${activeTab === tab.id ? 'bg-pink-500 text-white' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="px-4 space-y-4">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                </div>
                <span className="text-xs text-gray-500">Total Revenue</span>
              </div>
              <p className="text-lg font-semibold">
                {loading ? 'Loading...' : consolidatedReportData ? formatCurrency(consolidatedReportData.total_revenue) : '₱0.00'}
              </p>
            </div>

            <div className="bg-white rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <CreditCard className="w-4 h-4 text-green-600" />
                </div>
                <span className="text-xs text-gray-500">Transactions</span>
              </div>
              <p className="text-lg font-semibold">
                {loading ? 'Loading...' : consolidatedReportData ? consolidatedReportData.total_transactions.toLocaleString() : '0'}
              </p>
            </div>

            <div className="bg-white rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <FileText className="w-4 h-4 text-purple-600" />
                </div>
                <span className="text-xs text-gray-500">Avg. Order</span>
              </div>
              <p className="text-lg font-semibold">
                {loading ? 'Loading...' : consolidatedReportData ? formatCurrency(consolidatedReportData.avg_transaction_value) : '₱0.00'}
              </p>
            </div>

            <div className="bg-white rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-orange-600" />
                </div>
                <span className="text-xs text-gray-500">Top Location</span>
              </div>
              <p className="text-sm font-semibold truncate">
                {loading ? 'Loading...' : consolidatedReportData?.top_location || 'N/A'}
              </p>
            </div>
          </div>

          {/* Location Performance */}
          <div className="bg-white rounded-lg p-4">
            <h2 className="font-semibold mb-4">Location Performance</h2>
            {loading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
              </div>
            ) : (
              <ChartContainer
                config={locationSalesData.reduce((acc, location, index) => {
                  acc[location.location_name] = {
                    label: location.location_name,
                    color: COLORS[index % COLORS.length],
                  }
                  return acc
                }, {} as Record<string, { label: string; color: string }>)}
                className="h-64 w-full"
              >
                <RechartsPieChart>
                  <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                  <Pie
                    data={locationSalesData}
                    dataKey="revenue"
                    nameKey="location_name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ location_name, percentage }) => `${location_name}: ${percentage}%`}
                  >
                    {locationSalesData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <ChartLegend content={<ChartLegendContent />} />
                </RechartsPieChart>
              </ChartContainer>
            )}
          </div>

          {/* Top Locations List */}
          <div className="bg-white rounded-lg p-4">
            <h2 className="font-semibold mb-3">Top Locations</h2>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-12 bg-gray-100 rounded animate-pulse"></div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {locationSalesData.slice(0, 5).map((location, index) => (
                  <div key={location.location_id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                        <span className="text-xs font-semibold text-gray-600">#{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium">{location.location_name}</p>
                        <p className="text-xs text-gray-500">{location.transactions} transactions</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(location.revenue)}</p>
                      <p className="text-xs text-gray-500">{location.percentage}%</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sales Tab */}
      {activeTab === 'sales' && (
        <div className="px-4 space-y-4">
          {/* Sales by Location Chart */}
          <div className="bg-white rounded-lg p-4">
            <h2 className="font-semibold mb-4">Sales by Location</h2>
            {loading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
              </div>
            ) : (
              <ChartContainer
                config={{
                  revenue: {
                    label: "Revenue",
                    color: "#ec4899",
                  },
                }}
                className="h-64 w-full"
              >
                <BarChart
                  data={locationSalesData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 40,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="location_name"
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis />
                  <ChartTooltip 
                    content={<ChartTooltipContent />} 
                    formatter={(value) => formatCurrency(Number(value))}
                  />
                  <Bar dataKey="revenue" fill="#ec4899" name="Revenue">
                    {locationSalesData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ChartContainer>
            )}
          </div>

          {/* Sales Trend */}
          <div className="bg-white rounded-lg p-4">
            <h2 className="font-semibold mb-4">Sales Trend</h2>
            {loading ? (
              <div className="h-40 flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-pink-500"></div>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <BarChart3 className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>Sales trend chart would appear here</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Inventory Tab */}
      {activeTab === 'inventory' && (
        <div className="px-4 space-y-4">
          <div className="bg-white rounded-lg p-4 text-center">
            <Package className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p className="text-gray-500">Inventory reports would appear here</p>
          </div>
        </div>
      )}

      {/* Customers Tab */}
      {activeTab === 'customers' && (
        <div className="px-4 space-y-4">
          <div className="bg-white rounded-lg p-4 text-center">
            <Users className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p className="text-gray-500">Customer reports would appear here</p>
          </div>
        </div>
      )}
    </div>
  )
}