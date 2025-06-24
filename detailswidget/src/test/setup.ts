import '@testing-library/jest-dom'
import { beforeAll, vi } from 'vitest'

// Mock des fonctions globales
beforeAll(() => {
  global.ResizeObserver = vi.fn(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }))
})

// Mock des icônes Lucide
vi.mock('lucide-react', () => ({
  Inbox: vi.fn(() => null),
  Download: vi.fn(() => null),
  LineChart: vi.fn(() => null),
  BarChart3: vi.fn(() => null),
}))

// Mock d'ECharts
vi.mock('echarts-for-react', () => ({
  default: vi.fn(() => null)
})) 