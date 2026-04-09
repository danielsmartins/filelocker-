// Global support file — runs before every test suite

// Silence uncaught exceptions from the app so they don't fail tests
Cypress.on('uncaught:exception', () => false);
