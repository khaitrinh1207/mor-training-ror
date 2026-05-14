# Campaign Action Items

Campaign Action Items is a small Rails + React training project that mirrors a BitStar-style admin workflow. It lets an authenticated admin manage operational action items nested under a campaign.

The project is intentionally compact, but it includes realistic backend and frontend patterns:

- Rails API controllers, serializers, models, request specs, and service objects.
- Redis summary caching with MySQL fallback.
- OpenSearch keyword search service with MySQL fallback.
- React + TypeScript UI with repository/domain/infrastructure layering.
- Jest and Testing Library coverage for frontend behavior.
- Vite runtime for fast UI review.

## Demo Video

This full demo shows the React mock UI flow: summary cards, keyword filtering, create, edit, inline status update, delete confirmation, and refreshed counts.

<video src="docs/demo/campaign-action-items-full-demo.mp4" controls poster="docs/demo/campaign-action-items-full-demo-poster.png" width="100%"></video>

If the video does not render in your Markdown viewer, open `docs/demo/campaign-action-items-full-demo.mp4` directly.

## Goals

This project is designed to teach the workflow needed for a production Rails codebase:

1. Start from business workflow and API design.
2. Model the database and ActiveRecord layer.
3. Build nested REST APIs with request specs.
4. Keep controllers thin by moving query/cache/search logic into services.
5. Add UI integration through repository and domain layers instead of direct API calls from components.
6. Verify behavior with backend specs, frontend tests, typecheck, build, and browser QA.

## Tech Stack

### Backend

- Ruby `3.3.4`
- Rails `7.0.8.4`
- MySQL 8.0
- Devise-compatible admin authentication
- ActiveModelSerializers
- Kaminari pagination
- Redis cache
- Elasticsearch/OpenSearch client
- RSpec
- FactoryBot
- MockRedis

### Frontend

- React 18
- TypeScript
- Vite
- Jest
- Testing Library
- CSS modules by convention-free plain CSS file

## Project Structure

```text
.
├── app/
│   ├── controllers/match/api/v2/admin/
│   ├── models/
│   ├── serializers/
│   └── services/campaign_action_items/
├── config/
├── db/
├── frontend/
│   ├── bsmatch/components/campaignActionItems/
│   ├── bsmatch/configs/
│   ├── bsmatch/domains/campaignActionItems/
│   ├── bsmatch/infrastructures/
│   ├── bsmatch/pages/
│   ├── bsmatch/repositories/
│   ├── styles/
│   └── test/
├── spec/
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Domain Model

### Campaign

A campaign is the parent resource.

Important fields:

- `name`
- `description`

Relationship:

- `has_many :campaign_action_items`

### CampaignActionItem

An action item belongs to a campaign and represents an operational task for an admin workflow.

Important fields:

- `campaign_id`
- `title`
- `memo`
- `status`
- `due_date`
- `created_by_admin_id`
- timestamps

Statuses:

- `todo`
- `doing`
- `done`

The UI displays these statuses in Vietnamese while preserving English enum values for the API and database layer.

## Backend API

All action item endpoints are nested under a campaign:

```text
/match/api/v2/admin/campaigns/:campaign_id/action_items
```

### Endpoints

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/match/api/v2/admin/campaigns/:campaign_id/action_items` | List action items with filters, summary, and pagination. |
| `POST` | `/match/api/v2/admin/campaigns/:campaign_id/action_items` | Create an action item. |
| `PATCH` | `/match/api/v2/admin/campaigns/:campaign_id/action_items/:id` | Update an action item. |
| `DELETE` | `/match/api/v2/admin/campaigns/:campaign_id/action_items/:id` | Delete an action item. |

### Index Query Parameters

| Parameter | Type | Notes |
| --- | --- | --- |
| `q` | string | Keyword search. Uses OpenSearch when available and MySQL fallback on failure. |
| `status` | string | One of `todo`, `doing`, or `done`. |
| `due_date_from` | date | Format: `YYYY-MM-DD`. |
| `due_date_to` | date | Format: `YYYY-MM-DD`. |
| `page` | integer | Defaults to `1`. |
| `per_page` | integer | Defaults to `20`, capped at `100`. |

### Index Response Shape

```json
{
  "campaign_action_items": [],
  "summary": {
    "total_count": 0,
    "todo_count": 0,
    "doing_count": 0,
    "done_count": 0,
    "overdue_count": 0
  },
  "pagination": {
    "count": 0,
    "current_page": 1,
    "total_pages": 1,
    "total_count": 0,
    "per_page": 20
  }
}
```

### Error Response Shape

```json
{
  "error": {
    "code": "validation_error",
    "message": "Validation failed.",
    "details": {
      "title": ["can't be blank"]
    }
  }
}
```

Common error codes:

- `admin_authorization_error`
- `invalid_parameter`
- `not_found`
- `validation_error`


## Rails Request Lifecycle

This project follows the same high-level request lifecycle Khai will see in BitStar-style Rails code:

1. Browser or API client sends a request to a nested admin endpoint.
2. `config/routes.rb` resolves the request to `Match::Api::V2::Admin::CampaignActionItemsController`.
3. Controller callbacks load the campaign and target action item.
4. Strong parameters whitelist permitted request fields.
5. The controller delegates filtering, cache, and search behavior to service objects.
6. ActiveRecord reads or writes MySQL records through models and associations.
7. Serializer turns model data into a stable JSON response shape.
8. Controller renders JSON, redirects in training HTML flows, or returns an empty response for delete.

Training-only HTML routes also cover helper usage, template rendering, and redirect behavior.

## Backend Services

### `CampaignActionItems::IndexQuery`

Responsible for index filtering and ordering.

It handles:

- campaign scoping
- keyword search scoping
- status filtering
- due date range filtering
- invalid parameter handling
- ordering by `due_date ASC`, then `created_at DESC`

### `CampaignActionItems::SummaryCache`

Responsible for Redis-backed summary caching.

It handles:

- cache key generation
- cache read
- cache write with 10-minute TTL
- cache invalidation after create/update/delete
- MySQL fallback when Redis fails

Cache key format:

```text
campaign_action_items:summary:campaign:{campaign_id}
```

### `CampaignActionItems::KeywordSearch`

Responsible for keyword search.

It handles:

- OpenSearch search by `q`
- campaign scoping inside the OpenSearch query
- returning MySQL-backed records
- fallback to MySQL `LIKE` search against `title` and `memo`

### `CampaignActionItems::SearchIndex`

Responsible for OpenSearch document side effects.

It handles:

- indexing a document after create
- updating a document after update
- deleting a document after destroy

Index name format:

```text
campaign_action_items-{environment}
```

## Frontend Architecture

The frontend follows a simplified BitStar-style layering model.

### Pages

`frontend/bsmatch/pages/CampaignActionItemsPage.tsx`

The page owns screen-level orchestration:

- loads data by campaign ID
- tracks filters
- opens edit state
- opens delete confirmation state
- passes callbacks into presentational components

### Components

`frontend/bsmatch/components/campaignActionItems/`

Main components:

- `SummaryChips`
- `ActionItemFilters`
- `ActionItemForm`
- `ActionItemList`
- `DeleteConfirmation`
- `PaginationControls`

Visible UI copy is Vietnamese.

### Domain

`frontend/bsmatch/domains/campaignActionItems/`

The domain layer owns:

- entities
- status label mapping
- reducer state
- loading/saving/error behavior
- orchestration hook

### Repository

`frontend/bsmatch/repositories/campaignActionItemsRepository.ts`

Defines the data access contract used by the domain and page.

### Infrastructure

`frontend/bsmatch/infrastructures/http/campaignActionItemsHttpRepository.ts`

Maps between API JSON and frontend entities:

- API uses `snake_case`.
- Frontend uses `camelCase`.

`frontend/bsmatch/infrastructures/demo/demoCampaignActionItemsRepository.ts`

Provides mock data for UI review without requiring a running Rails API session.

## UI Runtime Modes

### Mock Demo Mode

The default UI mode uses mock data.

```bash
npm run dev -- --port 5173
```

Open:

```text
http://localhost:5173/
```

Use this mode for UI review and interaction testing without backend login/session setup.

### API Mode

API mode calls the Rails API through the Vite proxy.

```text
http://localhost:5173/?api=1&campaignId=1
```

Use this mode only after the Rails server and admin session are ready.

## Setup

### Backend Dependencies

```bash
bundle install
```

### Frontend Dependencies

```bash
npm install
```

### Database

```bash
bin/rails db:create db:migrate
```

For test database setup:

```bash
RAILS_ENV=test bin/rails db:prepare
```

## Running The Project

### Rails API

```bash
bin/rails server -p 3000
```

### Vite UI

```bash
npm run dev -- --port 5173
```

### Rails HTML Training Flow

After running the Rails server, open the training-only HTML route:

```text
http://localhost:3000/admin/training/campaign_action_items
```

This flow demonstrates ERB render, helper methods, redirect after create, and strong parameters separate from the JSON API.


Open the mock UI:

```text
http://localhost:5173/
```

Open the API-backed UI:

```text
http://localhost:5173/?api=1&campaignId=1
```

## Testing And Verification

### Backend Specs

```bash
bundle exec rspec
```

Current verified backend result:

```text
69 examples, 0 failures
```

### Frontend Typecheck

```bash
npm run typecheck
```

### Frontend Tests

```bash
npm test
```

Current verified frontend result:

```text
5 test suites, 13 tests
```

### Frontend Build

```bash
npm run build
```

### Full Verification Command

```bash
bundle exec rspec && npm run typecheck && npm test && npm run build
```

## Current Known Gaps

- The UI runs through Vite and is not mounted into a Rails-rendered route.
- OpenSearch mapping and index lifecycle creation are not automated yet.
- The UI mock mode is intended for review; API mode requires Rails and authentication/session setup.
- Dependency audit currently reports low-severity npm issues; avoid automatic audit fixes unless dependency churn is acceptable.

## Training Notes

Supporting training documentation lives under:

```text
../docs/training/
```

Important documents:

- `../docs/training/mini-project-spec.md`
- `../docs/training/campaign-action-items-api-design.md`
- `../docs/training/api-implementation-checklist.md`
- `../docs/training/progress-log.md`

Keep implementation notes, blockers, verification results, and next actions in the progress log whenever project state changes.
