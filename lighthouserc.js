/**
 * lighthouserc.js
 * Lighthouse CI Configuration
 * 
 * Runs performance, accessibility, best practices, and SEO audits on the React application.
 * This is executed via GitHub Actions. If any of the categories fall below a score of 90,
 * the CI pipeline fails and the deployment is aborted.
 */

module.exports = {
  ci: {
    collect: {
      // Point Lighthouse to the built React assets
      staticDistDir: './client/dist',
      // Optionally run against specific local URLs if a server is started
      // url: ['http://localhost:5173/'],
      numberOfRuns: 3, // Run 3 times to mitigate variance
    },
    assert: {
      assertions: {
        // Enforce strict scores across all 4 major pillars
        'categories:performance': ['error', { minScore: 0.90 }],
        'categories:accessibility': ['error', { minScore: 0.90 }],
        'categories:best-practices': ['error', { minScore: 0.90 }],
        'categories:seo': ['error', { minScore: 0.90 }],
      },
    },
    upload: {
      // Upload results to an open temporary storage for easy viewing in PRs
      target: 'temporary-public-storage',
    },
  },
};
