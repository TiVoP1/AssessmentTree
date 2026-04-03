# Property Manager GraphQL API

A GraphQL API for managing property records with Weatherstack weather data integration.

## Tech Stack

- **Runtime:** Node.js 20+ with TypeScript
- **API:** Express + Apollo Server (GraphQL)
- **ORM:** Prisma
- **Database:** MariaDB 11.4
- **Validation:** Zod
- **Testing:** Vitest (against test database)
- **Package Manager:** pnpm

## Prerequisites

- Node.js >= 20
- pnpm (`npm install -g pnpm`)
- Docker & Docker Compose

## Quick Start

```bash
# 1. Install dependencies
pnpm install

# 2. Copy env file and set your Weatherstack API key
cp .env.example .env

# 3. Start MariaDB via Docker
pnpm docker:up

# 4. Generate Prisma client
pnpm db:generate

# 5. Run database migrations
pnpm db:migrate:dev

# 6. Seed development data (41 properties from Texas City & Dickinson, TX)
pnpm db:seed:dev

# 7. Start the development server
pnpm dev
```

Or use the all-in-one setup command:

```bash
pnpm install
pnpm init:dev
pnpm dev
```

The GraphQL Playground will be available at **http://localhost:4000/graphql**

## Available Scripts

| Script | Description |
|--------|-------------|
| `pnpm dev` | Start dev server with hot reload |
| `pnpm build` | Compile TypeScript to `dist/` |
| `pnpm start` | Run compiled build (`pnpm build` first) |
| `pnpm lint` | Run ESLint |
| `pnpm lint:fix` | Auto-fix lint issues |
| `pnpm format` | Format code with Prettier |
| `pnpm test` | Run tests against test database |
| `pnpm db:migrate` | Deploy pending migrations |
| `pnpm db:migrate:dev` | Create/apply migrations (dev) |
| `pnpm db:seed:dev` | Seed dev data |
| `pnpm db:reset` | Clear all data |
| `pnpm db:reset:dev` | Reset + re-seed |
| `pnpm docker:up` | Start MariaDB container |
| `pnpm docker:down` | Stop MariaDB container |
| `pnpm init:dev` | Full setup: docker + migrate + seed |
| `pnpm db:migrate:test` | Apply migrations to test database |

## Running Tests

Tests run against a separate `property_manager_test` database (auto-created by Docker init script).
The Weatherstack API is mocked in tests — no external calls are made.

```bash
# Apply migrations to the test database (already included in init:dev)
pnpm db:migrate:test

# Run tests
pnpm test
```

### Test Coverage by User Story

All user stories are covered in `__tests__/property.test.ts` (19 test cases):

| User Story | Test Cases | Description |
|------------|-----------|-------------|
| **US-1** Query all properties | 2 | Empty list, returns all records |
| **US-2** Sort by creation date | 2 | Ascending and descending order |
| **US-3** Filter properties | 4 | By city, zip code, state, and combined filters (exact match) |
| **US-4** Query property details | 2 | Full details by ID, null for non-existent |
| **US-5** Create property | 7 | Auto weather fetch, DB persistence, state normalization, validation (invalid state/zip/empty street), API only called on create |
| **US-6** Delete property | 2 | Deletes and returns property, null for non-existent |

Key testing decisions:
- **Weatherstack API is mocked** via `vi.mock()` — tests verify the service is called with correct arguments without hitting the real API
- **Real database** — tests run against `property_manager_test` MariaDB instance (connection via `DATABASE_URL` env var set in `vitest.config.ts`)
- **Explicit API-boundary test** — verifies weather API is called only during `createProperty` mutation, never during queries

## GraphQL API

> All example operations are available in [`graphql/operations.graphql`](graphql/operations.graphql).
> You can import this file directly into Apollo Sandbox or any GraphQL client.

### Queries

**List all properties** (with optional filtering, sorting, and pagination):

```graphql
query {
  properties(
    filter: { city: "Texas City", state: "TX", zipCode: "77590" }
    sortByCreatedAt: desc
    limit: 20
    offset: 0
  ) {
    id
    street
    city
    state
    zipCode
    lat
    long
    weatherData
    createdAt
  }
}
```

Pagination parameters:
- `limit` — max results to return (default: 50, max: 200)
- `offset` — number of results to skip (default: 0)

Filter fields use **exact matching** (city, state, zipCode).

**Get a single property:**

```graphql
query {
  property(id: "some-id") {
    id
    street
    city
    state
    zipCode
    lat
    long
    weatherData
    createdAt
  }
}
```

### Mutations

**Create a property** (calls Weatherstack API for weather data + coordinates):

```graphql
mutation {
  createProperty(input: {
    street: "15528 E Golden Eagle Blvd"
    city: "Fountain Hills"
    state: "AZ"
    zipCode: "85268"
  }) {
    id
    street
    city
    state
    zipCode
    lat
    long
    weatherData
    createdAt
  }
}
```

> If the Weatherstack API is unavailable, the mutation returns a `WEATHER_API_ERROR` with a descriptive message.

**Delete a property:**

```graphql
mutation {
  deleteProperty(id: "some-id") {
    id
    street
  }
}
```

## Environment Variables

The project uses two env files:

| File | Purpose |
|------|---------|
| `.env` | Development server |
| `.env.test` | Test database URL — loaded automatically by Vitest and used by `pnpm db:migrate:test` |

**Setup:**

```bash
cp .env.example .env
# then open .env and set WEATHERSTACK_API_KEY to your API key
```

`.env.test` is committed and ready to use as-is — it points to the local Docker test database with no secrets.

## Project Structure

```
├── __tests__/              # Vitest test files (19 tests, organized by user story)
├── docker/
│   └── mariadb/
│       └── init-test-db.sql
├── graphql/
│   └── operations.graphql  # Example operations for all user stories
├── prisma/
│   └── schema.prisma       # Database schema
├── src/
│   ├── config/             # App configuration
│   ├── db/                 # Database scripts (seed, reset)
│   ├── graphql/            # GraphQL type definitions & resolvers
│   ├── prisma/             # Prisma client instance
│   ├── services/           # Business logic (property, weather)
│   └── server.ts           # Express + Apollo Server entry point
├── docker-compose.yml
├── eslint.config.js        # ESLint flat config (strict TS rules)
├── tsconfig.json
└── vitest.config.ts
```
