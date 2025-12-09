import { Routes, CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './services/auth.service';
import { toObservable } from '@angular/core/rxjs-interop';
import { map, take } from 'rxjs/operators';

// Guards for role-based access
const isAdminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  return toObservable(authService.isAdmin).pipe(
    take(1),
    map(isAdmin => isAdmin ? true : router.parseUrl('/login'))
  );
};

const isFacultyGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  return toObservable(authService.isFaculty).pipe(
    take(1),
    map(isFaculty => isFaculty ? true : router.parseUrl('/login'))
  );
};

const isStudentGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  return toObservable(authService.isStudent).pipe(
    take(1),
    map(isStudent => isStudent ? true : router.parseUrl('/login'))
  );
};

const isAuthenticatedGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  return toObservable(authService.isLoggedIn).pipe(
    take(1),
    map(isLoggedIn => isLoggedIn ? true : router.parseUrl('/login'))
  );
};

export const APP_ROUTES: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./components/auth/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./components/auth/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'admin/dashboard',
    loadComponent: () => import('./components/dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent),
    canActivate: [isAdminGuard]
  },
  {
    path: 'admin/users',
    loadComponent: () => import('./components/admin/user-management.component').then(m => m.UserManagementComponent),
    canActivate: [isAdminGuard]
  },
  {
    path: 'admin/notes-oversight',
    loadComponent: () => import('./components/admin/admin-notes-oversight.component').then(m => m.AdminNotesOversightComponent),
    canActivate: [isAdminGuard]
  },
  {
    path: 'admin/reminders',
    loadComponent: () => import('./components/admin/admin-reminder-creation.component').then(m => m.AdminReminderCreationComponent),
    canActivate: [isAdminGuard]
  },
  {
    path: 'faculty/dashboard',
    loadComponent: () => import('./components/dashboard/faculty-dashboard.component').then(m => m.FacultyDashboardComponent),
    canActivate: [isFacultyGuard]
  },
  {
    path: 'faculty/notes-upload',
    loadComponent: () => import('./components/notes/faculty-notes-upload.component').then(m => m.FacultyNotesUploadComponent),
    canActivate: [isFacultyGuard]
  },
  {
    path: 'faculty/attendance',
    loadComponent: () => import('./components/attendance/faculty-attendance-management.component').then(m => m.FacultyAttendanceManagementComponent),
    canActivate: [isFacultyGuard]
  },
  {
    path: 'faculty/reminders',
    loadComponent: () => import('./components/admin/admin-reminder-creation.component').then(m => m.AdminReminderCreationComponent), // Reusing admin component for faculty too
    canActivate: [isFacultyGuard]
  },
  {
    path: 'student/dashboard',
    loadComponent: () => import('./components/dashboard/student-dashboard.component').then(m => m.StudentDashboardComponent),
    canActivate: [isStudentGuard]
  },
  // Removed student self-attendance route
  {
    path: 'student/notes',
    loadComponent: () => import('./components/notes/student-notes-access.component').then(m => m.StudentNotesAccessComponent),
    canActivate: [isStudentGuard]
  },
  {
    path: 'student/reminders',
    loadComponent: () => import('./components/student/student-reminders.component').then(m => m.StudentRemindersComponent),
    canActivate: [isStudentGuard]
  },
  {
    path: 'student/profile',
    loadComponent: () => import('./components/student/student-profile.component').then(m => m.StudentProfileComponent),
    canActivate: [isStudentGuard]
  },
  {
    path: 'ai-chat',
    loadComponent: () => import('./components/chat/ai-chat.component').then(m => m.AiChatComponent),
    canActivate: [isAuthenticatedGuard]
  },
  { path: '**', redirectTo: 'login' } // Wildcard route for any unmatched URL
];