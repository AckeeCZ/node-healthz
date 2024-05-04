export type Healthz = () => Promise<Result>

export enum Status {
  Healthy,
  Unhealthy,
}

export interface Config {
  checks: Array<{
    id: string
    required: boolean
    fn: () => Promise<unknown>
    maskOutput: boolean
  }>
  timeout: number
}

export interface Result {
  status: Status
  checks: CheckResult[]
}

export enum CheckStatus {
  Ok,
  Error,
  Timeout,
}

export interface CheckResult {
  id: string
  status: CheckStatus
  output: unknown
  rawOutput: unknown
  required: boolean
  /**
   * Milliseconds it took the check to finish. Wall clock time.
   */
  latency: number
}

export interface Option {
  /**
   * Array of health checks.
   */
  checks?: Array<{
    /**
     * Unique identifier of the check.
     * There cannot be multiple checks with the same ID.
     */
    id: string
    /**
     * Health check function.
     */
    fn: () => Promise<unknown>
    /**
     * Boolean that if any health check with TRUE fails, entire health check
     * is considered as Unhealthy.
     * @default false
     */
    required?: boolean
    /**
     * Boolean that if TRUE, check output will be masked and the return/thrown
     * value from the `fn` won't be used.
     * @default true
     */
    maskOutput?: boolean
  }>
  /**
   * How many milliseconds to wait for the check to complete. It if fails
   * to finish within this time, check status will be Timeout.
   * @default 10_000
   **/
  timeout?: number
}

export function createConfig(option?: Option): Config {
  return {
    checks:
      option?.checks?.map((x) => ({
        id: x.id,
        required: x.required ?? false,
        fn: x.fn,
        maskOutput: x.maskOutput ?? true,
      })) ?? [],
    timeout: option?.timeout ?? 5_000,
  }
}

export function check(option?: Option) {
  const config = createConfig(option)
  return checkForConfig(config)
}

type RawCheckResult = Pick<CheckResult, 'latency' | 'rawOutput' | 'status'>

async function checkForConfig(config: Config): Promise<Result> {
  const t0 = Date.now()
  const timeout = createTimeout(config.timeout)
  const results = await Promise.all(
    config.checks.map((x) =>
      Promise.race<RawCheckResult>([
        x
          .fn()
          .then<RawCheckResult>((rawOutput) => ({
            status: CheckStatus.Ok,
            rawOutput,
            latency: Date.now() - t0,
          }))
          .catch<RawCheckResult>((rawOutput) => ({
            status: CheckStatus.Error,
            rawOutput,
            latency: Date.now() - t0,
          })),
        timeout.promise,
      ]),
    ),
  )
  timeout.clear()
  return {
    status: results.find(
      (x, i) => config.checks[i].required && x.status !== CheckStatus.Ok,
    )
      ? Status.Unhealthy
      : Status.Healthy,
    checks: config.checks.map((x, i) => ({
      id: x.id,
      status: results[i].status,
      output: x.maskOutput ? '<masked>' : results[i].rawOutput,
      rawOutput: results[i].rawOutput,
      latency: results[i].latency,
      required: x.required,
    })),
  }
}

function createTimeout(ms: number) {
  let ref: NodeJS.Timeout
  return {
    promise: new Promise<RawCheckResult>((resolve) => {
      ref = setTimeout(
        () =>
          resolve({
            status: CheckStatus.Timeout,
            rawOutput: undefined,
            latency: ms,
          }),
        ms,
      )
    }),
    clear() {
      clearTimeout(ref)
    },
  }
}
