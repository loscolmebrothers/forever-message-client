describe('Authentication Flow', () => {
  beforeEach(() => {
    cy.clearWalletConnection()
    cy.visit('/')
  })

  it('should display the homepage with ocean view', () => {
    cy.get('[role="main"]').should('exist')
  })

  it('should display login button when not authenticated', () => {
    cy.contains('Connect Wallet').should('be.visible')
  })

  it('should show create bottle button in header', () => {
    cy.get('button').contains(/Create/i).should('exist')
  })

  it('should handle wallet connection flow', () => {
    cy.contains('Connect Wallet').click()
  })

  it('should persist session across page reloads', () => {
    cy.mockWalletConnection()
    cy.visit('/')
    cy.reload()
  })
})
