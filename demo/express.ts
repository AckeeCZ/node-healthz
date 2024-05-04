// To run demo: npx ts-node demo/express.ts

import express from 'express'
import * as healthz from '../dist/index'

const app = express()

app.use('/healthz', async (req, res, next) => {
  try {
    const health = await healthz
      .check({
        checks: [
          {
            id: 'PostgreSQL',
            required: true,
            fn: async () => new Promise(resolve => setTimeout(resolve, 1000)),
          },
          {
            id: 'Redis',
            fn: async () => new Promise(resolve => setTimeout(resolve, 10)),
          },
        ],
        timeout: parseInt(String(req.query.timeout)) || undefined,
      })
    res.status(healthz.status(health))
    if (req.header('accept')?.includes('html')) {
      res.type('html')
      res.end(healthz.html(health))
    } else {
      res.json(healthz.json(health))
    }
  } catch (error) {
    next(error)
  }
})

const running = app.listen(process.env.PORT ?? 0)
const port = (running.address() as any).port
console.log(`Express app running on http://localhost:${port}`)
