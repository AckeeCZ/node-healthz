# node-healthz

![HTML Preview](https://raw.githubusercontent.com/smoliji/node-healthz/fc4aad102264fe4241cbf3b0c02edfd3a2eb3af5/html-preview.png "node-healthz HTML Preview")


The "health-checkup" npm package simplifies the process of implementing health checks in Node.js applications, allowing you to ensure the reliability and availability of your system components effortlessly.

```ts
import { check } from 'node-healthz'
check({
  checks: [
    {
      id: 'PostgreSQL',
      required: true,
      fn: async () => /* ... */,
    },
    {
      id: 'Redis',
      fn: async () => /* ... */,
    },
  ],
})
```
```
curl http://localhost:46461/healthz --verbose | jq
< HTTP/1.1 200 OK
{
  "status": "OK",
  "checks": [
    {
      "id": "PostgreSQL",
      "required": "true",
      "t": "1,003ms",
      "output": "<masked>"
    },
    {
      "id": "Redis",
      "required": "false",
      "t": "11ms",
      "output": "<masked>"
    }
  ]
}
```

### Guides

- [How to use as ExpressJS middleware](./demo/express-mw.ts)
- [How to use Core with ExpressJS](./demo/express.ts)