import test, { describe } from 'node:test'
import { htmlResult, jsonResult, resultStatusCode } from './http'
import { CheckStatus, Status } from './healthz'
import { deepEqual, equal } from 'node:assert'

describe('http', () => {
  test('status code 200 if Ok, 500 otherwise', () => {
    equal(
      resultStatusCode({
        checks: [],
        status: Status.Healthy,
      }),
      200,
    )
    equal(
      resultStatusCode({
        checks: [],
        status: Status.Unhealthy,
      }),
      500,
    )
  })
  test('json', () => {
    deepEqual(
      jsonResult({
        checks: [
          {
            id: 'a',
            latency: 100,
            output: 'o',
            rawOutput: 'ro',
            required: true,
            status: CheckStatus.Ok,
          },
        ],
        status: Status.Healthy,
      }),
      {
        status: 'OK',
        checks: [
          {
            id: 'a',
            status: 'OK',
            t: '100ms',
            output: 'o',
            required: true,
          },
        ],
      },
    )
  })
  test('html', () => {
    const html = htmlResult({
      checks: [
        {
          id: 'a',
          latency: 100,
          output: 'o',
          rawOutput: 'ro',
          required: true,
          status: CheckStatus.Ok,
        },
      ],
      status: Status.Healthy,
    })
    equal(html.includes('<i class="bi bi-check-circle-fill text-success " style="font-size: 3em;"></i>'), true)
    equal(html.includes('<i class="bi bi-check-circle-fill text-success"'), true)
  })
})
