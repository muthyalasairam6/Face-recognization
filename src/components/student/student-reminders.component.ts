import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ReminderService } from '../../services/reminder.service';
import { Reminder } from '../../models';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-student-reminders',
  standalone: true,
  imports: [CommonModule],
  providers: [DatePipe],
  template: `
    <div class="p-6 bg-white shadow-md rounded-lg">
      <h2 class="text-3xl font-bold text-gray-800 mb-6">My Reminders & Notifications</h2>

      <!-- Upcoming Reminders -->
      <div class="mb-8">
        <h3 class="text-xl font-semibold text-gray-800 mb-4 flex items-center">
          <span class="material-icons mr-2 text-indigo-500">event</span>
          Upcoming Reminders
        </h3>
        @if (upcomingReminders().length === 0) {
          <p class="text-gray-600">No upcoming reminders.</p>
        } @else {
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            @for (reminder of upcomingReminders(); track reminder.id) {
              <div class="bg-blue-50 p-4 rounded-lg shadow-sm border border-blue-200">
                <p class="font-semibold text-blue-800">{{ reminder.title }}</p>
                <p class="text-sm text-gray-700 mt-1">{{ reminder.description }}</p>
                <p class="text-xs text-blue-600 mt-2">Due: {{ datePipe.transform(reminder.dueDate, 'medium') }}</p>
              </div>
            }
          </div>
        }
      </div>

      <!-- Notification History -->
      <div>
        <h3 class="text-xl font-semibold text-gray-800 mb-4 flex items-center">
          <span class="material-icons mr-2 text-purple-500">history</span>
          Notification History
        </h3>
        @if (notificationHistory().length === 0) {
          <p class="text-gray-600">No past notifications.</p>
        } @else {
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            @for (reminder of notificationHistory(); track reminder.id) {
              <div class="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-200">
                <p class="font-semibold text-gray-800">{{ reminder.title }}</p>
                <p class="text-sm text-gray-700 mt-1">{{ reminder.description }}</p>
                <p class="text-xs text-gray-500 mt-2">Sent: {{ datePipe.transform(reminder.createdAt, 'medium') }}</p>
              </div>
            }
          </div>
        }
      </div>
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
export class StudentRemindersComponent implements OnInit {
  reminderService = inject(ReminderService);
  authService = inject(AuthService);
  datePipe = inject(DatePipe);

  upcomingReminders = signal<Reminder[]>([]);
  notificationHistory = signal<Reminder[]>([]);

  ngOnInit(): void {
    this.loadReminders();
  }

  loadReminders(): void {
    if (this.authService.isStudent()) {
      this.upcomingReminders.set(this.reminderService.getRemindersForRole('student'));
      this.notificationHistory.set(this.reminderService.getNotificationsHistoryForRole('student'));
    }
  }
}
