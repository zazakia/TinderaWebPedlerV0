import '@testing-library/jest-dom'

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
global.localStorage = localStorageMock

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// Mock next/router
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '/',
      query: '',
      asPath: '/',
      push: jest.fn(),
      pop: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn().mockResolvedValue(undefined),
      beforePopState: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
    }
  },
}))

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      refresh: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      prefetch: jest.fn(),
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return '/'
  },
}))

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Home: () => 'Home',
  Package: () => 'Package',
  Plus: () => 'Plus',
  FileText: () => 'FileText',
  ShoppingBag: () => 'ShoppingBag',
  User: () => 'User',
  Eye: () => 'Eye',
  DollarSign: () => 'DollarSign',
  Search: () => 'Search',
  ShoppingCart: () => 'ShoppingCart',
  Minus: () => 'Minus',
  X: () => 'X',
  Edit: () => 'Edit',
  Trash2: () => 'Trash2',
  Calculator: () => 'Calculator',
  ArrowLeft: () => 'ArrowLeft',
  ChevronDown: () => 'ChevronDown',
  BarChart3: () => 'BarChart3',
  Filter: () => 'Filter',
  SortAsc: () => 'SortAsc',
  SortDesc: () => 'SortDesc',
  CheckSquare: () => 'CheckSquare',
  Square: () => 'Square',
  Save: () => 'Save',
  Upload: () => 'Upload',
  Camera: () => 'Camera',
  ImageIcon: () => 'ImageIcon',
  Mail: () => 'Mail',
}))

// Mock Supabase
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: null }),
    })),
    auth: {
      signIn: jest.fn(),
      signOut: jest.fn(),
      getUser: jest.fn(),
      onAuthStateChange: jest.fn(),
    },
  })),
}))

// Mock @supabase/ssr
jest.mock('@supabase/ssr', () => ({
  createBrowserClient: jest.fn(),
  createServerClient: jest.fn(),
}))

// Cleanup after each test
afterEach(() => {
  jest.clearAllMocks()
  localStorage.clear()
})