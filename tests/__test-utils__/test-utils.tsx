import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { ThemeProvider } from '@/components/theme-provider'

// Mock data for testing
export const mockProducts = [
  {
    id: 1,
    name: "Coke Mismo 100ML",
    price: 15.00,
    stock: 50,
    category: "Soft Drinks",
    image: "/placeholder.svg",
    baseUnit: "piece",
    cost: 12.00,
    units: [
      { name: "piece", conversionFactor: 1, price: 15.00, isBase: true, type: "retail" },
      { name: "pack", conversionFactor: 6, price: 85.00, isBase: false, type: "wholesale" },
      { name: "case", conversionFactor: 24, price: 320.00, isBase: false, type: "wholesale" }
    ]
  },
  {
    id: 2,
    name: "Piattos Cheese 40g",
    price: 25.00,
    stock: 30,
    category: "Snacks",
    image: "/placeholder.svg",
    baseUnit: "piece",
    cost: 20.00,
    units: [
      { name: "piece", conversionFactor: 1, price: 25.00, isBase: true, type: "retail" },
      { name: "box", conversionFactor: 12, price: 280.00, isBase: false, type: "wholesale" }
    ]
  },
  {
    id: 3,
    name: "Tang Orange 25g",
    price: 12.00,
    stock: 75,
    category: "Powder Drink",
    image: "/tang-orange-powder-packet.png",
    baseUnit: "piece",
    cost: 9.00,
    units: [
      { name: "piece", conversionFactor: 1, price: 12.00, isBase: true, type: "retail" },
      { name: "box", conversionFactor: 24, price: 260.00, isBase: false, type: "wholesale" }
    ]
  }
]

export const mockCartItems = [
  {
    id: 1,
    name: "Coke Mismo 100ML",
    price: 15.00,
    quantity: 2,
    unit: "piece",
    total: 30.00
  },
  {
    id: 2,
    name: "Piattos Cheese 40g",
    price: 25.00,
    quantity: 1,
    unit: "piece",
    total: 25.00
  }
]

// Custom render function that includes providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <ThemeProvider>
      {children}
    </ThemeProvider>
  )
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options })

export * from '@testing-library/react'
export { customRender as render }

// Helper function to create mock localStorage
export const createMockLocalStorage = () => {
  const store: Record<string, string> = {}

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      Object.keys(store).forEach(key => delete store[key])
    }
  }
}

// Helper function to mock localStorage for a test
export const mockLocalStorage = (initialData?: Record<string, any>) => {
  const mockStorage = createMockLocalStorage()

  if (initialData) {
    Object.entries(initialData).forEach(([key, value]) => {
      mockStorage.setItem(key, JSON.stringify(value))
    })
  }

  Object.defineProperty(window, 'localStorage', {
    value: mockStorage,
    writable: true
  })

  return mockStorage
}

// Helper function to wait for localStorage operations
export const waitForLocalStorage = () => {
  return new Promise(resolve => setTimeout(resolve, 0))
}

// Helper function to create a mock product
export const createMockProduct = (overrides = {}) => ({
  id: Math.floor(Math.random() * 1000),
  name: "Test Product",
  price: 10.00,
  stock: 100,
  category: "Test Category",
  image: "/placeholder.svg",
  baseUnit: "piece",
  cost: 8.00,
  units: [
    { name: "piece", conversionFactor: 1, price: 10.00, isBase: true, type: "retail" }
  ],
  ...overrides
})

// Helper function to create a mock cart item
export const createMockCartItem = (overrides = {}) => ({
  id: Math.floor(Math.random() * 1000),
  name: "Test Product",
  price: 10.00,
  quantity: 1,
  unit: "piece",
  total: 10.00,
  ...overrides
})

// Helper function to simulate user interactions
export const createUserEvent = () => {
  return {
    click: (element: HTMLElement) => {
      const event = new MouseEvent('click', { bubbles: true, cancelable: true })
      element.dispatchEvent(event)
    },
    type: (element: HTMLInputElement, text: string) => {
      element.value = text
      element.dispatchEvent(new Event('input', { bubbles: true }))
    },
    clear: (element: HTMLInputElement) => {
      element.value = ''
      element.dispatchEvent(new Event('input', { bubbles: true }))
    }
  }
}