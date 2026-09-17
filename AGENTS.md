# AGENTS.md — HRM Enterprise (On-Premises SOA)

## 1. Overview

- Monorepo containing 3 components: `frontend/` (Next.js 16 App Router), `mobile/` (Flutter 3.x), and `backend/` (Multi-service SOA).
- Internal Single-tenant system. Strictly DO NOT add `tenantId` or `tenantSlug` to any code, schemas, or URLs.
- Primary brand color: `#8E1B2F` (burgundy).
- All user-facing interfaces (Web & Mobile) MUST be in Vietnamese.

## 2. Backend (`backend/`, Multi-service SOA, Clean Architecture)

The backend follows a Multi-service Service-Oriented Architecture (SOA) applying Clean / Hexagonal Architecture principles. **All AI Agents and developers MUST adhere 100% to this standardized structure when creating or modifying any service:**

### 2.1. Standard Directory Structure per Service (MANDATORY)

Each service is an isolated directory under `backend/<service-name>/`. Node.js runtime is strictly independent per service (must have its own `package.json`, `node_modules/`, and `.env.example`).

Standard layout:
```text
backend/<service-name>/
├── config/                     # Environment configuration (env, db, logger)
│   ├── index.js
│   └── database.js
├── src/
│   ├── api/                    # Delivery / Presentation Layer
│   │   ├── controllers/        # HTTP Request / Response handlers
│   │   ├── middlewares/        # Auth, validation, error handler, rate limit
│   │   ├── routes/             # Express route definitions
│   │   ├── validators/         # Input schema validation (Joi / Zod)
│   │   └── grpc/               # gRPC handlers (if applicable)
│   │
│   ├── domain/                 # Core Business Rules (Pure JS/TS, zero framework dependencies)
│   │   ├── entities/           # Business Objects (Employee, Payout, Shift, Request, etc.)
│   │   ├── errors/             # Domain Custom Errors
│   │   └── value-objects/      # Money, Address, Status, etc.
│   │
│   ├── services/               # Application / Use Cases Layer
│   │   ├── CreateXxxUseCase.js
│   │   └── ProcessYyyUseCase.js
│   │
│   ├── infrastructure/         # External Interfaces / Adapters
│   │   ├── database/
│   │   │   ├── models/         # ORM / ODM Schemas (Prisma, TypeORM, Mongoose, in-memory)
│   │   │   └── repositories/   # Actual DB read/write operations
│   │   ├── messaging/          # Producers & Consumers (Kafka / RabbitMQ)
│   │   ├── external-clients/   # External/inter-service HTTP/gRPC clients
│   │   └── logging/            # Winston / Pino logger
│   │
│   ├── utils/                  # Helper & utility functions
│   └── app.js                  # Express app initialization & middleware mounting
│
├── tests/                      # Unit, Integration & End-to-End Tests
│   ├── unit/
│   └── integration/
│
├── .env.example                # Sample environment variables (MANDATORY)
├── Dockerfile                  # Service container build (MANDATORY)
├── docker-compose.yml          # Local orchestration & service dependencies (MANDATORY)
├── package.json                # Isolated dependencies & scripts (MANDATORY)
└── server.js                   # Entry point (DB connect, Port listen, GET /health)
```

### 2.2. Layer Responsibilities

1. **Independent Node Environment (`package.json` & `node_modules`)**:
   - Install and run directly inside the service folder: `cd backend/<service-name> && npm install && npm run dev`.
   - Never share or import cross-service packages or modules relatively.
   - Always commit `.env.example` containing all required keys (`PORT`, `SERVICE_NAME`, `DB_URL`, `JWT_SECRET`, etc.).

2. **Configuration (`config/`)**:
   - `config/index.js`: Parse and validate environment variables from `process.env`.
   - `config/database.js`: DB connection or in-memory store initialization.

3. **Presentation Layer (`src/api/`)**:
   - `controllers/`: Handle incoming `req`, delegate work to Use Cases in `src/services/`, return unified response `{ data: ... }` or `{ error: ... }`. Never write business logic inside controllers.
   - `middlewares/`: Token/session auth, role authorization, schema validation, centralized error handling.
   - `routes/`: Map URLs to controller actions.
   - `validators/`: Joi/Zod request payload schemas.

4. **Domain Layer (`src/domain/`)**:
   - Pure JS/TS, completely independent of Express, databases, or third-party frameworks.
   - Houses `entities/`, `value-objects/`, and domain `errors/`.

5. **Use Cases / Application Layer (`src/services/`)**:
   - Encapsulates specific business use cases (e.g., `CreatePayoutUseCase`, `GeneratePayslipUseCase`).
   - Interacts with data layer strictly via repository abstractions.

6. **Infrastructure Layer (`src/infrastructure/`)**:
   - Concrete implementations for persistence (`models/`, `repositories/`), cross-service clients (`external-clients/`), logging, and messaging.
   - Data structures for employees, branches, and banking MUST remain synchronized with Frontend (`frontend/src/mock-data/portal.ts`) and Mobile (`mobile/lib/src/core/models/`).

7. **Entry Points (`server.js` & `src/app.js`)**:
   - `src/app.js`: Configures Express app, CORS, parsers, and mounts routes from `src/api/routes/`.
   - `server.js`: Loads env, connects DB, starts HTTP listener when `require.main === module`, exports `app` for testing.
   - Must provide `GET /health` responding with `{ status: "ok", service: "<service-name>", time: new Date().toISOString() }`.

### 2.3. Port Allocation & Service Registry (Preventing Conflicts)

Service quantity and domain decomposition are determined by the team. To prevent port collisions when running services simultaneously:

1. **Port Conventions**:
   - `3000`: Frontend Web Portal (`frontend/`).
   - `4000`: API Gateway (if utilized).
   - `4001 - 4099`: Backend Services (`backend/<service-name>/`).
2. **Port Registration Rule**:
   - When creating a service, pick an **unassigned Port** in the `4001+` range (e.g., `4001`, `4002`, `4003`...), configure it in `.env.example`.
   - Register the service name and assigned port in the **Service Registry** table below.

#### Service Registry Table

| Service Name | Directory | Port | Primary Responsibility |
|---|---|---|---|
| **Frontend Web** | `frontend/` | `3000` | Next.js 16 Web Portal |
| *(Service 1)* | `backend/<service-name>/` | `4001` | *(Register upon creation)* |
| *(Service 2)* | `backend/<service-name>/` | `4002` | *(Register upon creation)* |

### 2.4. Standard HTTP Response & Error Codes

All service controllers MUST return a uniform JSON format:

- **Success (200 OK, 201 Created)**:
  ```json
  {
    "data": { ... },
    "message": "Operation successful"
  }
  ```
- **Error (400, 401, 403, 404, 422, 500)**:
  ```json
  {
    "error": {
      "code": "EMPLOYEE_NOT_FOUND",
      "message": "Employee details not found in system"
    }
  }
  ```

### 2.5. Inter-service Communication
- Cross-service calls **MUST** go through adapters in `src/infrastructure/external-clients/` using `fetch` or `axios` with max 5000ms timeout.
- Directly importing internal files of another service (e.g., `require("../../other-service/...")`) is **STRICTLY PROHIBITED**.

### 2.6. Common Backend Business Rules
- Payroll payouts must verify source debit account balance, deduct funds, generate `TXN-*` and `BANK-*` codes, and enforce idempotency using `idempotencyKey` (return existing record with `deduped: true` if duplicate).
- Single-tenant: Absolutely no `tenantId` or `tenantSlug` in any schema, code, or URL.

## 3. Frontend (`frontend/`, Next.js 16 + React 19 + Tailwind v4)

- All application code resides in `src/`, alias `@/*` → `./src/*`. Scripts: `next dev/build/start`.
- Routes: `/` → `/login`; `/dashboard/*` (employees, departments, branches, shifts, tasks, requests, payslips, bank, news, regulations, wifi).
- App Router standards: `loading.tsx`, `error.tsx`, `not-found.tsx` under `src/app/`.
- Flat features: `src/features/<domain>/` (do not nest under `hr/`). Shared UI: `components/ui`, `components/layout`.
- Session management: `AuthContext` + `hrm-session` cookie, `src/middleware.ts` protecting `/dashboard/*`. Do not expose `role` or `branchSlug` in URL routes. Build navigation menus via `buildMenuItems(role)` in `lib/permissions.tsx`.
- State components require `"use client"`. Font Awesome icons. Format currency using `formatVND()` from `lib/utils`.
- Verification checks: `npx tsc --noEmit`, `npm run build`.

## 4. Mobile (`mobile/`, Flutter 3.x + go_router + Material 3)

```text
lib/src/
├── app.dart                        # HRMApp using MaterialApp.router
├── core/{constants,models,theme,utils,widgets,router,state}
└── features/<name>/{data,presentation}
```

- Router `core/router/router.dart` is single source of truth (`/`, `/login`, `/main` with `extra: UserModel`). Navigate using `context.go/pushReplacement`, never `Navigator` directly.
- Layered authentication: `features/auth/data/` (AuthRepository + mock users), UI only interacts with the repository.
- Theme: `AppColors.primary #8E1B2F`, `AppTheme.lightTheme`, typography Public Sans (`AppTypography`). Never use `.withOpacity`, use `.withValues(alpha:)`. Never hardcode color hexes, use `AppColors`.
- Verification checks: `flutter analyze` (0 issues), `flutter test`.

## 5. Vibe Coding Rules for AI Agents (Isolation & Conflict Prevention)

To allow multiple developers and AI agents to build concurrently without stepping on each other:

### 5.1. Work Isolation Principles
1. **Directory Isolation**: When assigned to a service, the Agent MUST only create/modify files inside `backend/<service-name>/`. Never modify another service, `frontend/`, or `mobile/` unless explicitly instructed.
2. **Git Branching Rules**:
   - Never commit directly to `main` or `dev`.
   - Always create a feature branch: `git checkout -b feat/<service-name>-<dev-name>` from `dev`.
   - Before opening a PR: run `git pull origin dev` and resolve conflicts locally.
3. **Never Commit Actual Environment Files**: `.env` files must be gitignored. Only commit `.env.example`.

### 5.2. Mandatory AGENTS.md Handover Protocol
- **WHEN TO UPDATE**:
  - When an Agent creates a **New Service** -> Must register the service name and assigned Port in the **Service Registry (Section 2.3)**.
  - When an Agent introduces a **Major API Contract** or alters shared Data Schemas.
- **WHEN NOT TO UPDATE**:
  - Do not log commit messages, personal tasks, scratch notes, or minor code edits in `AGENTS.md`. This document is reserved for **Shared Architecture & Rules**.

### 5.3. Completion Acceptance Checklist
- [ ] Service runs independently: `cd backend/<service-name> && npm install && npm run dev`.
- [ ] `GET /health` returns `{ status: "ok", service: "<service-name>", time: "..." }`.
- [ ] 100% compliant with Clean Architecture: `config/`, `src/api/`, `src/domain/`, `src/services/`, `src/infrastructure/`.
- [ ] Updated Service Registry in `AGENTS.md` (if a new service or port was introduced).
