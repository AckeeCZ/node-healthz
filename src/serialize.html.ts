import {
  CheckResult,
  CheckStatus,
  LatencyStatus,
  Result,
  Status,
} from './healthz'

const html = (body?: string): string => {
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
${body}
  </body>
  </html>
  `
}

const status = (status: Status) => {
  if (status === Status.Healthy)
    return '<i class="bi bi-check-circle-fill text-success " style="font-size: 3em;"></i>'
  return '<i class="bi bi-x-circle-fill text-danger" style="font-size: 3em;"></i>'
}

const health = (status: string, services: string[]): string => {
  return `
    <div class="container mt-5">
      <div class="container m-2 text-center">
      ${status}
      </div>
      <ul class="list-group">
            <li class="list-group-item list-group-item-secondary" style="font-size: .9em">
                <div class="container p-0 text-end">
                    <span class="m-1"><i class="bi bi-check-circle-fill text-success"></i> Ok</span>
                    <span class="m-1"><i class="bi bi-x-circle-fill text-danger"></i></i> Error</span>
                    <span class="m-1"><i class="bi bi-clock-fill text-secondary"></i></i> Timeout</span>
                </div>
            </li>
          ${services.join('\n')}
      </ul>
  </div>
  `
}

const service = (
  title: string,
  required: string,
  latency: string,
  serviceStatus: string,
): string => {
  return `<li class="list-group-item d-flex justify-content-between align-items-center">
      <div>
        <span class="fw-medium">${title}</span>
      <br>
        <span class="fw-lighter">${required}</span>
      </div>
      <div>
        ${latency}
        <span>${serviceStatus}</span>
      </div>
  </li>
`
}

const required = (required: boolean): string => {
  return required ? 'Required' : 'Optional'
}

const latency = (latency: LatencyStatus, ms: number): string => {
  if (latency === LatencyStatus.Low)
    return `<span class="badge rounded-pill text-bg-success">${ms} ms <i class="bi bi-reception-4"></i></span>`
  if (latency === LatencyStatus.Medium)
    return `<span class="badge rounded-pill text-bg-warning">${ms} ms <i class="bi bi-reception-2"></i></span>`
  return `<span class="badge rounded-pill text-bg-danger">${ms} ms <i class="bi bi-reception-1"></i></span>`
}

const serviceStatus = (status: CheckStatus, output: string): string => {
  if (status === CheckStatus.Ok) {
    return `<i class="bi bi-check-circle-fill text-success" title="${output}"></i>`
  }
  if (status === CheckStatus.Error) {
    return `<i class="bi bi-x-circle-fill text-danger" title="${output}"></i>`
  }
  return `<i class="bi bi-clock-fill text-secondary" title="${output}"></i>`
}

const services = (checks: CheckResult[]): string[] => {
  return checks.map((x) =>
    service(
      x.id,
      required(x.required),
      latency(x.latencyStatus, x.latency),
      serviceStatus(x.status, String(x.output ?? '')),
    ),
  )
}

const serializeResult = (result: Result) => {
  return html(health(status(result.status), services(result.checks)))
}

export const serializeHtml = {
  result: serializeResult,
}
