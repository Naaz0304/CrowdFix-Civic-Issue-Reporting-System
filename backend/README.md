# CrowdFix Backend API

Full-stack backend for the CrowdFix civic issue reporting system built with **Express.js**, **TypeScript**, **Prisma ORM**, and **PostgreSQL**.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js 20+ |
| Framework | Express.js + TypeScript |
| ORM | Prisma |
| Database | PostgreSQL 15+ |
| Auth | JWT (access + refresh tokens) |
| Password Hashing | bcrypt (12 rounds) |
| Validation | Zod |
| API Docs | Swagger (OpenAPI 3.0) |
| Testing | Jest + Supertest |
| Logging | Winston |

## Quick Start

### Prerequisites
- Node.js 20+
- Docker Desktop (for PostgreSQL)

### 1. Start PostgreSQL with Docker

```bash
cd backend
docker-compose up -d postgres
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Generate Prisma Client

```bash
npx prisma generate
```

### 4. Run Database Migrations

```bash
npx prisma migrate dev --name init
```

### 5. Seed the Database

```bash
npm run prisma:seed
```

### 6. Start Development Server

```bash
npm run dev
```

The API server will start at `http://localhost:5000`.

## API Documentation

Swagger UI is available at: `http://localhost:5000/api-docs`

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/refresh` | Refresh access token |
| POST | `/api/auth/logout` | Logout |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/me` | Get profile |
| PUT | `/api/users/update` | Update profile |

### Issues
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/issues` | Create issue |
| GET | `/api/issues` | List issues (paginated) |
| GET | `/api/issues/:id` | Get issue details |
| PUT | `/api/issues/:id` | Update issue |
| DELETE | `/api/issues/:id` | Delete issue |
| POST | `/api/issues/:id/upvote` | Toggle upvote |
| POST | `/api/issues/:id/rate` | Rate resolved issue |
| GET | `/api/issues/heatmap` | Get heatmap data |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/issues` | All issues (admin) |
| PUT | `/api/admin/issues/:id/assign` | Assign issue |
| PUT | `/api/admin/issues/:id/status` | Update status |
| GET | `/api/admin/list` | List admins |

### Notifications
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notifications` | Get notifications |
| PUT | `/api/notifications/:id/read` | Mark as read |
| PUT | `/api/notifications/read-all` | Mark all read |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/stats` | Dashboard statistics |

## Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Citizen | citizen@example.com | citizen123 |
| Admin | authority@example.com | authority123 |

## Docker (Full Stack)

```bash
docker-compose up --build
```

This starts both PostgreSQL and the backend API.

## Testing

```bash
npm test
```

## Project Structure

```
backend/
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.ts             # Seed data
├── src/
│   ├── index.ts            # Express entry point
│   ├── config/             # Configuration
│   ├── middleware/          # Auth, RBAC, validation, error handling
│   ├── routes/             # API route definitions
│   ├── controllers/        # Request handlers
│   ├── services/           # Business logic
│   ├── schemas/            # Zod validation schemas
│   ├── types/              # TypeScript types
│   └── utils/              # JWT, password, logger
├── tests/                  # Unit tests
├── docker-compose.yml      # Docker setup
└── Dockerfile              # Container build
```
