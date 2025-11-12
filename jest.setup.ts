import '@testing-library/jest-dom'
import React from 'react'

// Make React globally available for styled-jsx and components using JSX transform
;(global as any).React = React

// Suppress styled-jsx warning about jsx attribute
const originalError = console.error
console.error = (...args: any[]) => {
  // Convert all args to string for checking
  const fullMessage = args.map(arg => String(arg)).join(' ')

  // Suppress styled-jsx warning about jsx attribute being boolean
  if (fullMessage.includes('attribute `jsx`') || fullMessage.includes('non-boolean attribute')) {
    return
  }

  originalError.call(console, ...args)
}

jest.mock('react-konva', () => ({
  Stage: ({ children }: any) => React.createElement('div', { role: 'main', 'data-testid': 'konva-stage' }, children),
  Layer: ({ children }: any) => React.createElement('div', { 'data-testid': 'konva-layer' }, children),
  Image: () => React.createElement('div', { 'data-testid': 'konva-image' }),
  Group: ({ children }: any) => React.createElement('div', { 'data-testid': 'konva-group' }, children),
  Text: ({ text }: any) => React.createElement('div', { 'data-testid': 'konva-text' }, text),
}))

jest.mock('animejs', () => ({
  animate: jest.fn((target: any, params: any) => {
    if (params.complete) {
      setTimeout(params.complete, 0)
    }
    return { pause: jest.fn(), play: jest.fn(), restart: jest.fn() }
  }),
}))

global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock Image to automatically trigger onload
class MockImage {
  onload: (() => void) | null = null
  onerror: (() => void) | null = null
  src = ''

  constructor() {
    setTimeout(() => {
      if (this.onload) {
        this.onload()
      }
    }, 0)
  }
}

;(global as any).Image = MockImage
