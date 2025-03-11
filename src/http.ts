import { CheckStatus, LatencyStatus, Result, Status } from './healthz'
import { serializeHtml } from './serialize.html'

export function jsonResult(result: Result) {
  return {
    status: result.status === Status.Healthy ? 'OK' : 'NOT_OK',
    checks: result.checks.map((x) => ({
      id: x.id,
      status: x.status === CheckStatus.Error
        ? 'ERROR'
        : x.status === CheckStatus.Ok
          ? 'OK'
          : x.status === CheckStatus.Timeout
            ? 'TIMEOUT'
            : 'UNKNOWN',
      required: x.required,
      t: `${Number(x.latency).toLocaleString()}ms`,
      output: x.output,
    })),
  }
}

export function htmlResult(result: Result) {
  return serializeHtml.result(result)
}

export function resultStatusCode(result: Result) {
  return result.status === Status.Healthy ? 200 : 500
}
