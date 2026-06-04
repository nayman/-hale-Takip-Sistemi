import { test, expect } from '@playwright/test'

test('giriş sayfasını yükler', async ({ page }) => {
  await page.goto('/auth/signin')
  await expect(page).toHaveTitle(/İhale Yönetim Sistemi/)
})

test('giriş formunu görüntüler', async ({ page }) => {
  await page.goto('/auth/signin')
  await expect(page.getByPlaceholder('E-posta adresi')).toBeVisible()
  await expect(page.getByPlaceholder('Şifre')).toBeVisible()
})
