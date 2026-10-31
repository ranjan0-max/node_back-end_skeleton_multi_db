# Node Backend Skeleton

Fastify + Sequelize (PostgreSQL) multi-tenant backend (schema per client).

## Setup

```bash
npm install
cp .env.example .env   # fill values
npm run dev            # migrations run automatically, then server starts
npm run db:seed -- public   # once, manually (roles + super admin)
```

## Folder structure

```
server.js            entry point: env check -> DB connect -> migrations -> listen
app.js               fastify instance, plugins (helmet, cors, rate-limit...), routes
Routes/              index.js registers every *.route.js with its prefix
Controllers/         read request -> call service -> send response
Services/            business logic + DB queries
Validators/          fastify JSON schemas for input (body / params / query)
Middleware/          auth, role, error handler, request log, rate limit key
Helpers/             crud, auth, response, error, logger, dateTime, constants
Database/
  connection.js      sequelize connection
  migrator.js        runs migrations / seeders on public + every client schema
  cli.js             run seeders manually (npm run db:seed)
  Models/public      public schema models (roles, clients, users)
  Models/tenant      client schema models
  Migrations/public  run once on public schema
  Migrations/tenant  run on every client schema
  Seeders/public     run once on public schema
  Seeders/tenant     run on every client schema
```

Request flow: `route -> validator -> middleware (auth, role) -> controller -> service -> helper / model`

## Multi-tenant

- `public` schema: `roles`, `clients`, `users` (+ `_migrations`, `_seeders`)
- every client gets its own schema `tenant_<slug>`, created on `POST /api/v1/clients`
- JWT payload `{ userId, clientId, role }` -> `authenticate` middleware resolves client schema
- in services use `getTenantModel("ModelName")` for client schema tables

## Auth (one device at a time)

- `POST /api/v1/auth/login` -> new `session_id` saved on user + put in tokens, previous device is logged out
- every request (`authenticate`) + `POST /api/v1/auth/refresh` check token session === user session
  -> else `401` with `errorCode: "sessionExpired"` (frontend: show message + go to login)
- `POST /api/v1/auth/logout` -> clears session, its access + refresh tokens stop working
- deactivated user (`is_active = false`) is blocked on the next request (`userInactive`)

## Migrations

Run automatically on server start / `pm2 restart` when `RUN_MIGRATIONS_ON_START=true`.
Each file runs only once per schema. Safe with multiple PM2 instances (postgres lock).

New migration / seeder = new file in `Database/Migrations/<public|tenant>/` or
`Database/Seeders/<public|tenant>/`, name starts with timestamp so files run in order
(e.g. `20261029000001-create-products.js`):

```js
module.exports = {
  async up({ queryInterface, Sequelize, schema }) {
    await queryInterface.createTable({ tableName: "products", schema }, { ... });
  },
  async down({ queryInterface, schema }) {
    await queryInterface.dropTable({ tableName: "products", schema });
  },
};
```

Always pass `{ tableName, schema }` in migrations. When a column changes, update the model too.

Seeders run only manually (each seeder once per schema):

```bash
npm run db:seed -- public                 # public seeders
npm run db:seed -- tenant tenant_abc      # one client schema
npm run db:seed -- tenant all             # every client schema
```

## Adding a new module

1. migration file in `Database/Migrations/<public|tenant>/`
2. model in `Database/Models/<public|tenant>/xyz.model.js`
3. `Validators/xyz.validator.js`, `Services/xyz.service.js`, `Controllers/xyz.controller.js`
4. `Routes/xyz.route.js` + one line in `Routes/index.js`

## Scripts

| command                                          | what                      |
| ------------------------------------------------ | ------------------------- |
| `npm run dev`                                    | start with auto reload    |
| `npm start`                                      | start                     |
| `npm run format`                                 | prettier format all files |
| `pm2 start ecosystem.config.js --env production` | production                |

## Logs (pino, files - not DB)

Fastify logger (pino) writes to console + daily files using `pino-roll` (Helpers/logger.helper.js):

```
logs/app.YYYY-MM-DD.1.log     everything: every request ("request completed" + durationMs), info, warn, errors
logs/error.YYYY-MM-DD.1.log   only error / fatal (500, uncaughtException, unhandledRejection)
```

- one JSON line per log, every line of a request has `reqId`, `clientSlug`, `userId`, `role` (after login)
- request slower than `SLOW_REQUEST_MS` (default 1000) -> `"slow": true` (warn level)
- passwords / tokens in body saved as `[REDACTED]`, 4xx errors are warn (not in error file)
- last `LOG_RETENTION_DAYS` (default 7) files kept, older removed when day changes
- file date = server timezone, PM2 cluster -> one file per instance (`app-0.`, `app-1.`)

APIs (super admin):

- `GET /api/v1/request-logs/summary?date=2026-10-29` -> per endpoint count, avg / min / max / p95 ms, slowest first
- `GET /api/v1/request-logs?date=&slowOnly=true&minDurationMs=500&method=GET&route=/api/v1/users/:id&page=1&limit=10`
- `GET /api/v1/error-logs?date=&source=request&clientId=1&page=1&limit=10`
- `GET /api/v1/request-logs/dates`, `GET /api/v1/error-logs/dates`

On `uncaughtException` the error is logged, running requests finish, DB closes and app exits (code 1) -> PM2 restarts it.
