import { expect, test } from '@playwright/test'

async function setEnglish(page) {
  await page.context().addCookies([
    { name: 'lang', value: 'en', domain: '127.0.0.1', path: '/' },
  ])
  await page.addInitScript(() => localStorage.setItem('focus10.lang', 'en'))
}

async function signUp(page) {
  await setEnglish(page)
  await page.goto('/')
  await page.getByRole('button', { name: 'Create an account' }).click()
  await page.getByLabel('Full name').fill('Browser Test')
  const email = `browser.${Date.now()}.${Math.random()}@focus10.test`
  const password = 'browser-test-password'
  await page.getByLabel('Email').fill(email)
  await page.getByRole('textbox', { name: 'Password' }).fill(password)
  await page.getByRole('button', { name: 'Sign up', exact: true }).click()
  await expect(page).toHaveURL(/\/app$/)
  await expect(page.getByRole('heading', { name: 'Tasks' })).toBeVisible()
  return { email, password }
}

test.describe('core product journey', () => {
  test.skip(({ isMobile }) => isMobile, 'The product journey is covered once on desktop.')

  test('signs up, creates a task, tracks it, and adds manual time', async ({ page }) => {
    await signUp(page)

    await page.getByLabel('New task').fill('Browser-tested task')
    await page.getByRole('button', { name: 'Add', exact: true }).click()
    const row = page.getByRole('listitem').filter({ hasText: 'Browser-tested task' })
    await expect(row).toBeVisible()

    await row.getByRole('button', { name: 'Start the timer' }).click()
    await expect(page.getByText('Timer running')).toBeVisible()
    await page.getByRole('button', { name: 'Stop', exact: true }).click()
    await expect(page.getByText('The timer is stopped. Hit the ▶ button next to a task.')).toBeVisible()

    const entries = page.getByRole('heading', { name: 'Time entries' }).locator('..').locator('..')
    await entries.getByLabel('Task for the time entry').selectOption({ label: 'Browser-tested task' })
    await entries.getByLabel('Minutes').fill('25')
    await entries.getByRole('button', { name: 'Add time' }).click()
    await expect(entries.getByText('Browser-tested task')).toBeVisible()
    await expect(entries.getByText('25m')).toBeVisible()
  })

  test('settings, legal pages, and language switching are reachable', async ({ page }) => {
    await signUp(page)
    await page.getByRole('link', { name: 'Account settings' }).click()
    await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible()
    await page.getByLabel('Қазақша').click()
    await expect(page.getByRole('heading', { name: 'Параметрлер' })).toBeVisible()

    await page.goto('/privacy')
    await expect(page.getByRole('heading', { name: 'Құпиялық саясаты' })).toBeVisible()
    await page.getByRole('link', { name: 'Қызмет көрсету шарттары' }).click()
    await expect(page.getByRole('heading', { name: 'Қызмет көрсету шарттары' })).toBeVisible()
  })

  test('signs out, signs back in, and returns to the dashboard from the landing page', async ({ page }) => {
    const credentials = await signUp(page)

    await page.locator('button[aria-haspopup="menu"]').click()
    await page.getByRole('menuitem', { name: 'Sign out' }).click()
    await expect(page).toHaveURL(/\/$/)

    await page.getByRole('button', { name: 'Sign in', exact: true }).click()
    await page.getByLabel('Email').fill(credentials.email)
    await page.getByRole('textbox', { name: 'Password' }).fill(credentials.password)
    await page.getByRole('button', { name: 'Sign in', exact: true }).click()
    await expect(page).toHaveURL(/\/app$/)

    await page.getByRole('link', { name: 'Focus10' }).click()
    await expect(page).toHaveURL(/\/$/)
    await page.getByRole('button', { name: 'Dashboard', exact: true }).click()
    await expect(page).toHaveURL(/\/app$/)
  })
})

test('mobile navigation opens, follows a section, and closes', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'This assertion targets the mobile navigation.')
  await setEnglish(page)
  await page.goto('/')
  await page.getByRole('button', { name: 'Open menu' }).click()
  await expect(page.getByRole('button', { name: 'Close menu' })).toBeVisible()
  await page.getByRole('banner').getByRole('link', { name: 'Features' }).click()
  await expect(page).toHaveURL(/#features$/)
  await expect(page.getByRole('button', { name: 'Open menu' })).toBeVisible()
})
