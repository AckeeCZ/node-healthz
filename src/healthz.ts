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
    latencyLevels: [number, number]
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
  latencyStatus: LatencyStatus
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
    /**
     * Latency levels for Low, Medium and High latency.
     * It is expected that [0] < [1]. For example `latency < [0]` -> Low,
     * `latency >= [0] && latency < [1]` -> medium, everything else is High
     * @default [100, 500]
     */
    latencyLevents?: [number, number]
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
        latencyLevels: x.latencyLevents ?? [100, 500],
      })) ?? [],
    timeout: option?.timeout ?? 5_000,
  }
}

export function check(option?: Option) {
  const config = createConfig(option)
  return checkForConfig(config)
}

type RawCheckResult = Pick<CheckResult, 'latency' | 'rawOutput' | 'status'>

export enum LatencyStatus {
  Low,
  Medium,
  High,
}

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
      latencyStatus: latencyStatus(x.latencyLevels, results[i].latency)
    })),
  }
}

function latencyStatus(levels: [number, number], latency: number): LatencyStatus {
  if (latency < levels[0]) return LatencyStatus.Low
  if (latency < levels[1]) return LatencyStatus.Medium
  return LatencyStatus.High
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
