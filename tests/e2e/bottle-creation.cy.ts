describe('Bottle Creation Flow', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('should open create bottle modal when clicking create button', () => {
    cy.get('button').contains(/Create/i).click()
    cy.contains('Write your message').should('be.visible')
  })

  it('should close modal when clicking close button', () => {
    cy.get('button').contains(/Create/i).click()
    cy.get('button[aria-label="Close"]').click()
    cy.contains('Write your message').should('not.exist')
  })

  it('should close modal when pressing Escape key', () => {
    cy.get('button').contains(/Create/i).click()
    cy.get('body').type('{esc}')
    cy.contains('Write your message').should('not.exist')
  })

  it('should enforce character limit of 120 characters', () => {
    const longMessage = 'a'.repeat(150)
    cy.get('button').contains(/Create/i).click()
    cy.get('textarea[placeholder="Write your message..."]').type(longMessage)
    cy.get('textarea[placeholder="Write your message..."]').should('have.value', 'a'.repeat(120))
  })

  it('should display character counter', () => {
    cy.get('button').contains(/Create/i).click()
    cy.contains('0/120').should('be.visible')
    cy.get('textarea[placeholder="Write your message..."]').type('Hello World')
    cy.contains('11/120').should('be.visible')
  })

  it('should prevent Enter key from adding newlines', () => {
    cy.get('button').contains(/Create/i).click()
    cy.get('textarea[placeholder="Write your message..."]').type('Hello{enter}World')
    cy.get('textarea[placeholder="Write your message..."]').should('have.value', 'HelloWorld')
  })

  it('should disable seal button when message is empty', () => {
    cy.get('button').contains(/Create/i).click()
    cy.get('button[aria-label*="Seal"]').should('be.disabled')
  })

  it('should enable seal button when message has content', () => {
    cy.get('button').contains(/Create/i).click()
    cy.get('textarea[placeholder="Write your message..."]').type('Test message')
    cy.get('button[aria-label*="Seal"]').should('not.be.disabled')
  })

  it('should show tooltip on seal button hover', () => {
    cy.get('button').contains(/Create/i).click()
    cy.get('textarea[placeholder="Write your message..."]').type('Test message')
    cy.get('button[aria-label*="Seal"]').trigger('mouseenter')
    cy.contains('Seal your message').should('be.visible')
  })
})
