# node-healthz

Define a set of checkers to your express application. `/healthz` endpoint then becomes available.
```js
router.use(
    expressMiddleware(
        {
            sql: {
                type: 'knex',
                adapter: knex, // Your knex instance
            },
            mongo: {
                type: 'mongoose',
                adapter: mongoose, // Your mongoose instance
            },
            custom: {
                check: () => true,/* Custom check. May be async */
            }
        }
    )
)
```
..and resulting `GET /healthz` resopnse:
```json
{
    "tldr": "OK",
    "t": "501ms",
    "checkers": {
        "sql": {
            "result": true,
            "error": null,
            "t": "0ms",
            "health": "OK",
            "crucial": false
        },
        "hello": {
            "result": null,
            "error": null,
            "t": "501ms",
            "health": "TIMEOUT",
            "crucial": false
        },
    },
    "options": {
        "timeout": 500
    }
}
```

## API

### `expressMiddleware({ [key: string]: AdapterOptions }): RequestHandler`

Define a set of app health checkers. Returns an express route handler.

System is considered healthy if all the checkers responded without error in given timeout.

If request comes, and routes starts `/healthz`, system health is calculated and returned:

```
GET /healthz
```
|Supported query parameters||
|-|-|
| `timeout` | Optional. Default: 5000. How much time in ms do the checkers have to respond.

Status code is 500 for unhealthy system, 200 otherwise.


**Response JSON body**:
```ts
{
    tldr: 'OK' | 'NOT_OK',
    checkers: [
        {
            result: boolean // true if checker responds in given time
            error: string | null // error message if the checker fails
            t: string // time, 245ms
            health: 'OK' | 'ERROR' | 'TIMEOUT'
            crucial: boolean
        }
    ],
    t: string // total time, 245ms
    options: { // Optional parameters from the input
        timeout: 1000,
    }
}
```


### Types
### `AdapterOptions: object`

|Attribute|Type|Description
|-|-|-|
|type| AdapterType | Optional. If not supplied, `check` function has to be defined.
|adapter| any | Optional. If `type` is specified, appropriate adapter instance has to be passed in here. E.g. you Mongoose instance.
| crucial | boolean | Optional. Default: `false`. If `true` and checker fails, system health outcome cannot be OK.
| check | function | Optional. Use this if you want to do the check completely by yourself. Check may return a Promise. Check is called with `AdapterOptions`, extended with a `timeout: number` prop.

### `AdapterType: string`
Supported adapter types defining the instance that is found in `adapter` option.
```ts
'knex' | 'mongoose'
```