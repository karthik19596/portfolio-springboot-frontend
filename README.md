# Task Portfolio Frontend

Angular frontend for the **Portfolio Spring Boot Backend** task management API.

Repository: `https://github.com/karthik19596/portfolio-springboot-frontend`

Matching backend: `https://github.com/karthik19596/portfolio-springboot-backend`

## Tech Stack

- Angular 22 (standalone components, zoneless change detection)
- Angular Material
- TypeScript
- Reactive Forms
- JWT authentication with HTTP interceptors

## Features

- **Login / Register** with JWT auth and role-based routing
- Automatic access-token refresh using rotated refresh tokens
- Password-reset request and confirmation pages
- Real-time username and email availability checks on blur
- Field-level server validation error messages
- **Task Dashboard** with paginated, sortable task list
- **Create / Edit / Delete** tasks via Material dialogs
- **Admin Dashboard** for users, roles, and tasks
- `USER`, `ADMIN`, and `SUPER_ADMIN` role badges and navigation
- **Admin Audit Logs** viewer (visible to `ADMIN` and `SUPER_ADMIN` users)
- Ten-minute inactivity warning and fifteen-minute automatic logout
- Responsive, professional Material Design layout

## Project Structure

```text
portfolio-springboot-frontend/
├── src/
│   ├── app/
│   │   ├── components/        # App layout, task dialog, confirm dialog
│   │   ├── guards/            # authGuard, adminGuard
│   │   ├── interceptors/      # JWT interceptor
│   │   ├── models/            # TypeScript interfaces
│   │   ├── pages/             # auth, dashboard, tasks, admin, audit-logs
│   │   ├── services/          # Auth, Task, Admin, AuditLog services
│   │   ├── app.config.ts      # App providers and router
│   │   └── app.routes.ts      # Route definitions
│   ├── index.html
│   └── styles.scss
├── angular.json
├── proxy.conf.json
└── package.json
```

## Prerequisites

- Node.js 20 or later
- npm 10 or later
- Angular CLI 22 or later
- The backend running at `http://localhost:8080`

## Install Dependencies

```bash
npm install
```

If you are on Windows PowerShell and get a script execution policy error, use:

```powershell
npm.cmd install
```

## Run the Frontend

Make sure the backend is running first. From the backend repository:

```bash
mvn spring-boot:run
```

Then start the Angular dev server:

```bash
ng serve --open
```

If you are on Windows PowerShell and get a script execution policy error, use:

```powershell
ng.cmd serve --open
```

The app opens at `http://localhost:4200`.

API requests to `/api` are proxied to the backend at `http://localhost:8080` via `proxy.conf.json`.

## Build for Production

```bash
ng build --configuration production
```

Output is written to `dist/portfolio-springboot-frontend`.

## Default Accounts

Use the backend signup flow or the register page in the UI to create accounts.

- New registrations always receive the `USER` role.
- Promote the first administrator directly in MySQL, then log out and log in again:

```sql
UPDATE users
SET role = 'SUPER_ADMIN'
WHERE email = 'your-email@example.com';
```

- `ADMIN` users can manage normal users and tasks.
- `SUPER_ADMIN` users can manage all roles and administrator accounts.
- The logged-in user's own edit and delete actions are hidden.
- Admin access is enforced by the backend as well as the route guard.

## Authentication and Session Behavior

- Access tokens are refreshed automatically when they expire.
- Refresh tokens are rotated and stored only as hashes by the backend.
- Users receive an inactivity warning after 10 minutes and are logged out
  after 15 minutes without activity.
- Password reset pages are available at:
  - `http://localhost:4200/forgot-password`
  - `http://localhost:4200/reset-password`

## Notes

- A CORS config was added to the backend (`WebConfig.java`) so the frontend can talk to the API during development.
- The API base URL is configurable via the `API_BASE_URL` injection token; it defaults to `/api`.
- The frontend uses Angular zoneless change detection with signals for reactive state.
