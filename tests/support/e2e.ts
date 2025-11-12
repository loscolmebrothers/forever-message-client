import './commands'

Cypress.on('uncaught:exception', (err) => {
  if (err.message.includes('ResizeObserver')) {
    return false
  }
  if (err.message.includes('Konva')) {
    return false
  }
  return true
})
