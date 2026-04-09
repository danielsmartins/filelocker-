// cypress/e2e/list.cy.ts

const mockFiles = [
  {
    id: 'list-uuid-001',
    name: 'relatorio-anual.pdf',
    url: 'https://example.com/relatorio-anual.pdf',
    type: 'application/pdf',
    size: 204800,
    createdAt: '2026-04-07T10:00:00Z',
  },
  {
    id: 'list-uuid-002',
    name: 'foto-perfil.jpg',
    url: 'https://example.com/foto-perfil.jpg',
    type: 'image/jpeg',
    size: 51200,
    createdAt: '2026-04-06T08:30:00Z',
  },
  {
    id: 'list-uuid-003',
    name: 'diagrama.png',
    url: 'https://example.com/diagrama.png',
    type: 'image/png',
    size: 102400,
    createdAt: '2026-04-05T15:45:00Z',
  },
];

describe('Listagem de Arquivos', () => {
  
  // O SEGREDO: Uma função que injeta as chaves exatas que o seu AuthContext exige
  const visitAsAuthenticated = () => {
    cy.visit('/', {
      onBeforeLoad: (win) => {
        win.localStorage.setItem('filelocker_token', 'fake-jwt-token-cypress');
        win.localStorage.setItem('filelocker_user', JSON.stringify({ id: 'cypress-user', email: 'cypress@teste.com' }));
      }
    });
  };

  it('should show empty state when there are no files', () => {
    // 1. Intercepta a rota (dizendo que o array está vazio)
    cy.intercept('GET', '**/files*', { statusCode: 200, body: [] }).as('getFiles');
    // 2. Visita a página já como "logado"
    visitAsAuthenticated();
    // 3. Espera a requisição terminar
    cy.wait('@getFiles');
    
    cy.get('[data-cy=empty-state]').should('be.visible');
    cy.contains('Nenhum arquivo ainda').should('be.visible');
  });

  it('should render one card per file', () => {
    cy.intercept('GET', '**/files*', { statusCode: 200, body: mockFiles }).as('getFiles');
    visitAsAuthenticated();
    cy.wait('@getFiles');
    
    cy.get('[data-cy=file-list]').should('exist');
    cy.get('[data-cy=file-card]').should('have.length', 3);
  });

  it('should display file name for each card', () => {
    cy.intercept('GET', '**/files*', { statusCode: 200, body: mockFiles }).as('getFiles');
    visitAsAuthenticated();
    cy.wait('@getFiles');
    
    cy.get('[data-cy=file-name]').eq(0).should('contain', 'relatorio-anual.pdf');
    cy.get('[data-cy=file-name]').eq(1).should('contain', 'foto-perfil.jpg');
    cy.get('[data-cy=file-name]').eq(2).should('contain', 'diagrama.png');
  });

  it('should display correct type label (PDF vs Imagem)', () => {
    cy.intercept('GET', '**/files*', { statusCode: 200, body: mockFiles }).as('getFiles');
    visitAsAuthenticated();
    cy.wait('@getFiles');
    
    cy.get('[data-cy=file-type]').eq(0).should('contain', 'PDF');
    cy.get('[data-cy=file-type]').eq(1).should('contain', 'Imagem');
    cy.get('[data-cy=file-type]').eq(2).should('contain', 'Imagem');
  });

  it('should display formatted upload date for each file', () => {
    cy.intercept('GET', '**/files*', { statusCode: 200, body: mockFiles }).as('getFiles');
    visitAsAuthenticated();
    cy.wait('@getFiles');
    
    // Date is present and not empty for all cards
    cy.get('[data-cy=file-date]').each(($el) => {
      cy.wrap($el).invoke('text').should('match', /\d{2}\/\d{2}\/\d{4}/);
    });
  });

  it('should delete a file and remove it from the list', () => {
    cy.intercept('GET', '**/files*', { statusCode: 200, body: mockFiles }).as('getFiles');
    visitAsAuthenticated();
    cy.wait('@getFiles');

    cy.intercept('DELETE', `**/files/${mockFiles[0].id}`, {
      statusCode: 200,
      body: { message: 'File deleted successfully' },
    }).as('deleteFile');

    // Stub the confirmation dialog
    cy.on('window:confirm', () => true);

    cy.get('[data-cy=file-delete]').first().click();
    cy.wait('@deleteFile');
    
    cy.get('[data-cy=file-card]').should('have.length', 2);
    cy.get('[data-cy=file-name]').first().should('not.contain', 'relatorio-anual.pdf');
  });
});