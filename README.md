# Mech Spec Technologies LMS (MVP)

Role-based Learning Management System for Mech Spec Technologies[cite: 1].

Live Demo: https://techmec-lms.vercel.app  
GitHub Repository: https://github.com/abdurrahman1294/techmec-lms

Demo Video: https://drive.google.com/file/d/1dk7mqNmeT8udMAsZ3UvdWOkxCY8PCn4z/view?usp=sharing 

Stack: React + Vite + TypeScript · Express + Prisma · PostgreSQL · JWT · bcrypt

## Roles

| Role | Capabilities |
|------|----------------|
| Student | Browse, cart, simulated checkout, learn, progress |
| Instructor | My Teaching: courses, lessons, publish, enrolled students |
| Admin | Users, suspend/activate, stats, audit logs (seeded only) |

## Quick Start (Local Setup)

If you want to run the project locally alongside the live deployment:

```bash
# 1. Database: create PostgreSQL DB named mechspec_lms

# 2. Backend
cd server
cp .env.example .env   # set DATABASE_URL and JWT_SECRET
npm install
npx prisma generate
npx prisma migrate deploy
npm run seed           # demo Admin / Instructor / Student + sample course
npm run dev            # http://localhost:5000

# 3. Frontend
cd ../client
npm install
npm run dev            # http://localhost:5173

```

## Demo Accounts (After Seed)

| Role | Email | Password |
| --- | --- | --- |
| Admin | admin@mechspec.local | Admin@12345

 |
| Instructor | instructor@mechspec.local | Instruct@12345

 |
| Student | student@mechspec.local | Student@mech1234

 |

## Architecture

```text
React (Vite) → Axios → Express REST API
  → JWT + RBAC middleware → Controllers → Prisma → PostgreSQL

```

Uploaded thumbnails are stored under `server/uploads/` and served at `/uploads/...`.

## Key Features

* Auth: register (Student/Instructor only), login, logout audit


* Courses + lessons (modules), publish, thumbnail **file upload** or URL


* Cart + simulated payment → Transaction + Enrollment


* Lesson progress tracking


* Admin users + system audit log UI


* Profile page


* Platform support FAQ assistant



## Docs

See `HANDOFF_COMPLETION.md` for API list, security notes, and defense guidance.

## MVP Limits (Intentional)

* Payment is simulated (no card data)


* JWT logout is client-side discard (token expires; not server-revoked)


* Support assistant is FAQ-based (not a full LLM)


* Thumbnails stored locally (object storage is a production step)
