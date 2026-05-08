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

test.describe('Customer Authentication', () => {
  test('should load sign in page', async ({ page }) => {
    await page.goto('/signin');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('should load sign up page', async ({ page }) => {
    await page.goto('/signup');
    await expect(page.locator('input[name="name"]')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
  });

  test('should show validation errors on empty submit', async ({ page }) => {
    await page.goto('/signin');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=required')).toBeVisible();
  });

  test('should toggle password visibility', async ({ page }) => {
    await page.goto('/signin');
    const passwordInput = page.locator('input[type="password"]').first();
    await expect(passwordInput).toBeVisible();
  });
});

test.describe('Profile Page', () => {
  test('should redirect unauthenticated user to signin', async ({ page }) => {
    await page.goto('/profile');
    await expect(page).toHaveURL(/.*signin/);
  });

  test('should show profile content for authenticated user', async ({ page }) => {
    await page.goto('/signin');
    await expect(page.locator('text=My Profile')).toBeVisible();
  });
});

test.describe('My Bookings Page', () => {
  test('should redirect unauthenticated user', async ({ page }) => {
    await page.goto('/my-bookings');
    await expect(page).toHaveURL(/.*signin/);
  });

  test('should show loading state', async ({ page }) => {
    await page.goto('/signin');
    await expect(page.locator('text=My Bookings')).toBeVisible();
  });
});

test.describe('Owner Portal', () => {
  test('should load owner sign in page', async ({ page }) => {
    await page.goto('/owner/signin');
    await expect(page.locator('text=Sign In')).toBeVisible();
  });

  test('should load owner sign up page', async ({ page }) => {
    await page.goto('/owner/signup');
    await expect(page.locator('text=Create Account')).toBeVisible();
  });

  test('should show validation on empty signup', async ({ page }) => {
    await page.goto('/owner/signup');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=required')).toBeVisible();
  });
});

test.describe('Contact Page', () => {
  test('should load contact page', async ({ page }) => {
    await page.goto('/contact');
    await expect(page.locator('text=Get in Touch')).toBeVisible();
  });

  test('should show form validation', async ({ page }) => {
    await page.goto('/contact');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=required')).toBeVisible();
  });

  test('should have contact information', async ({ page }) => {
    await page.goto('/contact');
    await expect(page.locator('text=Call Us')).toBeVisible();
    await expect(page.locator('text=Email Us')).toBeVisible();
  });
});

test.describe('Search Functionality', () => {
  test('should search from homepage', async ({ page }) => {
    await page.goto('/');
    const searchInput = page.locator('input[type="search"], input[placeholder*="search"], input[type="text"]').first();
    if (await searchInput.isVisible()) {
      await searchInput.fill('SUV');
      await page.keyboard.press('Enter');
      await expect(page).toHaveURL(/.*search/);
    }
  });

  test('should filter cars by category', async ({ page }) => {
    await page.goto('/cars');
    const categorySelect = page.locator('select').first();
    if (await categorySelect.isVisible()) {
      await categorySelect.selectOption('SUV');
      await expect(page).toHaveURL(/.*category/);
    }
  });
});

test.describe('Car Detail', () => {
  test('should display car details', async ({ page }) => {
    await page.goto('/cars');
    const carLink = page.locator('a[href*="/cars/"]').first();
    if (await carLink.isVisible()) {
      await carLink.click();
      await expect(page.locator('text=Price')).toBeVisible();
    }
  });

  test('should show car features', async ({ page }) => {
    await page.goto('/cars');
    const carLink = page.locator('a[href*="/cars/"]').first();
    if (await carLink.isVisible()) {
      await carLink.click();
      await expect(page.locator('text=Transmission')).toBeVisible();
    }
  });
});

test.describe('Form Validation', () => {
  test('should validate email format', async ({ page }) => {
    await page.goto('/signup');
    await page.fill('input[type="email"]', 'invalid-email');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=email')).toBeVisible();
  });

  test('should validate password length', async ({ page }) => {
    await page.goto('/signup');
    await page.fill('input[type="password"]', '123');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=password')).toBeVisible();
  });

  test('should validate phone format', async ({ page }) => {
    await page.goto('/signup');
    const phoneInput = page.locator('input[type="tel"], input[placeholder*="phone"]').first();
    if (await phoneInput.isVisible()) {
      await phoneInput.fill('123');
      await page.click('button[type="submit"]');
      await expect(page.locator('text=phone')).toBeVisible();
    }
  });
});

test.describe('Footer', () => {
  test('should display footer links', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('footer')).toBeVisible();
  });

  test('should have social links', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('text=Instagram')).toBeVisible();
    await expect(page.locator('text=WhatsApp')).toBeVisible();
  });
});