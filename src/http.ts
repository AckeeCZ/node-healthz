import { CheckStatus, Result, Status } from './healthz'

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
  return `<!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Service Status</title>
      <!-- Bootstrap CSS -->
      <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css" rel="stylesheet">
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
  </head>
  <body>
  
  <div class="container mt-5">
      <div class="container m-2 text-center">
      ${result.status === Status.Healthy ? html('healthy') : html('unhealthy')}
      </div>
      <ul class="list-group">
            <li class="list-group-item list-group-item-secondary" style="font-size: .9em">
                <div class="container p-0 text-end">
                    <span class="m-1"><i class="bi bi-check-circle-fill text-success"></i> Ok</span>
                    <span class="m-1"><i class="bi bi-x-circle-fill text-danger"></i></i> Error</span>
                    <span class="m-1"><i class="bi bi-clock-fill text-secondary"></i></i> Timeout</span>
                </div>
            </li>
          ${result.checks
            .map(x => html('service', { title: x.id, required: x.required, status: x.status, output: String(x.output ?? '') }))
            .join('\n')}
      </ul>
  </div>
  
  </body>
  </html>
  `
}

function html(piece: 'healthy' | 'unhealthy' | 'service' | 'check-ok' | 'check-error' | 'check-timeout', arg?: { title?: string, required?: boolean, status?: CheckStatus, output?: string }): string {
  switch (piece) {
    case 'healthy':
      return '<i class="bi bi-check-circle-fill text-success " style="font-size: 3em;"></i>'
    case 'unhealthy':
      return '<i class="bi bi-x-circle-fill text-danger" style="font-size: 3em;"></i>'
    case 'check-ok':
      return `<i class="bi bi-check-circle-fill text-success" title="${arg?.output ?? ''}"></i>`
    case 'check-error':
      return `<i class="bi bi-x-circle-fill text-danger" title="${arg?.output ?? ''}"></i>`
    case 'check-timeout':
      return `<i class="bi bi-clock-fill text-secondary" title="${arg?.output ?? ''}"></i>`
    case 'service':
      return `<li class="list-group-item d-flex justify-content-between align-items-center">
      <div>
        <span class="fw-medium">${arg?.title ?? 'Unknown'}</span>
      <br>
        <span class="fw-lighter">${arg?.required ? 'Required' : 'Optional'}</span>
      </div>
      <span>${arg?.status === CheckStatus.Ok ? html('check-ok') : arg?.status === CheckStatus.Error ? html('check-error') : html('check-timeout')}</span>
  </li>
      `
    default:
      return ''
  }
}

export function resultStatusCode(result: Result) {
  return result.status === Status.Healthy ? 200 : 500
}
