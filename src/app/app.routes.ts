import { Routes } from '@angular/router';
import { AppLayout } from './components/app-layout/app-layout';
import { Home } from './pages/home/home';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { Dashboard } from './pages/dashboard/dashboard';
import { Tasks } from './pages/tasks/tasks';
import { AuditLogs } from './pages/audit-logs/audit-logs';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';
import { guestGuard } from './guards/guest.guard';

export const routes: Routes = [
  // pathMatch 'full' keeps this from swallowing /dashboard and friends, which
  // are served by the guarded branch that also sits at ''. Deliberately
  // unguarded so the toolbar brand can return here mid-session.
  { path: '', component: Home, pathMatch: 'full' },
  { path: 'login', component: Login, canActivate: [guestGuard] },
  { path: 'register', component: Register, canActivate: [guestGuard] },
  {
    path: '',
    component: AppLayout,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', component: Dashboard },
      { path: 'tasks', component: Tasks },
      {
        path: 'audit-logs',
        component: AuditLogs,
        canActivate: [adminGuard],
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
