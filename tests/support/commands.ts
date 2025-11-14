Cypress.Commands.add("mockWalletConnection", () => {
  cy.window().then((win) => {
    win.localStorage.setItem("mockWalletConnected", "true");
  });
});

Cypress.Commands.add("clearWalletConnection", () => {
  cy.window().then((win) => {
    win.localStorage.removeItem("mockWalletConnected");
  });
});

declare global {
  namespace Cypress {
    interface Chainable {
      mockWalletConnection(): Chainable<void>;
      clearWalletConnection(): Chainable<void>;
    }
  }
}

export {};
