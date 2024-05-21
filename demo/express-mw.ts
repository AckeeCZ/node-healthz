// To run demo: npx ts-node demo/express-mw.ts

import express from 'express'
import * as healthz from '../dist/index'

const app = express()

app.use((req, res, next) => {
  healthz.express({
    // Define checks
    checks: [
      {
        id: 'PostgreSQL',
        required: true,
        fn: async () => new Promise((resolve) => setTimeout(resolve, 1000)),
      },
      {
        id: 'Redis',
        fn: async () => new Promise((resolve) => setTimeout(resolve, 10)),
      },
    ],
    // Make timeout configurable from the outside
    timeout: parseInt(String(req.query.timeout)) || undefined,
    // Modify the result if needed
    transformResult: (x) => (console.log(x), x),
  })(req, res, next)
})

const running = app.listen(process.env.PORT ?? 0)
const port = (running.address() as any).port
console.log(`Express app running on http://localhost:${port}/healthz`)
