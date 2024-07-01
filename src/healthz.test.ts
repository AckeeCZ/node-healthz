import test, { describe } from 'node:test'
import { Status, createConfig, check, LatencyStatus } from './healthz'
import { deepEqual, equal } from 'node:assert'

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
  test('Latency status thresholds can be set and are 100 and 500 by default', async () => {
    deepEqual(
      createConfig({ checks: [{ fn: async () => '', id: 'test' }] }).checks[0]
        .latencyLevels,
      [100, 500],
    )
    const result = await check({
      checks: [
        {
          id: 'check',
          fn: () => new Promise((resolve) => setTimeout(resolve, 10)),
          latencyLevents: [20, 120],
        },
        {
          id: 'check',
          fn: () => new Promise((resolve) => setTimeout(resolve, 100)),
          latencyLevents: [20, 120],
        },
        {
          id: 'check',
          fn: () => new Promise((resolve) => setTimeout(resolve, 200)),
          latencyLevents: [20, 120],
        },
      ],
    })
    equal(result.checks[0].latencyStatus, LatencyStatus.Low)
    equal(result.checks[1].latencyStatus, LatencyStatus.Medium)
    equal(result.checks[2].latencyStatus, LatencyStatus.High)
  })
})
