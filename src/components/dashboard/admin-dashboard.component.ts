import { Component, inject, computed, signal, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { NotesService } from '../../services/notes.service';
import { AttendanceService } from '../../services/attendance.service';
import { ReminderService } from '../../services/reminder.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  providers: [DatePipe],
  template: `
    <div class="p-6 bg-white shadow-md rounded-lg">
      <h2 class="text-3xl font-bold text-gray-800 mb-6">Admin Dashboard</h2>

      @if (currentUser()) {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <!-- User Count Card -->
          <div class="bg-gradient-to-r from-purple-500 to-indigo-600 text-white p-6 rounded-lg shadow-lg">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-xl font-semibold">Users</h3>
              <span class="material-icons text-4xl opacity-75">group</span>
            </div>
            <p class="text-4xl font-extrabold">{{ totalUsers() }}</p>
            <p class="text-sm mt-2">Total registered users</p>
            <div class="mt-4 flex space-x-4">
              <span class="text-sm"><span class="font-bold">{{ totalStudents() }}</span> Students</span>
              <span class="text-sm"><span class="font-bold">{{ totalFaculty() }}</span> Faculty</span>
            </div>
            <div class="mt-4">
              <a routerLink="/admin/users" class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-700 hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                Manage Users
              </a>
            </div>
          </div>

          <!-- Notes Statistics Card -->
          <div class="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-xl font-semibold text-gray-800">Notes & Materials</h3>
              <span class="material-icons text-gray-500 text-4xl opacity-75">folder_shared</span>
            </div>
            <p class="text-4xl font-extrabold text-blue-600">{{ totalNotes() }}</p>
            <p class="text-sm mt-2 text-gray-600">Total notes uploaded</p>
            <div class="mt-4 flex space-x-4">
              <span class="text-sm text-gray-700"><span class="font-bold">{{ approvedNotes() }}</span> Approved</span>
              <span class="text-sm text-gray-700"><span class="font-bold">{{ pendingNotes() }}</span> Pending</span>
            </div>
            <div class="mt-4">
              <a routerLink="/admin/notes-oversight" class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                Review Notes
              </a>
            </div>
          </div>

          <!-- Attendance Overview Card -->
          <div class="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-xl font-semibold text-gray-800">Attendance Overview</h3>
              <span class="material-icons text-gray-500 text-4xl opacity-75">assignment_turned_in</span>
            </div>
            <p class="text-4xl font-extrabold text-green-600">{{ attendanceStats().totalPresent }}</p>
            <p class="text-sm mt-2 text-gray-600">Total present records</p>
            <div class="mt-4 flex space-x-4">
              <span class="text-sm text-gray-700"><span class="font-bold">{{ attendanceStats().totalAbsent }}</span> Absent</span>
              <span class="text-sm text-gray-700"><span class="font-bold">{{ attendanceStats().totalRecords }}</span> Total Entries</span>
            </div>
            <div class="mt-4">
              <a routerLink="/admin/users" class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                View Reports
              </a>
            </div>
          </div>

          <!-- Reminders Sent Card -->
          <div class="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-xl font-semibold text-gray-800">Reminders Sent</h3>
              <span class="material-icons text-gray-500 text-4xl opacity-75">notifications</span>
            </div>
            <p class="text-4xl font-extrabold text-red-600">{{ totalReminders() }}</p>
            <p class="text-sm mt-2 text-gray-600">Total reminders created by admin</p>
            <div class="mt-4">
              <a routerLink="/admin/reminders" class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                Manage Reminders
              </a>
            </div>
          </div>
        </div>
      } @else {
        <p class="text-gray-700">Please log in to view your dashboard.</p>
      }
    </div>
  `,
  styles: [`
    .material-icons {
      font-family: 'Material Icons';
      font-weight: normal;
      font-style: normal;
      font-size: 24px;
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
export class AdminDashboardComponent implements OnInit {
  authService = inject(AuthService);
  userService = inject(UserService);
  notesService = inject(NotesService);
  attendanceService = inject(AttendanceService);
  reminderService = inject(ReminderService);

  currentUser = this.authService.currentUser;

  totalUsers = signal(0);
  totalStudents = signal(0);
  totalFaculty = signal(0);
  totalNotes = signal(0);
  approvedNotes = signal(0);
  pendingNotes = signal(0);
  attendanceStats = signal({ totalPresent: 0, totalAbsent: 0, totalRecords: 0 });
  totalReminders = signal(0);

  ngOnInit(): void {
    this.loadDashboardData();
  }

  private loadDashboardData(): void {
    const users = this.userService.getUsers();
    this.totalUsers.set(users.length);
    this.totalStudents.set(users.filter(u => u.role === 'student').length);
    this.totalFaculty.set(users.filter(u => u.role === 'faculty').length);

    const notes = this.notesService.getNotes();
    this.totalNotes.set(notes.length);
    this.approvedNotes.set(notes.filter(n => n.approved).length);
    this.pendingNotes.set(notes.filter(n => !n.approved).length);

    this.attendanceStats.set(this.attendanceService.getAttendanceStatsForAdmin());

    // Assuming admin is the creator for some reminders or just counting all
    this.totalReminders.set(this.reminderService.getReminders().length);
  }
}
