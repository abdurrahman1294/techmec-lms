# Mech Spec Technologies LMS — Final Completion Handoff

## Architecture (unchanged)

```
User → React/Vite → Axios → Express REST API
  → Auth / RBAC middleware → Controllers → Prisma → PostgreSQL
```

JWT app roles: `ADMIN` | `INSTRUCTOR` | `STUDENT`  
Prisma enum: `ADMINISTRATOR` | `INSTRUCTOR` | `STUDENT`  
Mapping is centralized in auth controller.

---

## Features fully implemented

| Feature | Status |
|---------|--------|
| Register (STUDENT / INSTRUCTOR only) | Done |
| Login / Logout (client JWT discard + audit log) | Done |
| Password hashing (bcrypt) | Done |
| JWT auth + expiry (1d) | Done |
| Suspended-user block (login + every protected request) | Done |
| RBAC on sensitive endpoints | Done |
| Course CRUD (title, description, category, price, objectives, publish) | Done |
| Thumbnail file upload + URL | Done |
| User profile page | Done |
| Admin audit logs UI | Done |
| Showcase seed (3 roles + sample course) | Done |
| Lessons as course modules (auto sortOrder) | Done |
| Lesson content access control | Done |
| Instructor “My Teaching” workspace | Done |
| Admin assign instructorId on create | Done |
| Cart + simulated checkout | Done |
| Transaction + Enrollment on purchase | Done |
| Progress / mark lesson complete | Done |
| Instructor view enrolled students | Done |
| Admin users suspend/activate | Done |
| Admin / instructor / student dashboards | Done |
| SystemLog audit trail | Done |
| Platform-support FAQ assistant | Done |
| Admin seed script (not public register) | Done |

---

## Corrections in this hardening pass

1. **Public ADMIN registration removed** — backend `publicRegisterRoles`; frontend select has no Admin option.
2. **Lesson content gated** — unauthenticated/unenrolled users get titles only; full content for admin, course instructor, or enrolled student.
3. **ADMIN course ownership** — optional `instructorId` on create when role is ADMIN; otherwise creator is instructor.
4. **Instructor workflow** — `/instructor/courses` page + nav “My Teaching”.
5. **Modules** — Course → Lesson is the MVP module model (documented; no separate Module entity).
6. **Thumbnail** — URL only; UI notes file upload as future work.
7. **Logout** — documented as client-side token discard; server logs `USER_LOGOUT` but does **not** revoke JWTs.
8. **Suspended users** — re-checked via `authenticate` middleware on all protected routes.
9–14. Authorization, payment integrity, logging (no passwords/JWTs in logs), AI scope, API consistency, security model preserved.

---

## Files changed in this hardening pass

### Backend
- `server/src/utils/validators.ts` — `publicRegisterRoles`
- `server/src/controllers/auth.controller.ts` — public roles only
- `server/src/controllers/lesson.controller.ts` — content access control
- `server/src/routes/lesson.routes.ts` — optional auth on list; required on single lesson
- `server/src/controllers/course.controller.ts` — optional `instructorId` for ADMIN; `getMyInstructorCourses`
- `server/src/routes/course.routes.ts` — `/instructor/courses`
- `server/src/routes/auth.routes.ts` — logout documentation
- `server/src/controllers/assistant.controller.ts` — FAQ text updates
- `server/prisma/seed.ts` — **new** admin seed
- `server/package.json` — seed script

### Frontend
- `client/src/pages/Register.tsx` — no ADMIN option
- `client/src/pages/InstructorCourses.tsx` — **new**
- `client/src/App.tsx` — instructor route
- `client/src/components/Navbar.tsx` — My Teaching link
- `client/src/components/CourseForm.tsx` — thumbnail MVP note

---

## Remaining intentional limitations (MVP)

| Limitation | Notes |
|------------|--------|
| Thumbnails stored on local disk | Future: object storage (S3 etc.) |
| Logout does not revoke JWT server-side | Future: refresh tokens / denylist |
| No separate Module entity | Lessons = modules for MVP |
| FAQ assistant, not LLM | Future: optional OpenAI endpoint |
| No email password reset | Contact admin |
| Direct enroll endpoint still exists | Preferred path is cart → checkout |
| No real payment gateway | Simulated by design |

---

## How to run (final)

```bash
# PostgreSQL must be running with database mechspec_lms

cd server
cp .env.example .env
# Edit DATABASE_URL and JWT_SECRET

npm install
npx prisma generate
npx prisma migrate deploy
npm run seed          # creates admin@mechspec.local / Admin@12345
npm run dev           # http://localhost:5000

cd ../client
npm install
npm run dev           # http://localhost:5173
```

### Demo accounts (after seed + register)

| Role | How obtained | Example |
|------|----------------|---------|
| ADMIN | `npm run seed` | `admin@mechspec.local` / `Admin@12345` |
| INSTRUCTOR | Public Register | choose Instructor |
| STUDENT | Public Register | choose Student |

Change the default admin password after first use in any real environment.

---

## Recommended demonstration sequence

1. Show Register has only Student / Instructor (try forcing ADMIN via API → 400).
2. Seed/login Admin → Dashboard stats → Users (suspend/activate).
3. Register Instructor → **My Teaching** → create course (publish, price, objectives, thumbnail URL) → open course → add lessons → view students (empty).
4. Register Student → browse published courses → Add to Cart → Checkout → My Courses → Continue Learning → Mark Complete → progress updates.
5. Instructor refreshes enrolled students; Admin sees transactions/enrollments in dashboard.
6. Support AI: “How do I purchase a course?” / “Can I register as admin?”
7. Security: suspended user cannot login; student cannot POST /courses; unenrolled user cannot GET /lessons/:id content.

---

## Architectural decisions (for defense)

1. **Monolithic Express + React** — appropriate for MVP; microservices deferred.
2. **ADMIN not publicly registrable** — privilege separation; seed/ops provision admins.
3. **Lessons as modules** — one-level content is enough for the brief without a Module table.
4. **Thumbnail URL** — avoids multipart/storage complexity; roadmap includes object storage.
5. **Stateless JWT** — logout is client discard + audit log; revocation is a later enhancement.
6. **FAQ assistant** — controlled platform support only; not academic tutoring; LLM optional later.
7. **Simulated payment** — creates real Transaction + Enrollment rows without card data.
8. **Suspended check in middleware** — every protected API rejects suspended accounts, not only login.
9. **Lesson content stripping** — public can see lesson titles on catalogue; content requires enrollment/ownership/admin.
10. **ADMIN may set instructorId** — avoids admin “owning” every course they create for an instructor.

---

## Key API surface (additions / hardened)

| Method | Path | Notes |
|--------|------|--------|
| POST | /api/auth/register | STUDENT \| INSTRUCTOR only |
| POST | /api/auth/logout | Audit only; no server revoke |
| GET | /api/courses/:id/lessons | Optional auth; content if authorized |
| GET | /api/lessons/:id | Auth required + enrollment/owner/admin |
| GET | /api/instructor/courses | Instructor/Admin teaching list |
| POST | /api/courses | Body may include `instructorId` if ADMIN |
| POST | /api/cart/checkout | Transaction + Enrollment |
| POST | /api/enrollments/:courseId/lessons/:lessonId/complete | Progress |
| POST | /api/assistant | FAQ platform support |

---

## Security summary for defense

- bcrypt password hashes (cost 10)
- JWT signed with `JWT_SECRET`, verified on protected routes
- RBAC via `authorize(...)`
- Ownership checks on course/lesson mutations
- Suspended status checked in `authenticate`
- Prisma parameterized queries
- Input validation (email, password strength, IDs, prices)
- Secrets in `.env` (not committed; `.env.example` only in ZIP)
- Logs never store passwords or tokens
- Frontend is not the security boundary
