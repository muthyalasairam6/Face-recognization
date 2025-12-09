import { Component, inject, computed, signal, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { AttendanceService } from '../../services/attendance.service';
import { NotesService } from '../../services/notes.service';
import { ReminderService } from '../../services/reminder.service';
import { Note, Reminder } from '../../models';

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [CommonModule],
  providers: [DatePipe],
  template: `
    <div class="p-6 bg-white shadow-md rounded-lg">
      <h2 class="text-3xl font-bold text-gray-800 mb-6">Student Dashboard</h2>

      @if (currentUser()) {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <!-- Attendance Card -->
          <div class="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6 rounded-lg shadow-lg">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-xl font-semibold">Attendance</h3>
              <span class="material-icons text-4xl opacity-75">assignment</span>
            </div>
            <p class="text-4xl font-extrabold">{{ attendancePercentage() | number:'1.0-2' }}%</p>
            <p class="text-sm mt-2">Overall attendance percentage</p>
          </div>

          <!-- Upcoming Reminders -->
          <div class="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-xl font-semibold text-gray-800">Upcoming Reminders</h3>
              <span class="material-icons text-gray-500 text-4xl opacity-75">notifications_active</span>
            </div>
            @if (upcomingReminders().length > 0) {
              <ul class="space-y-2">
                @for (reminder of upcomingReminders(); track reminder.id) {
                  <li class="flex items-center text-gray-700">
                    <span class="material-icons text-indigo-500 mr-2 text-lg">event</span>
                    <span>{{ reminder.title }} - {{ datePipe.transform(reminder.dueDate, 'MMM d, y, h:mm a') }}</span>
                  </li>
                }
              </ul>
            } @else {
              <p class="text-gray-600">No upcoming reminders.</p>
            }
          </div>

          <!-- Recent Notes -->
          <div class="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-xl font-semibold text-gray-800">Recent Notes</h3>
              <span class="material-icons text-gray-500 text-4xl opacity-75">folder</span>
            </div>
            @if (recentNotes().length > 0) {
              <ul class="space-y-2">
                @for (note of recentNotes(); track note.id) {
                  <li class="flex items-center text-gray-700">
                    <span class="material-icons text-green-500 mr-2 text-lg">description</span>
                    <span>{{ note.subject }} - {{ note.unit }} ({{ datePipe.transform(note.uploadDate, 'shortDate') }})</span>
                  </li>
                }
              </ul>
            } @else {
              <p class="text-gray-600">No recent notes uploaded.</p>
            }
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
export class StudentDashboardComponent implements OnInit {
  authService = inject(AuthService);
  attendanceService = inject(AttendanceService);
  notesService = inject(NotesService);
  reminderService = inject(ReminderService);
  datePipe = inject(DatePipe);

  currentUser = this.authService.currentUser;
  attendancePercentage = signal(0);
  upcomingReminders = signal<Reminder[]>([]);
  recentNotes = signal<Note[]>([]);

  ngOnInit(): void {
    if (this.currentUser()) {
      this.loadDashboardData();
    }
  }

  private loadDashboardData(): void {
    const studentId = this.currentUser()?.id;
    if (studentId) {
      this.attendancePercentage.set(this.attendanceService.getOverallAttendancePercentage(studentId));
      this.upcomingReminders.set(this.reminderService.getRemindersForRole('student'));
      // Get most recent 5 notes
      this.recentNotes.set(
        this.notesService.getApprovedNotes()
          .sort((a, b) => b.uploadDate.getTime() - a.uploadDate.getTime())
          .slice(0, 5)
      );
    }
  }
}