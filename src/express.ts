import { status } from '.'
import { check, Option as HOption, Result } from './healthz'
import { htmlResult, jsonResult } from './http'

export interface Option extends HOption {
  transformResult?: (result: Result) => Result
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
  return async function healthzmw(req: Req, res: Res, next: any) {
    try {
      if (req.path !== '/healthz') {
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
