import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load the homepage', async ({ page }) => {
    await expect(page).toHaveTitle(/Modern Selfdrive/i);
  });

  test('should show navbar', async ({ page }) => {
    await expect(page.locator('nav')).toBeVisible();
  });

  test('should show hero section', async ({ page }) => {
    await expect(page.locator('text=Self Drive')).toBeVisible();
  });

  test('should navigate to cars page', async ({ page }) => {
    await page.click('text=Browse Cars');
    await expect(page).toHaveURL(/.*cars/);
  });
});

test.describe('Cars Listing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/cars');
  });

  test('should display car list', async ({ page }) => {
    await expect(page.locator('[class*="car"]')).toHaveCount(10);
  });

  test('should filter by category', async ({ page }) => {
    await page.selectOption('select, input', 'SUV');
    await page.waitForTimeout(500);
  });

  test('should search cars', async ({ page }) => {
    await page.fill('input[type="search"], input[placeholder*="search"]', 'Toyota');
    await page.waitForTimeout(500);
  });
});

test.describe('Authentication', () => {
  test('should show login form', async ({ page }) => {
    await page.goto('/auth');
    await expect(page.locator('input[type="email"]')).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/auth');
    await page.fill('input[type="email"]', 'invalid@test.com');
    await page.fill('input[type="password"]', 'wrong');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=Invalid')).toBeVisible();
  });

  test('should navigate to register', async ({ page }) => {
    await page.goto('/auth');
    await page.click('text=Register');
    await expect(page.locator('input[name="name"]')).toBeVisible();
  });
});

test.describe('Booking Flow', () => {
  test('should show login required message', async ({ page }) => {
    await page.goto('/cars');
    await page.click('[class*="car"] a >> nth=0');
    await page.click('text=Book Now');
    await expect(page.locator('text=Please log in')).toBeVisible();
  });

  test('should display car details', async ({ page }) => {
    await page.goto('/cars');
    await page.click('[class*="car"] >> nth=0');
    await expect(page.locator('text=Price')).toBeVisible();
  });
});

test.describe('Navigation', () => {
  test('should navigate to home', async ({ page }) => {
    await page.goto('/cars');
    await page.click('text=Modern Drive');
    await expect(page).toHaveURL('/');
  });

  test('should navigate to contact', async ({ page }) => {
    await page.click('text=Contact');
    await expect(page).toHaveURL(/.*contact/);
  });

  test('should navigate to terms', async ({ page }) => {
    await page.click('text=Terms');
    await expect(page).toHaveURL(/.*terms/);
  });
});

test.describe('Responsive Design', () => {
  test('should work on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await expect(page).toHaveTitle(/Modern Selfdrive/i);
  });

  test('should show hamburger menu on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await expect(page.locator('[class*="menu"], [class*="hamburger"]')).toBeVisible();
  });
});

test.describe('Accessibility', () => {
  test('should have proper heading structure', async ({ page }) => {
    await page.goto('/');
    const heading = page.locator('h1');
    await expect(heading).toBeVisible();
  });

  test('should have alt text on images', async ({ page }) => {
    await page.goto('/');
    const images = page.locator('img');
    const count = await images.count();
    if (count > 0) {
      for (let i = 0; i < Math.min(count, 5); i++) {
        const alt = await images.nth(i).getAttribute('alt');
        expect(alt).toBeTruthy();
      }
    }
  });

  test('should have semantic HTML', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('main')).toBeVisible();
  });
});

test.describe('Performance', () => {
  test('should load under 3 seconds', async ({ page }) => {
    const start = Date.now();
    await page.goto('/');
    const duration = Date.now() - start;
    expect(duration).toBeLessThan(3000);
  });

  test('should not have console errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    await page.goto('/');
    await page.waitForTimeout(1000);
    expect(errors.length).toBe(0);
  });
});

test.describe('Error Handling', () => {
  test('should show 404 page for invalid route', async ({ page }) => {
    await page.goto('/invalid-route-12345');
    await expect(page.locator('text=404')).toBeVisible();
  });
});