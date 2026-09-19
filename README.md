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
- Inline task editing for title, status, and priority
- **Pending Users** page for approving or rejecting `ADMIN`/`SUPER_ADMIN` accounts
- Admin task assignment with role-aware assignee selection
- `USER`, `ADMIN`, and `SUPER_ADMIN` role badges and navigation
- **Admin Audit Logs** viewer (visible to `ADMIN` and `SUPER_ADMIN` users)
- Global HTTP error interceptor with user-friendly snackbar messages
- 404 Not Found page
- Ten-minute inactivity warning and fifteen-minute automatic logout
- Responsive, professional Material Design layout

## Project Structure

```text
portfolio-springboot-frontend/
├── src/
│   ├── app/
│   │   ├── components/        # App layout, task dialog, confirm dialog
│   │   ├── guards/            # authGuard, adminGuard
│   │   ├── interceptors/      # JWT interceptor, error interceptor
│   │   ├── models/            # TypeScript interfaces
│   │   ├── pages/             # auth, dashboard, tasks, admin, audit-logs, pending-users, not-found
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

## Recommended Local Development Setup

### 1. Start Docker Desktop

Start Docker Desktop and wait until it shows **Running**.

### 2. Start MySQL and MongoDB

From the backend repository:

```powershell
cd D:\Projects\Portfolio\portfolio-springboot-backend
docker compose up -d mysql mongodb
docker compose ps
```

### 3. Run the backend

Open `D:\Projects\Portfolio\portfolio-springboot-backend` in IntelliJ IDEA, create a Spring Boot run configuration with active profile `mongo`, and run `PortfolioApplication`.

Backend URL:

```text
http://localhost:8080
```

### 4. Run the frontend in VS Code

1. Open the project folder in VS Code:

```text
D:\Projects\Portfolio\portfolio-springboot-frontend
```

2. Open the integrated terminal: **Terminal > New Terminal**.
3. Install dependencies if this is the first time:

```powershell
npm.cmd install
```

4. Start the dev server:

```powershell
npm.cmd run start -- --port 4200 --open
```

The app opens at `http://localhost:4200`.

API requests to `/api` are proxied to the backend at `http://localhost:8080` via `proxy.conf.json`.

If port 4200 is already in use, stop any running `node.exe` processes first:

```powershell
taskkill /F /IM node.exe
```

## Build for Production

```bash
ng build --configuration production
```

Output is written to `dist/portfolio-springboot-frontend`.

## Default Accounts

These accounts are seeded for local development and testing:

| Username | Email | Password | Role |
|---|---|---|---|
| `superadmin` | superadmin@example.com | `password123` | `SUPER_ADMIN` |
| `admin` | admin@example.com | `password123` | `ADMIN` |
| `user` | user@example.com | `password123` | `USER` |

Use any of these accounts to log in through the frontend.

### Role behavior

- New registrations always receive the `USER` role.
- `ADMIN` users can manage normal users and tasks.
- `SUPER_ADMIN` users can manage all roles and administrator accounts.
- Accounts created with `ADMIN` or `SUPER_ADMIN` role through the admin panel start as `PENDING` and must be approved on the **Pending Users** page before they can log in.
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
