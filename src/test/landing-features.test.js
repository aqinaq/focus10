import assert from 'node:assert/strict'
import { after, test } from 'node:test'
import { createElement } from 'react'
import { renderToString } from 'react-dom/server'
import { createServer } from 'vite'

const vite = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom' })
after(() => vite.close())

const { default: Features } = await vite.ssrLoadModule('/src/components/Features.jsx')
const { I18nContext } = await vite.ssrLoadModule('/src/i18n/i18nContext.js')
const { translate } = await vite.ssrLoadModule('/src/i18n/messages.js')

for (const lang of ['kk', 'en']) {
  test(`feature cards render in ${lang}`, () => {
    const html = renderToString(
      createElement(
        I18nContext.Provider,
        { value: { t: (path) => translate(lang, path) } },
        createElement(Features),
      ),
    )

    assert.match(html, new RegExp(translate(lang, 'features.items.6.title')))
    assert.equal((html.match(/<h3/g) ?? []).length, 7)
  })
}
