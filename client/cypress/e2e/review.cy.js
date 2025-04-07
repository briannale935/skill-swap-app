/// <reference types = "cypress" />

describe('End-to-End Reviews Flow', () => {
    before(() => {
        // Start at the landing page. Since the app shows SignIn if not authenticated,
        // we visit "/" and then fill in credentials.
        cy.visit('/');

        // Fill in the email and password (Sign In or Sign Up) based on the text.
        cy.contains(/sign in/i).click();

        // Wait for login to complete and verify that we are no longer on the SignIn page.
        cy.url().should('not.include', '/signin');
    });

    it('should complete the reviews flow through Search, WriteReviews, ProfileReviews, and MyReviews', () => {
        // ---- SEARCH PAGE ----
        // Navigate to the Search page via the Navbar or directly.
        cy.visit('/search');
        cy.url().should('include', '/search');

        // Verify search inputs are present
        cy.get('input[placeholder="Search by Skill"]').should('exist');
        cy.get('input[placeholder="Search by Time Availability"]').should('exist');
        cy.contains('Clear Search').should('exist');

        // Type search queries
        cy.contains('Write a Review').should('exist');
        cy.contains('View Reviews').should('exist');

        // ----WRITE REVIEWS ----
        // Click the first "Write a Review" button on a user card
        cy.contains('Write a Review').first().click();

        // In the WriteReviews dialog:
        cy.get('[role="dialog"]').within(() => {
            // Verify the dialog title mentions "Write a Review for"
            cy.contains(/Write a Review for/i).should('exist');

            // Fill out the review form.
            cy.get('input[name="title"]').clear().type('E2E Review Title');
            cy.get('textarea[name="text"]').clear().type('This is an end-to-end test');

            // For the Rating component, select a 4-star rating.
            // MUI Rating renders a radiogroup, so check the 4th radio button (index 3).
            cy.get('[role = "radiogroup"] input[type = "radio"]').eq(3).check({ force: true });

            // Submit the review.
            cy.contains('Submit Review').click();
        });

        // Verify a success message appears
        cy.contains(/Review submitted successfully!/i).should('exist');

        // ---- VIEW PROFILE REVIEWS ----
        // Back on the searhc page, click the "View Reviews" button on the same user card.
        cy.contains('View Reviews').first().click();

        // In the ProfileReviews dialog, verify the review details appear.
        cy.get('[role="dialog"]').within(() => {
            cy.contains(/Profile Reviews for/i).should('exist');
            cy.contains('E2E Review Title').should('exist');
            cy.contains('This is an end-to-end test review.').should('exist');
            cy.contains(/Posted on:/i).should('exist');
            // Optionally, if review was updated, verify "Last Updated:" is shown
            // cy.contains(/Last Updated:/i).should('exist');
        });

        // Close the ProfileReviews dialog (if clicking outside works).
        cy.get('body').click(0, 0);

        // ---- MY REVIEWS ----
        // Navigate to the MyReviews page using the Navbar button.
        cy.contains('Reviews').click()
        cy.url().should('include', '/MyReviews');
        cy.contains('My Reviews').should('exist');

        // Verify the review appears on the MyReviews page.
        cy.contains('E2E Review Title').should('exist');
        cy.contains('This is an end-to-end test review.').should('exist');

        // ---- EDIT REVIEW ----
        // Click the edit icon (assumed to have aria-label "edit review") for the review.
        cy.get('[aria-label = "edit review"]').first().click();

        // In the Edit Review dialog, update the review title and content
        cy.get('[role="dialog"]').within(() => {
            cy.get('input[name="title"]').clear().type('Updated E2E Title');
            cy.get('textarea[name="text"]').clear().type('Updated review content by Cypress.');
            // Optionally update rating if needed.
            cy.contains('Save changes').click();
        });

        // Verify that the updated review appears.
        cy.contains('Updated E2E title').should('exist');
        cy.contains('Updated review content by Cypress.').should('exist');

        // ---- DELETE REVIEW ----
        // Click the delete icon (aria-label "Delete review") for the review
        cy.get('[aria-label="delete review"]').first().click();

        // In the delete confirmation dialog, click "Delete Review"
        cy.get('[role="dialog"]').within(() => {
            cy.contains(/Delete Review/i).click();
        });

        // Verify that the review is removed from the MyReviews page.
        cy.contains('Updated E2E Title').should('not.exist');
    });
});