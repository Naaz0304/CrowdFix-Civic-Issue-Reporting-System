<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js" />
  <img src="https://img.shields.io/badge/Express.js-4-000000?style=for-the-badge&logo=express" />
  <img src="https://img.shields.io/badge/PostgreSQL-15-336791?style=for-the-badge&logo=postgresql&logoColor=white" />
  <img src="https://img.shields.io/badge/Prisma-6-2D3748?style=for-the-badge&logo=prisma" />
  <img src="https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white" />
</p>

# 🏙️ CrowdFix — Civic Issue Reporting System

> **Empowering citizens to report, track, and resolve public infrastructure issues — together.**

CrowdFix is a full-stack web application where citizens report civic issues (potholes, broken streetlights, graffiti) and authorities manage, assign, and resolve them through a real-time dashboard — all backed by a PostgreSQL database with JWT authentication.

---

## 🛠️ Tech Stack

| Layer        | Technologies                                                              |
| ------------ | ------------------------------------------------------------------------- |
| **Frontend** | Next.js 16, TypeScript, Tailwind CSS, Radix UI, Recharts, React Hook Form |
| **Backend**  | Express.js, TypeScript, Prisma ORM, Zod validation, Swagger/OpenAPI       |
| **Database** | PostgreSQL 15 (Dockerized)                                                |
| **Auth**     | JWT (access + refresh tokens), bcrypt (12 rounds), RBAC middleware        |
| **DevOps**   | Docker Compose, Helmet, rate-limiting, Winston logger                     |
| **Testing**  | Jest (39 tests passing)                                                   |

---

## ✨ Features

**Citizens** — Report issues with photos & GPS • Upvote community issues • Track status updates • Rate resolutions • Get notifications

**Authorities** — Dashboard with analytics & charts • Assign/manage issues • Update statuses • View heatmap hotspots • Team assignment

**Security** — JWT with auto-refresh & rotation • Role-based access control • Zod input validation • Rate limiting • Helmet headers

---

## 📁 Project Structure

```
CROWD_SOURCE/
├── app/                        # Next.js pages (login, report, dashboard, community, heatmap)
├── contexts/                   # Auth & Issues React contexts (API-integrated)
├── components/ui/              # Radix UI components
├── lib/api-client.ts           # Centralized HTTP client with JWT management
│
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma       # 7 tables: users, issues, updates, upvotes, notifications...
│   │   └── seed.ts             # Demo data seeder
│   ├── src/
│   │   ├── index.ts            # Express entry point
│   │   ├── config/             # env, database, swagger config
│   │   ├── middleware/         # auth, rbac, validation, error-handler, rate-limiter
│   │   ├── routes/             # 6 route files with Swagger docs
│   │   ├── controllers/       # Request handlers
│   │   ├── services/          # Business logic
│   │   ├── schemas/           # Zod validation schemas
│   │   └── utils/             # JWT, password, logger
│   ├── tests/                  # Jest test suites
│   ├── docker-compose.yml
│   └── Dockerfile
│
├── next.config.mjs             # API proxy (/api/* → backend:5000)
└── package.json
```

---

## 🚀 Installation & Setup

### Prerequisites

- **Node.js** 20+ → [nodejs.org](https://nodejs.org/)
- **Docker Desktop** → [docker.com](https://www.docker.com/products/docker-desktop/)

### 1. Clone & Enter

```bash
git clone https://github.com/tejasc745/CrowdFix-Civic-Issue-Reporting-System.git
cd CrowdFix-Civic-Issue-Reporting-System
```

### 2. Start PostgreSQL

```bash
cd backend
docker-compose up -d postgres
```

Verify: `docker ps` → should show `crowdfix-db Up (healthy)`

### 3. Setup Backend

```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev --name init
npx ts-node prisma/seed.ts
```

### 4. Setup Frontend

```bash
cd ..
npm install --legacy-peer-deps
```

### 5. Run (Two Terminals)

**Terminal 1 — Backend:**

```bash
cd backend
npm run dev
# 🚀 Running on http://localhost:5000
```

**Terminal 2 — Frontend:**

```bash
npm run dev
# ▲ Ready on http://localhost:3000
```

### 6. Open & Login

| URL                              | Description     |
| -------------------------------- | --------------- |
| http://localhost:3000            | 🌐 Application  |
| http://localhost:5000/api-docs   | 📚 Swagger Docs |
| http://localhost:5000/api/health | 🏥 Health Check |

**Demo Accounts:**

| Role      | Email                   | Password       |
| --------- | ----------------------- | -------------- |
| Citizen   | `citizen@example.com`   | `citizen123`   |
| Authority | `authority@example.com` | `authority123` |

---

## 🐳 Docker Usage

```bash
# Start PostgreSQL only (development)
cd backend && docker-compose up -d postgres

# Start full stack (production)
docker-compose up --build

# Stop everything
docker-compose down

# Fresh reset (delete all data)
docker-compose down -v

# Open database GUI
npx prisma studio
```

### Environment Variables (`backend/.env`)

| Variable             | Default                                                            | Description          |
| -------------------- | ------------------------------------------------------------------ | -------------------- |
| `DATABASE_URL`       | `postgresql://crowdfix:crowdfix_secret@localhost:5432/crowdfix_db` | DB connection        |
| `JWT_ACCESS_SECRET`  | `crowdfix_access_secret_key...`                                    | Access token secret  |
| `JWT_REFRESH_SECRET` | `crowdfix_refresh_secret_key...`                                   | Refresh token secret |
| `PORT`               | `5000`                                                             | Backend port         |
| `FRONTEND_URL`       | `http://localhost:3000`                                            | CORS origin          |

> ⚠️ Change all secrets before deploying to production!

---

## 📚 API Documentation

Full Swagger UI at **http://localhost:5000/api-docs** — 22 endpoints across 6 modules:

| Module                                 | Endpoints | Key Operations                              |
| -------------------------------------- | --------- | ------------------------------------------- |
| **Auth** `/api/auth`                   | 4         | Register, Login, Refresh token, Logout      |
| **Users** `/api/users`                 | 2         | Get profile, Update profile                 |
| **Issues** `/api/issues`               | 8         | CRUD, Upvote toggle, Rate, Heatmap data     |
| **Admin** `/api/admin`                 | 4         | List all, Assign, Update status, Admin list |
| **Notifications** `/api/notifications` | 3         | List, Mark read, Mark all read              |
| **Dashboard** `/api/dashboard`         | 1         | Aggregated statistics                       |

### Quick Examples

```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"citizen@example.com","password":"citizen123"}'

# Create issue (use token from login response)
curl -X POST http://localhost:5000/api/issues \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Pothole on Main St","description":"Large pothole near intersection","category":"pothole","latitude":40.71,"longitude":-74.00}'
```

---

## 🧪 Testing

```bash
cd backend && npm test
```

```
PASS  tests/auth.test.ts      # 11 tests — JWT, bcrypt, schema validation
PASS  tests/issues.test.ts    # 12 tests — CRUD schemas, enums, bounds
PASS  tests/admin.test.ts     # 16 tests — Admin schemas, RBAC middleware

Test Suites: 3 passed, 3 total
Tests:       39 passed, 39 total
```

---

## 🗄️ Database Schema (7 Tables)

```
users ──────┬──▶ issues ──────┬──▶ issue_updates (status timeline)
            │                 ├──▶ upvotes (unique per user+issue)
            │                 └──▶ notifications
            ├──▶ refresh_tokens
            └──▶ community_posts
```

**Enums:** `UserRole` (citizen/admin) • `IssueCategory` (pothole/streetlight/sidewalk/graffiti/debris/other) • `IssueStatus` (reported/assigned/in_progress/resolved/verified/rejected) • `IssuePriority` (low/medium/high)

---

## 🔮 Future Improvements

- [ ] Cloud image uploads (AWS S3 / Cloudinary)
- [ ] Real-time WebSocket notifications
- [ ] Email alerts on status changes
- [ ] Google Maps integration for location picking
- [ ] React Native mobile app
- [ ] AI-powered issue categorization from photos
- [ ] CI/CD pipeline with GitHub Actions
- [ ] Kubernetes deployment

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

<p align="center"><b>Built with ❤️ for smarter cities</b></p>
