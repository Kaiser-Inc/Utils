import { test, expect } from "@playwright/test";

test.describe("Login flow", () => {
  test("shows login form", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: /entrar/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /entrar/i })).toBeVisible();
  });

  test("shows validation errors on empty submit", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("button", { name: /entrar/i }).click();
    await expect(page.getByText(/email inválido/i)).toBeVisible();
  });

  test("shows error on invalid credentials", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel(/email/i).fill("wrong@example.com");
    await page.getByLabel(/senha/i).fill("wrongpassword");
    await page.getByRole("button", { name: /entrar/i }).click();
    await expect(page.getByText(/email ou senha/i)).toBeVisible();
  });

  test("redirects unauthenticated user from dashboard to login", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login/);
  });

  test("navigates to register page", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("link", { name: /criar conta/i }).click();
    await expect(page).toHaveURL(/\/register/);
  });
});
