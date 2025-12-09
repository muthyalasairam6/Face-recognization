import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReminderService } from '../../services/reminder.service';
import { AuthService } from '../../services/auth.service';
import { Reminder } from '../../models';

@Component({
  selector: 'app-admin-reminder-creation',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [DatePipe],
  template: `
    <div class="p-6 bg-white shadow-md rounded-lg">
      <h2 class="text-3xl font-bold text-gray-800 mb-6">Create & Manage Reminders</h2>

      <!-- Create Reminder Form -->
      <div class="mb-8 p-4 border border-gray-200 rounded-lg bg-gray-50">
        <h3 class="text-xl font-semibold text-gray-800 mb-4">Create New Reminder</h3>
        <form (ngSubmit)="createReminder()" class="space-y-4">
          <div>
            <label for="title" class="block text-sm font-medium text-gray-700">Title</label>
            <input type="text" id="title" [(ngModel)]="newReminder.title" name="title" required
                   class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm">
          </div>
          <div>
            <label for="description" class="block text-sm font-medium text-gray-700">Description</label>
            <textarea id="description" [(ngModel)]="newReminder.description" name="description" rows="3" required
                      class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"></textarea>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label for="dueDate" class="block text-sm font-medium text-gray-700">Due Date & Time</label>
              <input type="datetime-local" id="dueDate" [(ngModel)]="newReminderDueDate" name="dueDate" required
                     class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm">
            </div>
            <div>
              <label for="targetRole" class="block text-sm font-medium text-gray-700">Target Audience</label>
              <select id="targetRole" [(ngModel)]="newReminder.targetRole" name="targetRole" required
                      class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm">
                <option value="all">All Users</option>
                <option value="student">Students</option>
                <option value="faculty">Faculty</option>
              </select>
            </div>
          </div>
          <div>
            <button type="submit"
                    class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md transition-colors duration-200">
              Create Reminder
            </button>
            @if (formMessage()) {
              <p class="text-sm text-green-600 mt-2">{{ formMessage() }}</p>
            }
          </div>
        </form>
      </div>

      <!-- Existing Reminders List -->
      <h3 class="text-xl font-semibold text-gray-800 mb-4">My Created Reminders</h3>
      @if (myReminders().length === 0) {
        <p class="text-gray-600">No reminders created yet.</p>
      } @else {
        <div class="overflow-x-auto">
          <table class="min-w-full bg-white border border-gray-300 rounded-lg">
            <thead class="bg-gray-100">
              <tr>
                <th class="py-3 px-4 text-left text-sm font-semibold text-gray-600">Title</th>
                <th class="py-3 px-4 text-left text-sm font-semibold text-gray-600">Description</th>
                <th class="py-3 px-4 text-left text-sm font-semibold text-gray-600">Due Date</th>
                <th class="py-3 px-4 text-left text-sm font-semibold text-gray-600">Target</th>
                <th class="py-3 px-4 text-left text-sm font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (reminder of myReminders(); track reminder.id) {
                <tr class="border-b border-gray-200 last:border-b-0 hover:bg-gray-50">
                  <td class="py-3 px-4 text-gray-800">{{ reminder.title }}</td>
                  <td class="py-3 px-4 text-gray-800">{{ reminder.description | slice:0:50 }}...</td>
                  <td class="py-3 px-4 text-gray-800">{{ datePipe.transform(reminder.dueDate, 'medium') }}</td>
                  <td class="py-3 px-4 text-gray-800 capitalize">{{ reminder.targetRole }}</td>
                  <td class="py-3 px-4">
                    <button (click)="deleteReminder(reminder.id)"
                            class="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-sm">
                      Delete
                    </button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>
  `,
  styles: []
})
export class AdminReminderCreationComponent implements OnInit {
  reminderService = inject(ReminderService);
  authService = inject(AuthService);
  datePipe = inject(DatePipe);

  newReminder: Omit<Reminder, 'id' | 'createdAt' | 'dueDate'> = {
    creatorId: this.authService.currentUser()?.id || '',
    title: '',
    description: '',
    targetRole: 'all',
    targetUsers: []
  };
  newReminderDueDate: string = ''; // For datetime-local input
  formMessage = signal('');
  myReminders = signal<Reminder[]>([]);

  ngOnInit(): void {
    this.loadMyReminders();
  }

  loadMyReminders(): void {
    const creatorId = this.authService.currentUser()?.id;
    if (creatorId) {
      this.myReminders.set(this.reminderService.getReminders().filter(r => r.creatorId === creatorId));
    }
  }

  async createReminder(): Promise<void> {
    this.formMessage.set('');
    if (!this.newReminder.title || !this.newReminder.description || !this.newReminderDueDate) {
      this.formMessage.set('Please fill all required fields.');
      return;
    }

    const dueDate = new Date(this.newReminderDueDate);
    if (isNaN(dueDate.getTime())) {
      this.formMessage.set('Invalid due date.');
      return;
    }

    const reminderToAdd: Omit<Reminder, 'id' | 'createdAt'> = {
      ...this.newReminder,
      dueDate: dueDate
    };

    const added = await this.reminderService.addReminder(reminderToAdd);
    if (added) {
      this.formMessage.set('Reminder created successfully!');
      this.newReminder = { // Reset form
        creatorId: this.authService.currentUser()?.id || '',
        title: '',
        description: '',
        targetRole: 'all',
        targetUsers: []
      };
      this.newReminderDueDate = '';
      this.loadMyReminders();
      setTimeout(() => this.formMessage.set(''), 3000);
    } else {
      this.formMessage.set('Failed to create reminder.');
    }
  }

  deleteReminder(id: string): void {
    if (confirm('Are you sure you want to delete this reminder?')) {
      const deleted = this.reminderService.deleteReminder(id);
      if (deleted) {
        alert('Reminder deleted!');
        this.loadMyReminders();
      }
    }
  }
}