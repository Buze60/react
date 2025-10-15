# Software Requirements Specification (SRS)

- **Project**: Finance Management System (FMS)
- **Tech Stack**: MERN (MongoDB, Express.js, React.js, Node.js)
- **Version**: 1.0
- **Author**: buze (Software Developer & UI Engineer)
- **Date**: October 2025
- **Status**: Approved for implementation

## Document Control
- **Change History**
  - 1.0 (Oct 2025): Initial version based on project outline.

## 1. Introduction
### 1.1 Purpose
Define functional, non-functional, and system requirements for a web-based finance data platform that enables admins and finance experts to upload, manage, analyze, and export transactional data in an Excel-like interface.

### 1.2 Scope
CRUD for transactions, spreadsheet-like editing, advanced filtering, role-based access, and export to CSV/XLSX. Primary goals: speed on 10k+ rows, secure auth, cloud scalability.

### 1.3 Definitions, Acronyms
- **JWT**: JSON Web Token
- **RBAC**: Role-Based Access Control
- **CSV/XLSX**: Export formats
- **FMS**: Finance Management System

### 1.4 References
React Data Grid, TailwindCSS, Express, Mongoose, MongoDB Atlas, jsonwebtoken, bcrypt, xlsx, csv-stringify.

## 2. Overall Description
### 2.1 Product Perspective
A lightweight Excel-like web app with persistent storage, multi-user roles, and export. MERN architecture: React UI → Axios → Express → Mongoose → MongoDB Atlas.

### 2.2 Users & Roles
- **Admin**: Full CRUD, user management, export, reports.
- **Finance Expert**: CRUD on authorized transactions, filtering, export.

### 2.3 Assumptions and Dependencies
- Modern browsers (Chrome/Edge/Firefox/Safari last 2 versions)
- Internet connectivity to cloud services (Render/Vercel + MongoDB Atlas)
- Time stored in UTC; frontend localizes display

## 3. System Features (Functional Requirements)
Each requirement is uniquely identified (FMS-XXX) and testable.

### 3.1 Authentication & User Management
- **FMS-AUTH-001**: Register user with email, name, password; role defaults to `finance_expert`. Admins can assign role on creation.
- **FMS-AUTH-002**: Login returns `accessToken` (15 min) and `refreshToken` (7 days).
- **FMS-AUTH-003**: Validate session via `/auth/me` using access token.
- **FMS-AUTH-004**: Refresh token endpoint rotates and invalidates previous refresh token.
- **FMS-AUTH-005**: Password hashing with bcrypt (cost ≥ 12).
- **FMS-AUTH-006**: Account lockout after 5 failed logins within 15 minutes for 15 minutes.
- **FMS-AUTH-007**: Admin can create, list, update role, deactivate, or delete users.
- **FMS-AUTH-008**: Email uniqueness enforced; case-insensitive.

Acceptance criteria:
- Valid credentials issue JWTs; invalid credentials return 401 with error code.
- Locked accounts return 423.
- Non-admin role update attempts return 403.
- `me` endpoint returns user profile and role.

### 3.2 Transaction Management
- **FMS-TRX-001**: Create transaction with fields: `date`, `category`, `description`, `amount`, `type`, `createdBy`.
- **FMS-TRX-002**: Read list with pagination, sorting, filtering; read single by id.
- **FMS-TRX-003**: Update transaction fields inline or via form; track `updatedBy`.
- **FMS-TRX-004**: Delete transaction (hard delete in v1).
- **FMS-TRX-005**: Bulk import CSV/XLSX with preview, validation, and dry-run.
- **FMS-TRX-006**: Server-side validation on all writes.

Field rules:
- `date`: ISO 8601, required.
- `category`: string 1–64, required.
- `description`: string 0–500.
- `amount`: number > 0; semantic sign derives from `type`.
- `type`: enum `income` | `expense`.
- `createdBy`, `updatedBy`: ObjectId references to users.

Acceptance criteria:
- Creating valid transaction returns 201 with resource id.
- Invalid data returns 422 with field-level errors.
- Updates preserve created metadata, mutate `updated*`.
- Deleting removes record; subsequent GET returns 404.

### 3.3 Excel-Like Grid UI
- **FMS-UI-001**: Virtualized grid renders ≥ 10,000 rows with smooth scroll on a mid-tier laptop.
- **FMS-UI-002**: Inline editing for permitted fields with optimistic UI and error rollback.
- **FMS-UI-003**: Column resizing, reordering, hide/show preferences persisted per user.
- **FMS-UI-004**: Keyboard navigation (enter/tab/arrow), multi-cell selection copy-paste to clipboard (best-effort).

Acceptance criteria:
- Scroll FPS remains ≥ 45 on 10k rows dataset.
- Edits reflect in DB; failed edits restore prior values with tooltip error.

### 3.4 Export Functionality
- **FMS-EXP-001**: Export current dataset (visible or filtered) to CSV or XLSX from UI.
- **FMS-EXP-002**: For large datasets (>50k rows), support server-side streamed CSV export.
- **FMS-EXP-003**: Export respects active filters and column visibility order.

Acceptance criteria:
- Exported file opens in Excel/Sheets with correct headers, data types, and row count.

### 3.5 Filtering & Search
- **FMS-FLT-001**: Filter by date range, `type`, `category` (exact or multi-select), keyword on `description`.
- **FMS-FLT-002**: Server-side filtering with query parameters; combined filters use AND semantics.
- **FMS-FLT-003**: Sorting by date or amount asc/desc; stable sort.

Acceptance criteria:
- Applying filters changes count/results accordingly; URL reflects filter state for deep-linking.

### 3.6 Role-Based Access Control
- **FMS-RBAC-001**: Admin can perform all actions on users and transactions.
- **FMS-RBAC-002**: Finance Expert can CRUD transactions; cannot manage users.
- **FMS-RBAC-003**: Only authenticated users can access transactional endpoints.

RBAC Matrix:

| Capability | Admin | Finance Expert |
|---|---|---|
| Login/Register | Yes | Yes |
| Manage Users | Yes | No |
| Transactions CRUD | Yes | Yes |
| Export | Yes | Yes |
| Reports | Yes | Yes |

Acceptance criteria:
- Non-admin access to `/users` endpoints returns 403.
- Auth header missing returns 401.

## 4. Non-Functional Requirements
- **Performance**:
  - **FMS-NFR-001**: Grid supports ≥ 10k rows with ≥ 45 FPS scrolling.
  - **FMS-NFR-002**: API list endpoint p95 latency < 300ms for 10k dataset with common filters.
- **Security**:
  - **FMS-NFR-003**: JWT HS256 or RS256; access 15m, refresh 7d; HTTPS-only.
  - **FMS-NFR-004**: bcrypt cost ≥ 12; secrets stored via platform secrets manager.
  - **FMS-NFR-005**: Rate limit 100 req/min/IP (auth endpoints 30/min/IP).
  - **FMS-NFR-006**: Input validation and centralized error handling; no PII in logs.
- **Scalability**:
  - **FMS-NFR-007**: Horizontal scaling to 3 app instances; MongoDB Atlas M10+.
- **Usability**:
  - **FMS-NFR-008**: Responsive UI, WCAG 2.1 AA for color/contrast/focus.
- **Maintainability**:
  - **FMS-NFR-009**: Modular folder structure, linting, TypeScript for API code.
- **Availability**:
  - **FMS-NFR-010**: 99.9% monthly uptime target; health checks and auto-restart.
- **Observability**:
  - **FMS-NFR-011**: Structured logs (pino/winston), request ID correlation, basic metrics (req rate, latency, errors).
- **Internationalization**:
  - **FMS-NFR-012**: Currency and date formatting locale-aware on client; store UTC.

## 5. Data Design
### 5.1 MongoDB Collections and Indexes
- `users`
  - Indexes: `{ email: 1 } unique`, `{ role: 1 }`
- `transactions`
  - Indexes: `{ date: -1 }`, `{ type: 1, date: -1 }`, `{ category: 1 }`, `{ createdBy: 1, date: -1 }`

### 5.2 Mongoose Schemas (illustrative)
```typescript
// User
const UserSchema = new Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  name: { type: String, required: true, trim: true, maxlength: 80 },
  role: { type: String, enum: ['admin', 'finance_expert'], default: 'finance_expert' },
  passwordHash: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  lastLoginAt: { type: Date },
}, { timestamps: true });

// Transaction
const TransactionSchema = new Schema({
  date: { type: Date, required: true },
  category: { type: String, required: true, trim: true, maxlength: 64 },
  description: { type: String, trim: true, maxlength: 500 },
  amount: { type: Number, required: true, min: 0.01 },
  type: { type: String, enum: ['income', 'expense'], required: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });
```

## 6. API Specification (v1)
- **Base URL**: `/api/v1`
- **Auth**: `Authorization: Bearer <accessToken>`
- **Error shape**:
```json
{ "error": { "code": "string", "message": "string", "details": { "field": "msg" } } }
```

### 6.1 Auth
- `POST /auth/register` → 201
  - Body: `{ email, name, password, role? }`
- `POST /auth/login` → 200
  - Body: `{ email, password }`
  - Response: `{ accessToken, refreshToken, user }`
- `POST /auth/refresh` → 200
  - Body: `{ refreshToken }` → new tokens
- `GET /auth/me` → 200
  - Returns current user profile
- `POST /auth/logout` → 204 (optional; client-side clear)

### 6.2 Users (Admin only)
- `GET /users` → list with pagination
- `POST /users` → create user (admin-assign role)
- `GET /users/:id`
- `PATCH /users/:id` → update role, name, isActive
- `DELETE /users/:id`

### 6.3 Transactions
- `GET /transactions`
  - Query: `page`, `limit` (default 50, max 500), `sortBy`=`date|amount`, `sortDir`=`asc|desc`,
    `from`, `to` (ISO dates), `type` (multi), `category` (multi), `q` (keyword)
- `POST /transactions`
- `GET /transactions/:id`
- `PATCH /transactions/:id`
- `DELETE /transactions/:id`
- `POST /transactions/import` (multipart)
  - Form fields: `file` (csv/xlsx), `dryRun` (bool default true)
  - Response (dry run): parsed rows, validation errors; when `dryRun=false`, returns summary with counts
- `GET /transactions/export`
  - Query mirrors GET filters; `format`=`csv|xlsx`; streams file

### 6.4 Reports
- `GET /reports/summary`
  - Query: `from`, `to`, `groupBy=month|category|type`
  - Response: grouped totals and counts

### 6.5 Health
- `GET /health` → `{ status: 'ok', version, uptime }`

## 7. UI Requirements
- Grid: React Data Grid with row virtualization, inline edit, column persistence (localStorage per user id), toolbar with filters, export, and density controls.
- Filter UI: date range picker, multi-select `type` and `category`, keyword input (debounced).
- Forms: Inline edit validators; full modal for add/edit with server error display.
- Accessibility: Focus outlines, aria labels on grid controls, keyboard shortcuts.

## 8. Security Requirements
- JWT in `Authorization` header; no cookies for tokens.
- CORS: restrict to configured frontend origin(s).
- Input validation with centralized schema (e.g., zod/joi).
- Audit fields: `createdAt`, `updatedAt`, `createdBy`, `updatedBy`.
- Logging: redact `password`, `Authorization`, tokens, and PII.
- Rate limiting and brute-force protection on `/auth/login`.

## 9. Performance & Capacity
- Data volume: initial up to 1M transactions total; typical queries cover 10k–100k ranges.
- Query strategy: compound indexes; server pagination; mongo projection to fields used in grid.
- Export strategy: client-side for ≤ 50k rows; server-side streaming for larger.

## 10. Availability, Deployment, and Environments
- Environments: `dev`, `staging`, `prod`.
- Frontend: Vercel; Backend: Render (or similar); DB: MongoDB Atlas M10+.
- Health checks and autoscaling (min 1, max 3 instances).
- Backups: Daily Atlas backups; 7-day retention.
- Config: env vars for secrets, DB URI, CORS origins, JWT secret, rate limits.

## 11. Observability
- Logs: JSON structured (pino/winston), request ID, response time, error stack on server only.
- Metrics: basic counters/histograms (reqs, latency, errors). If possible, expose `/metrics`.
- Alerts: error rate spikes, p95 latency breaches, memory/CPU high.

## 12. Validation Rules (server)
- Email: RFC 5322, ≤ 254 chars; unique.
- Password: ≥ 8 chars, at least 1 number and 1 letter.
- Category: trimmed, 1–64.
- Description: ≤ 500.
- Date: valid ISO; convert to UTC date.
- Amount: number; two decimals max.

## 13. Error Codes (examples)
- `AUTH_INVALID_CREDENTIALS` 401
- `AUTH_ACCOUNT_LOCKED` 423
- `AUTH_FORBIDDEN` 403
- `VALIDATION_ERROR` 422
- `RESOURCE_NOT_FOUND` 404
- `RATE_LIMITED` 429
- `INTERNAL_ERROR` 500

## 14. Constraints
- No file attachments beyond CSV/XLSX import.
- No multi-tenant org model in v1.
- No real-time collaboration in v1.

## 15. Risks and Mitigations
- Grid performance: virtualization, server pagination, memoization; test with 100k rows synthetic data.
- Auth exploits: strong hashing, lockouts, rate-limiting, secret rotation procedures.
- Mongo scaling: proper indexes; avoid unbounded server responses; use projections.

## 16. Future Enhancements
- Real-time collaboration (WebSockets), analytics dashboards, scheduled reports, budget forecasts (ML), categories management with hierarchies, soft delete with audit log.

## 17. Acceptance and Test Plan (high-level)
- Unit tests: validation, services, RBAC guards.
- API tests: auth, CRUD, filters, pagination, export.
- UI tests: grid interactions, filters, inline edit rollback.
- Performance tests: p95 latency under 10k rows, export timings, scroll FPS.
- Security tests: rate-limiting, lockout, JWT tamper, input sanitization.
- Definition of Done: tests passing, lint clean, accessibility checks on critical flows, deployment to staging with smoke test, basic monitoring active.

## 18. High-Level Folder Structure
- Backend:
  - `src/` → `routes/`, `controllers/`, `models/`, `services/`, `middleware/`, `validators/`, `utils/`
- Frontend:
  - `src/` → `components/` (Grid, Toolbar, Filters), `pages/`, `hooks/`, `services/api/`, `state/`, `styles/`

## 19. Example Requests
```bash
# List transactions
GET /api/v1/transactions?page=1&limit=50&from=2024-01-01&to=2024-12-31&type=expense&sortBy=date&sortDir=desc
Authorization: Bearer <token>
```
```json
{
  "data": [ { "_id": "…", "date": "2025-09-30", "category": "Travel", "description": "Flight", "amount": 1200.00, "type": "expense" } ],
  "page": 1, "limit": 50, "total": 10342
}
```

## 20. Reporting Summary Endpoint Example
```bash
GET /api/v1/reports/summary?from=2025-01-01&to=2025-12-31&groupBy=category
```
```json
{
  "groupBy": "category",
  "from": "2025-01-01",
  "to": "2025-12-31",
  "results": [
    { "key": "Travel", "count": 123, "total": 54321.25 },
    { "key": "Salary", "count": 12, "total": 180000.00 }
  ]
}
```

## 21. Out of Scope (v1)
- Multi-currency conversions, bank connections, budgets, approvals, and audit log UI.

## 22. Compliance & Privacy
- Store minimal PII (email, name). No sensitive financial account numbers.
- Data deletion: user deletion removes their account; transactions remain unless explicitly deleted.

## 23. Architecture Summary
- React + Tailwind + React Data Grid; Axios w/ interceptors.
- Express + Mongoose; JWT middleware; rate limiter; validation middleware.
- MongoDB Atlas with defined indexes; backups and metrics.
