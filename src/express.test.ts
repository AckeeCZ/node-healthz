import test, { describe } from 'node:test'
import express from 'express'
import { middleware } from './express'
import { equal } from 'node:assert'
import { Result } from './healthz'
import { AddressInfo } from 'node:net'

describe('Express integration', () => {
  test('Middleware', async () => {
    const app = express()
    app.use(middleware({
      checks: [
        {
          id: 'a',
          fn: async () => 1,
        }
      ]
    }))
    const started = app.listen(0)
    const response = await fetch(`http://localhost:${(started.address() as AddressInfo).port}/healthz`)
    equal(response.status, 200)
    started.close()
    const body: Result = await response.json()
    equal(body.status, 'OK')
  })
  test('`path` mounts healthz on a custom route', async () => {
    const app = express()
    app.use(
      middleware({
        path: '/status',
        checks: [
          {
            id: 'a',
            fn: async () => 1,
          },
        ],
      }),
    )
    const started = app.listen(0)
    const response = await fetch(
      `http://localhost:${(started.address() as AddressInfo).port}/status`,
    )
    equal(response.status, 200)
    started.close()
    const body: Result = await response.json()
    equal(body.status, 'OK')
  })
})