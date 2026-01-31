# lamda-connection-example

TypeScript examples of Lambda-style handlers that cover input validation, external API integration with caching and retries, and a mock JWT authorizer. Jest is used for unit tests.

## Approach
- **Task 1 - Basic auth Lambda:** `src/authLambda.ts` validates `{ email, password }` with simple format checks, returning either `{ success: true, token: "mockToken123" }` or `{ success: false, error }`. Interfaces in `src/types.ts` keep the contracts explicit.
- **Task 2 - Weather integration:** `src/weatherService.ts` calls the mock OpenWeather endpoint via `axios`, converts Kelvin to Celsius, and returns a simplified shape `{ city, temp, conditions }`. A `Map` caches results for 60 seconds to avoid repeat calls.
- **Task 3 - Error handling & retries:** The weather flow validates input up front (returns `VALIDATION_ERROR`), retries API failures up to two times with exponential backoff (1s -> 2s), logs failures (console simulates CloudWatch), and surfaces structured errors `{ error: "API_ERROR" | "VALIDATION_ERROR", message }` without unhandled rejections.
- **JWT verification:** `src/authorizer.ts` is a mock Lambda authorizer that checks for `Authorization: Bearer validToken123` and returns `{ isAuthorized: boolean }`.
- **Testing:** Jest with `ts-jest` compiles TS in-memory. Tests live in `__tests__/` and mock axios to avoid real network calls while covering success, caching, retries, validation, and authorizer behavior.

## Commands
- Install deps: `npm install`
- Run tests: `npm test`
- Build (emit JS to `dist/`): `npm run build`

## File map
- `src/types.ts` — shared interfaces.
- `src/authLambda.ts` — Task 1 handler.
- `src/weatherService.ts` — Task 2 & 3 handler + cache/retries.
- `src/authorizer.ts` — mock JWT authorizer.
- `src/index.ts` — re-exports for convenience.
- `__tests__/*.test.ts` — Jest coverage for all handlers.
