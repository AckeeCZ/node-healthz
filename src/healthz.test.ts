import test, { describe } from 'node:test'
import { Status, createConfig, check } from './healthz'
import { equal } from 'node:assert'

describe('healthz', () => {
  test('Health check results are masked by default', async () => {
    const masked = await check({
      checks: [
        {
          id: 'check',
          fn: async () => 'result',
        },
      ],
    })
    equal(masked.checks[0].output, '<masked>')
    equal(masked.checks[0].rawOutput, 'result')
    const unmasked = await check({
      checks: [
        {
          id: 'check',
          fn: async () => 'result',
          maskOutput: false,
        },
      ],
    })
    equal(unmasked.checks[0].output, 'result')
    equal(unmasked.checks[0].rawOutput, 'result')
  })
  test('Health checks timeout can be set; default is 5s', async () => {
    equal(createConfig().timeout, 5_000)
    equal(createConfig({ timeout: 1 }).timeout, 1)
  })
  test('Required check makes result Unhealthy on failure', async () => {
    const result = await check({
      checks: [
        {
          id: 'check',
          fn: async () => Promise.reject(new Error('check failed')),
          required: true,
        },
      ],
    })
    equal(result.status, Status.Unhealthy)
  })
  test('Failing a non-required check still results in Healthy', async () => {
    const result = await check({
      checks: [
        {
          id: 'check',
          fn: async () => Promise.reject(new Error('check failed')),
        },
      ],
    })
    equal(result.status, Status.Healthy)
  })
})
