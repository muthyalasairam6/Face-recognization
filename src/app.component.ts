import { Component, inject, signal, computed } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { AuthService } from './services/auth.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms'; // Required for form controls

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    FormsModule,
    ReactiveFormsModule // Include ReactiveFormsModule
  ],
  providers: [DatePipe],
  template: `
    @if (authService.isLoggedIn()) {
      <div class="flex h-screen bg-gray-100">
        <!-- Sidebar -->
        <aside class="w-64 bg-gray-800 text-white flex flex-col p-4">
          <div class="flex items-center justify-between mb-8">
            <h1 class="text-2xl font-bold text-indigo-400">EduConnect</h1>
            <button (click)="toggleSidebar()" class="lg:hidden">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
            </button>
          </div>
          <nav class="flex-1 space-y-2">
            @if (authService.isAdmin()) {
              <a routerLink="/admin/dashboard" routerLinkActive="bg-gray-700" class="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-700">
                <span class="material-icons">dashboard</span>
                <span>Admin Dashboard</span>
              </a>
              <a routerLink="/admin/users" routerLinkActive="bg-gray-700" class="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-700">
                <span class="material-icons">people</span>
                <span>User Management</span>
              </a>
              <a routerLink="/admin/notes-oversight" routerLinkActive="bg-gray-700" class="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-700">
                <span class="material-icons">description</span>
                <span>Notes Oversight</span>
              </a>
              <a routerLink="/admin/reminders" routerLinkActive="bg-gray-700" class="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-700">
                <span class="material-icons">notifications</span>
                <span>Manage Reminders</span>
              </a>
            } @else if (authService.isFaculty()) {
              <a routerLink="/faculty/dashboard" routerLinkActive="bg-gray-700" class="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-700">
                <span class="material-icons">dashboard</span>
                <span>Faculty Dashboard</span>
              </a>
              <a routerLink="/faculty/notes-upload" routerLinkActive="bg-gray-700" class="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-700">
                <span class="material-icons">upload_file</span>
                <span>Upload Notes</span>
              </a>
              <a routerLink="/faculty/attendance" routerLinkActive="bg-gray-700" class="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-700">
                <span class="material-icons">assignment</span>
                <span>Manage Attendance</span>
              </a>
              <a routerLink="/faculty/reminders" routerLinkActive="bg-gray-700" class="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-700">
                <span class="material-icons">notifications</span>
                <span>Create Reminders</span>
              </a>
            } @else if (authService.isStudent()) {
              <a routerLink="/student/dashboard" routerLinkActive="bg-gray-700" class="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-700">
                <span class="material-icons">dashboard</span>
                <span>Student Dashboard</span>
              </a>
              <!-- Removed student self-attendance link -->
              <a routerLink="/student/notes" routerLinkActive="bg-gray-700" class="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-700">
                <span class="material-icons">folder</span>
                <span>Access Notes</span>
              </a>
              <a routerLink="/student/reminders" routerLinkActive="bg-gray-700" class="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-700">
                <span class="material-icons">notifications_active</span>
                <span>My Reminders</span>
              </a>
              <a routerLink="/student/profile" routerLinkActive="bg-gray-700" class="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-700">
                <span class="material-icons">person</span>
                <span>My Profile</span>
              </a>
            }
            <a routerLink="/ai-chat" routerLinkActive="bg-gray-700" class="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-700">
              <span class="material-icons">chat</span>
              <span>AI Chat</span>
            </a>
          </nav>
          <div class="mt-auto">
            <button (click)="authService.logout()" class="w-full bg-red-600 hover:bg-red-700 text-white p-2 rounded-md flex items-center justify-center space-x-2">
              <span class="material-icons">logout</span>
              <span>Logout</span>
            </button>
          </div>
        </aside>

        <!-- Main Content -->
        <main class="flex-1 p-6 overflow-auto">
          <router-outlet></router-outlet>
        </main>
      </div>
    } @else {
      <!-- Login/Registration View -->
      <div class="flex items-center justify-center h-screen bg-gradient-to-br from-indigo-500 to-purple-600">
        <router-outlet></router-outlet>
      </div>
    }
  `,
  styles: [`
    .material-icons {
      font-family: 'Material Icons';
      font-weight: normal;
      font-style: normal;
      font-size: 24px;  /* Preferred icon size */
      display: inline-block;
      line-height: 1;
      text-transform: none;
      letter-spacing: normal;
      word-wrap: normal;
      white-space: nowrap;
      direction: ltr;
      -webkit-font-smoothing: antialiased;
      text-rendering: optimizeLegibility;
      -moz-osx-font-smoothing: grayscale;
      font-feature-settings: 'liga';
    }
  `]
})
export class AppComponent {
  authService = inject(AuthService);
  private router = inject(Router);

  sidebarOpen = signal(true); // Default open for desktop

  toggleSidebar() {
    this.sidebarOpen.update(value => !value);
  }

  constructor() {
    // If not logged in, redirect to login page.
    // This is handled by route guards implicitly or by the initial route.
    // The `authService.isLoggedIn()` signal controls the main template logic.
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
    }
  }
}