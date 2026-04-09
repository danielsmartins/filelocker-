// cypress/e2e/preview.cy.ts
// Tests the file preview modal

const pdfFile = {
  id: 'preview-uuid-001',
  name: 'contrato.pdf',
  url: 'https://example.com/contrato.pdf',
  type: 'application/pdf',
  size: 204800,
  createdAt: '2026-04-07T10:00:00Z',
};

const imageFile = {
  id: 'preview-uuid-002',
  name: 'banner.png',
  url: 'https://picsum.photos/400/300',
  type: 'image/png',
  size: 102400,
  createdAt: '2026-04-07T09:00:00Z',
};

describe('Preview de Arquivos', () => {
  
  const visitAsAuthenticated = () => {
    cy.visit('/', {
      onBeforeLoad: (win) => {
        win.localStorage.setItem('filelocker_token', 'fake-jwt-token-cypress');
        win.localStorage.setItem('filelocker_user', JSON.stringify({ id: 'cypress-user', email: 'cypress@teste.com' }));
      }
    });
  };

  beforeEach(() => {
    cy.intercept('GET', '**/files*', {
      statusCode: 200,
      body: [pdfFile, imageFile],
    }).as('getFiles');
    visitAsAuthenticated();
    cy.wait('@getFiles');
  });

  // ── Image preview ──────────────────────────────────────────────────────────

  it('should open preview modal when clicking an image file', () => {
    cy.get('[data-cy=file-card-select]').eq(1).click();
    cy.get('[data-cy=preview-modal]').should('be.visible');
  });

  it('should display the image tag inside the modal for image files', () => {
    cy.get('[data-cy=file-card-select]').eq(1).click();
    cy.get('[data-cy=preview-image]').should('be.visible');
    cy.get('[data-cy=preview-image]').should('have.attr', 'src', imageFile.url);
    cy.get('[data-cy=preview-image]').should('have.attr', 'alt', imageFile.name);
  });

  it('should show the correct filename in the modal header', () => {
    cy.get('[data-cy=file-card-select]').eq(1).click();
    cy.get('[data-cy=preview-filename]').should('contain', 'banner.png');
  });

  it('should close the modal when the X button is clicked', () => {
    cy.get('[data-cy=file-card-select]').eq(1).click();
    cy.get('[data-cy=preview-modal]').should('be.visible');
    cy.get('[data-cy=preview-close]').click();
    cy.get('[data-cy=preview-modal]').should('not.exist');
  });

  it('should close the modal when clicking the backdrop', () => {
    cy.get('[data-cy=file-card-select]').eq(1).click();
    cy.get('[data-cy=preview-modal]').should('be.visible');
    // Click the backdrop (the modal overlay itself)
    cy.get('[data-cy=preview-modal]').click({ force: true });
    cy.get('[data-cy=preview-modal]').should('not.exist');
  });

  // ── PDF preview ────────────────────────────────────────────────────────────

  it('should open preview modal when clicking a PDF file', () => {
    cy.get('[data-cy=file-card-select]').eq(0).click();
    cy.get('[data-cy=preview-modal]').should('be.visible');
  });

  it('should show open and download links for PDF files', () => {
    cy.get('[data-cy=file-card-select]').eq(0).click();

    cy.get('[data-cy=preview-pdf-open]')
      .should('be.visible')
      .and('have.attr', 'href', pdfFile.url)
      .and('have.attr', 'target', '_blank');

    cy.get('[data-cy=preview-pdf-download]')
      .should('be.visible')
      .and('have.attr', 'href', pdfFile.url)
      .and('have.attr', 'download', pdfFile.name);
  });

  it('should NOT show an img tag for PDF files', () => {
    cy.get('[data-cy=file-card-select]').eq(0).click();
    cy.get('[data-cy=preview-image]').should('not.exist');
  });

  it('should show correct filename for PDF in modal header', () => {
    cy.get('[data-cy=file-card-select]').eq(0).click();
    cy.get('[data-cy=preview-filename]').should('contain', 'contrato.pdf');
  });
});