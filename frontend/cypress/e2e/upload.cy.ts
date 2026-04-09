// cypress/e2e/upload.cy.ts
// Tests the complete upload flow in a real browser

describe('Upload de Arquivo', () => {
  
  const visitAsAuthenticated = () => {
    cy.visit('/', {
      onBeforeLoad: (win) => {
        win.localStorage.setItem('filelocker_token', 'fake-jwt-token-cypress');
        win.localStorage.setItem('filelocker_user', JSON.stringify({ id: 'cypress-user', email: 'cypress@teste.com' }));
      }
    });
  };

  beforeEach(() => {
    // Intercept the API list call so the page loads without a real backend
    cy.intercept('GET', '**/files*', { statusCode: 200, body: [] }).as('getFiles');
    visitAsAuthenticated();
    cy.wait('@getFiles');
  });

  it('should display the upload dropzone', () => {
    cy.get('[data-cy=upload-dropzone]').should('be.visible');
    cy.contains('Arraste um arquivo').should('be.visible');
    cy.contains('JPG, PNG ou PDF').should('be.visible');
  });

  it('should upload a PDF and show it in the list', () => {
    const uploadedFile = {
      id: 'cypress-uuid-001',
      name: 'documento.pdf',
      url: 'https://example.com/documento.pdf',
      type: 'application/pdf',
      size: 20480,
      createdAt: new Date().toISOString(),
    };

    // Intercept the upload POST
    cy.intercept('POST', '**/files/upload', {
      statusCode: 201,
      body: uploadedFile,
    }).as('uploadFile');

    // Intercept the list refresh after upload
    cy.intercept('GET', '**/files*', {
      statusCode: 200,
      body: [uploadedFile],
    }).as('getFilesAfterUpload');

    // Select file via the hidden input
    cy.get('[data-cy=upload-input]').selectFile(
      {
        contents: Cypress.Buffer.from('%PDF-1.4 fake content'),
        fileName: 'documento.pdf',
        mimeType: 'application/pdf',
      },
      { force: true },
    );

    cy.wait('@uploadFile');
    cy.get('[data-cy=upload-success]').should('be.visible');
    cy.contains('Upload realizado com sucesso').should('be.visible');

    cy.wait('@getFilesAfterUpload');
    cy.get('[data-cy=file-card]').should('have.length', 1);
    cy.get('[data-cy=file-name]').should('contain', 'documento.pdf');
    cy.get('[data-cy=file-type]').should('contain', 'PDF');
  });

  it('should upload a PNG image and show it in the list', () => {
    const uploadedFile = {
      id: 'cypress-uuid-002',
      name: 'foto.png',
      url: 'https://example.com/foto.png',
      type: 'image/png',
      size: 51200,
      createdAt: new Date().toISOString(),
    };

    cy.intercept('POST', '**/files/upload', { statusCode: 201, body: uploadedFile }).as('uploadPng');
    cy.intercept('GET', '**/files*', { statusCode: 200, body: [uploadedFile] }).as('getAfterUpload');

    cy.get('[data-cy=upload-input]').selectFile(
      {
        contents: Cypress.Buffer.from([137, 80, 78, 71]), // PNG magic bytes
        fileName: 'foto.png',
        mimeType: 'image/png',
      },
      { force: true },
    );

    cy.wait('@uploadPng');
    cy.get('[data-cy=upload-success]').should('be.visible');
    cy.wait('@getAfterUpload');
    cy.get('[data-cy=file-type]').should('contain', 'Imagem');
  });

  it('should show error message for unsupported file type', () => {
    cy.get('[data-cy=upload-input]').selectFile(
      {
        contents: Cypress.Buffer.from('malware'),
        fileName: 'virus.exe',
        mimeType: 'application/x-msdownload',
      },
      { force: true },
    );

    cy.get('[data-cy=upload-error]').should('be.visible');
    cy.contains('Tipo não permitido').should('be.visible');
  });

  it('should show error message for files over 10MB', () => {
    // Create a buffer slightly over 10MB
    const largeBuffer = Cypress.Buffer.alloc(11 * 1024 * 1024, 'x');

    cy.get('[data-cy=upload-input]').selectFile(
      {
        contents: largeBuffer,
        fileName: 'enorme.pdf',
        mimeType: 'application/pdf',
      },
      { force: true },
    );

    cy.get('[data-cy=upload-error]').should('be.visible');
    cy.contains('muito grande').should('be.visible');
  });

  it('should dismiss success message when X is clicked', () => {
    const uploadedFile = {
      id: 'cypress-uuid-003',
      name: 'test.pdf',
      url: 'https://example.com/test.pdf',
      type: 'application/pdf',
      size: 1024,
      createdAt: new Date().toISOString(),
    };

    cy.intercept('POST', '**/files/upload', { statusCode: 201, body: uploadedFile }).as('upload');
    cy.intercept('GET', '**/files*', { statusCode: 200, body: [uploadedFile] }).as('refresh');

    cy.get('[data-cy=upload-input]').selectFile(
      { contents: Cypress.Buffer.from('%PDF'), fileName: 'test.pdf', mimeType: 'application/pdf' },
      { force: true },
    );

    cy.wait('@upload');
    cy.get('[data-cy=upload-success]').should('be.visible');
    cy.get('[data-cy=upload-success]').find('button').click();
    cy.get('[data-cy=upload-success]').should('not.exist');
  });
});