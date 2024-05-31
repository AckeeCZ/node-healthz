import { status } from '.'
import { check, Option as HOption, Result } from './healthz'
import { htmlResult, jsonResult } from './http'

export interface Option extends HOption {
  transformResult?: (result: Result) => Result
  /**
   * Pathname on which the healthz should be accessible.
   *
   * @default /healthz
   **/
  path?: string | RegExp
}

type Request = {
  header: (arg: string) => string | undefined
  query: Record<string, any>
  path: string
}

type Response = {
  status: (status: number) => Response
  type: (t: string) => any
  end: (t: string) => any
  json: (t: any) => any
}

export function middleware<Req extends Request, Res extends Response>(
  option?: Option,
) {
  const transformResult: Option['transformResult'] =
    option?.transformResult ?? ((x) => x)
  const match = routeMatcher(option?.path ?? '/healthz')
  return async function healthzmw(req: Req, res: Res, next: any) {
    try {
      if (!match(req)) {
        return next()
      }
      const health = transformResult(
        await check({
          checks: option?.checks,
          timeout: option?.timeout,
        }),
      )

      res.status(status(health))
      if (req.header('accept')?.includes('html')) {
        res.type('html')
        res.end(htmlResult(health))
      } else {
        res.json(jsonResult(health))
      }
    } catch (error) {
      next(error)
    }
  }
}

function routeMatcher(matcher: RegExp | string): (req: Request) => boolean {
  if (typeof matcher === 'string') {
    return (req: Request) => req.path === matcher
  }
  if (matcher instanceof RegExp) {
    return (req: Request) => matcher.test(req.path)
  }
  throw new Error('Unsupported route matcher')
}
