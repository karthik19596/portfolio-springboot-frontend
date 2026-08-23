# Task Portfolio Frontend

Angular frontend for the **Portfolio Spring Boot Backend** task management API.

## Tech Stack

- Angular 22 (standalone components, zoneless change detection)
- Angular Material
- TypeScript
- Reactive Forms
- JWT authentication with HTTP interceptors

## Features

- **Login / Register** with JWT auth and role-based routing
- **Task Dashboard** with paginated, sortable task list
- **Create / Edit / Delete** tasks via Material dialogs
- **Admin Audit Logs** viewer (visible only to `ADMIN` users)
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
│   │   ├── pages/             # login, register, tasks, audit-logs
│   │   ├── services/          # Auth, Task, AuditLog services
│   │   ├── app.config.ts      # App providers and router
│   │   └── app.routes.ts      # Route definitions
│   ├── index.html
│   └── styles.scss
├── angular.json
├── proxy.conf.json
└── package.json
```

## Prerequisites

- Node.js 20+ (v24 installed in this environment)
- npm 10+
- Angular CLI 22+
- The backend running at `http://localhost:8080`

## Install Dependencies

```powershell
cd D:\Projects\Portfolio\portfolio-springboot-frontend
npm install
```

## Run the Frontend

Make sure the backend is running first:

```powershell
# In one terminal, from the backend root
cd D:\Projects\Portfolio\portfolio-springboot-backend
mvn spring-boot:run
```

Then start the Angular dev server:

```powershell
cd D:\Projects\Portfolio\portfolio-springboot-frontend
ng serve --open
```

The app opens at `http://localhost:4200`.

API requests to `/api` are proxied to the backend at `http://localhost:8080` via `proxy.conf.json`.

## Build for Production

```powershell
ng build --configuration production
```

Output is written to `frontend/dist/frontend`.

## Default Demo Accounts

Use the backend signup flow to create accounts, or register a new user from the UI.

- Admin audit logs are available only for users whose role is `ADMIN`.
- The backend assigns the role supplied during signup (defaults to `USER`).

## Notes

- A CORS config was added to the backend (`WebConfig.java`) so the frontend can talk to the API directly during development.
- The API base URL is configurable via the `API_BASE_URL` injection token; it defaults to `/api`.
