// Playwright configuration for MoonIdle smoke tests
// Run: npx playwright test

module.exports = {
  testDir: './qa',
  use: {
    headless: true,
  },
};
