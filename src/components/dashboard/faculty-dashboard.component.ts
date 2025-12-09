import { Component, inject, computed, signal, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { NotesService } from '../../services/notes.service';
import { ReminderService } from '../../services/reminder.service';
import { Note, Reminder } from '../../models';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-faculty-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  providers: [DatePipe],
  template: `
    <div class="p-6 bg-white shadow-md rounded-lg">
      <h2 class="text-3xl font-bold text-gray-800 mb-6">Faculty Dashboard</h2>

      @if (currentUser()) {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <!-- Today's Classes -->
          <div class="bg-gradient-to-r from-teal-500 to-green-600 text-white p-6 rounded-lg shadow-lg">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-xl font-semibold">Today's Classes</h3>
              <span class="material-icons text-4xl opacity-75">class</span>
            </div>
            @if (todayClasses().length > 0) {
              <ul class="space-y-2">
                @for (subject of todayClasses(); track subject) {
                  <li class="flex items-center text-white">
                    <span class="material-icons mr-2 text-lg">bookmark</span>
                    <span>{{ subject }}</span>
                  </li>
                }
              </ul>
            } @else {
              <p class="text-sm mt-2">No classes scheduled for today (simulated).</p>
            }
          </div>

          <!-- Notes Upload Summary -->
          <div class="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-xl font-semibold text-gray-800">Notes Uploads</h3>
              <span class="material-icons text-gray-500 text-4xl opacity-75">upload_file</span>
            </div>
            <p class="text-4xl font-extrabold text-blue-600">{{ totalNotesUploaded() }}</p>
            <p class="text-sm mt-2 text-gray-600">Total notes uploaded by you.</p>
            <div class="mt-4">
              <a routerLink="/faculty/notes-upload" class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                Upload New Note
              </a>
            </div>
          </div>

          <!-- Upcoming Reminders -->
          <div class="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-xl font-semibold text-gray-800">Your Reminders</h3>
              <span class="material-icons text-gray-500 text-4xl opacity-75">notifications</span>
            </div>
            @if (upcomingReminders().length > 0) {
              <ul class="space-y-2">
                @for (reminder of upcomingReminders(); track reminder.id) {
                  <li class="flex items-center text-gray-700">
                    <span class="material-icons text-indigo-500 mr-2 text-lg">event</span>
                    <span>{{ reminder.title }} - {{ datePipe.transform(reminder.dueDate, 'shortDate') }}</span>
                  </li>
                }
              </ul>
            } @else {
              <p class="text-gray-600">No upcoming reminders created by you.</p>
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
export class FacultyDashboardComponent implements OnInit {
  authService = inject(AuthService);
  notesService = inject(NotesService);
  reminderService = inject(ReminderService);
  datePipe = inject(DatePipe);

  currentUser = this.authService.currentUser;
  totalNotesUploaded = signal(0);
  upcomingReminders = signal<Reminder[]>([]);
  todayClasses = signal<string[]>([]); // Simulated

  ngOnInit(): void {
    if (this.currentUser()) {
      this.loadDashboardData();
    }
  }

  private loadDashboardData(): void {
    const facultyId = this.currentUser()?.id;
    if (facultyId) {
      this.totalNotesUploaded.set(this.notesService.getNotesByFaculty(facultyId).length);
      this.upcomingReminders.set(this.reminderService.getRemindersForRole('faculty')); // Show reminders for faculty
      // Simulate today's classes based on faculty's assigned subjects
      this.todayClasses.set(this.currentUser()?.subjects || []);
    }
  }
}
