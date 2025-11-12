# Testing Guide for Forever Message

This document provides comprehensive guidance on the testing setup and best practices for the Forever Message project.

## Overview

The project uses two complementary testing frameworks:

- **Jest + React Testing Library** - Unit and component tests
- **Cypress** - End-to-end (E2E) tests

## Table of Contents

1. [Quick Start](#quick-start)
2. [Running Tests](#running-tests)
3. [Test Structure](#test-structure)
4. [Testing Konva Components](#testing-konva-components)
5. [Writing Tests](#writing-tests)
6. [Best Practices](#best-practices)
7. [Troubleshooting](#troubleshooting)

## Quick Start

All testing dependencies are already installed. To run tests:

```bash
# Run unit/component tests
yarn test

# Run unit tests in watch mode
yarn test:watch

# Run E2E tests (headless)
yarn test:e2e

# Open Cypress UI
yarn cypress

# Run all tests
yarn test:all
```

## Running Tests

### Unit & Component Tests (Jest)

```bash
# Run all tests once
yarn test

# Run tests in watch mode (auto-reruns on file changes)
yarn test:watch

# Run tests with coverage report
yarn test:coverage
```

### E2E Tests (Cypress)

**Important:** Start the development server before running E2E tests:

```bash
# Terminal 1: Start dev server
yarn dev

# Terminal 2: Run E2E tests
yarn test:e2e
```

Or open Cypress UI for interactive testing:

```bash
yarn cypress
```

## Test Structure

```
forever-message-client/
├── tests/                  # All tests organized in one folder
│   ├── unit/               # Jest unit/component tests
│   │   ├── components/     # Component tests
│   │   │   └── CreateBottleModal.test.tsx
│   │   └── hooks/          # Hook tests
│   │       ├── useBottles.test.ts
│   │       └── useBottleQueue.test.ts
│   │
│   ├── e2e/                # Cypress E2E test specs
│   │   ├── authentication.cy.ts
│   │   └── bottle-creation.cy.ts
│   │
│   ├── support/            # Cypress custom commands & setup
│   │   ├── commands.ts
│   │   ├── component.ts
│   │   └── e2e.ts
│   │
│   ├── fixtures/           # Test data
│   └── tsconfig.json       # TypeScript config for Cypress
│
├── jest.config.ts          # Jest configuration
├── jest.setup.ts           # Jest setup & mocks
└── cypress.config.ts       # Cypress configuration
```

## Testing Konva Components

### The Challenge

**react-konva renders to a simple `<div>` in Node.js environments.** Canvas content is not accessible to DOM-based testing tools like React Testing Library.

### Solutions

#### 1. Cypress (Recommended for Konva)

Cypress runs in a real browser with actual canvas rendering:

```typescript
describe('Ocean View', () => {
  it('should render the ocean stage', () => {
    cy.visit('/')
    cy.get('[role="main"]').should('exist')
  })
})
```

#### 2. React Testing Library (Limited for Konva)

For Konva components, we mock the library in `jest.setup.ts`:

```typescript
jest.mock('react-konva', () => ({
  Stage: ({ children }: any) => <div role="main">{children}</div>,
  Layer: ({ children }: any) => <div>{children}</div>,
  // ... other mocks
}))
```

**Best approach:**
- Test React logic separately from canvas rendering
- Use Cypress for visual/canvas tests
- Test hooks (useBottles, useBottleQueue, useBottlePhysics) in isolation
- Test non-Konva components normally (CreateBottleModal, Header, LoginButton)

## Writing Tests

### Component Tests

```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import { MyComponent } from '@/components/MyComponent'

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />)
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })

  it('should handle user interaction', async () => {
    const handleClick = jest.fn()
    render(<MyComponent onClick={handleClick} />)

    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
```

### Hook Tests

```typescript
import { renderHook, waitFor } from '@testing-library/react'
import { useMyHook } from '@/hooks/useMyHook'

describe('useMyHook', () => {
  it('should fetch data on mount', async () => {
    const { result } = renderHook(() => useMyHook())

    expect(result.current.isLoading).toBe(true)

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.data).toBeDefined()
  })
})
```

### E2E Tests

```typescript
describe('User Flow', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('should complete entire flow', () => {
    // Arrange
    cy.get('button').contains('Connect Wallet').click()

    // Act
    cy.get('button').contains('Create').click()
    cy.get('textarea').type('Test message')
    cy.get('button[aria-label*="Seal"]').click()

    // Assert
    cy.contains('Your bottle is floating').should('be.visible')
  })
})
```

## Best Practices

### General

1. **Test behavior, not implementation**
   - Focus on what the user experiences
   - Avoid testing internal state or implementation details

2. **Use descriptive test names**
   ```typescript
   // Good
   it('should display error message when form submission fails', () => {})

   // Bad
   it('should work', () => {})
   ```

3. **Follow AAA pattern** (Arrange, Act, Assert)
   ```typescript
   it('should increment counter', () => {
     // Arrange
     render(<Counter initialValue={0} />)

     // Act
     fireEvent.click(screen.getByText('Increment'))

     // Assert
     expect(screen.getByText('Count: 1')).toBeInTheDocument()
   })
   ```

### Mocking

1. **Mock at the boundary**
   - Mock API calls, not internal functions
   - Use MSW (Mock Service Worker) for API mocking when possible

2. **Reset mocks between tests**
   ```typescript
   beforeEach(() => {
     jest.clearAllMocks()
   })
   ```

3. **Mock external dependencies**
   ```typescript
   jest.mock('@/lib/supabase/client', () => ({
     supabase: {
       auth: {
         getSession: jest.fn().mockResolvedValue({
           data: { session: mockSession }
         })
       }
     }
   }))
   ```

### Async Testing

Always use `waitFor` for async operations:

```typescript
await waitFor(() => {
  expect(screen.getByText('Loaded')).toBeInTheDocument()
})
```

### Accessibility

Use semantic queries when possible:

```typescript
// Preferred
screen.getByRole('button', { name: 'Submit' })
screen.getByLabelText('Email')

// Avoid (unless necessary)
screen.getByTestId('submit-button')
```

## Test Coverage

### Current Coverage Priorities

**High Priority (Must Have):**
1. Authentication flow (Cypress E2E) ✅
2. Bottle creation flow (Cypress E2E + RTL) ✅
3. Ocean bottle interactions (Cypress E2E)
4. CreateBottleModal validation (RTL) ✅
5. useBottles hook (RTL) ✅
6. useBottleQueue hook (RTL) ✅

**Medium Priority (Should Have):**
- Component tests for Header, LoginButton
- Hook tests for useAuth
- Responsive design tests (Cypress viewports)

**Low Priority (Nice to Have):**
- API route tests with MSW
- Animation quality tests
- Performance tests

### Viewing Coverage

```bash
yarn test:coverage
```

Coverage report will be generated in `coverage/` directory. Open `coverage/lcov-report/index.html` in a browser to view detailed coverage.

## Troubleshooting

### Common Issues

#### 1. "Cannot find module" errors

Make sure path aliases are configured correctly in `jest.config.ts`:

```typescript
moduleNameMapper: {
  '^@/(.*)$': '<rootDir>/$1',
}
```

#### 2. Konva-related errors in Jest

Konva is mocked in `jest.setup.ts`. If you see canvas errors, ensure the mock is loaded:

```typescript
setupFilesAfterEnv: ['<rootDir>/jest.setup.ts']
```

#### 3. Cypress can't connect

Ensure dev server is running on port 3000:

```bash
yarn dev
```

Check `cypress.config.ts` baseUrl matches your dev server.

#### 4. Tests timeout

Increase timeout for async operations:

```typescript
// Jest
jest.setTimeout(10000)

// Cypress
cy.get('button', { timeout: 10000 })
```

#### 5. RainbowKit/wagmi errors in tests

Mock these dependencies in your test files:

```typescript
jest.mock('@rainbow-me/rainbowkit', () => ({
  ConnectButton: () => <button>Connect Wallet</button>
}))
```

## CI/CD Integration

To run tests in CI:

```yaml
# Example GitHub Actions
- name: Run tests
  run: |
    yarn test
    yarn build

- name: Run E2E tests
  run: |
    yarn dev &
    yarn cypress:headless
```

## Additional Resources

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Cypress Documentation](https://docs.cypress.io/)
- [Testing Next.js](https://nextjs.org/docs/testing)
- [Konva Testing Discussion](https://github.com/konvajs/react-konva/issues/419)

## Questions?

If you encounter issues not covered in this guide, check:
1. Existing test files for examples
2. Framework documentation
3. Create an issue in the project repository
