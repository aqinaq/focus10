import test from 'node:test'
import assert from 'node:assert/strict'
import { createClient, registerUser, startTestServer } from './helpers.js'

test('Vercel API initializes the schema on its first application request', async () => {
  const server = await startTestServer({ serverless: true })
  try {
    const client = createClient(server.base)
    const health = await client.request('/api/health')
    assert.equal(health.status, 200)
    assert.equal(health.data.ok, true)

    const before = await server.query("SELECT to_regclass('public.users') AS table_name")
    assert.equal(before.rows[0].table_name, null)

    const registered = await registerUser(client)
    assert.equal(registered.status, 201)

    const after = await server.query("SELECT to_regclass('public.users') AS table_name")
    assert.equal(after.rows[0].table_name, 'users')

    const me = await client.request('/api/auth/me')
    assert.equal(me.status, 200)
  } finally {
    await server.close()
  }
})
