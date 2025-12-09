import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { User } from '../../models';

@Component({
  selector: 'app-student-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-6 bg-white shadow-md rounded-lg max-w-2xl mx-auto">
      <h2 class="text-3xl font-bold text-gray-800 mb-6 text-center">My Profile</h2>

      @if (originalUser()) {
        <form (ngSubmit)="saveProfile()" class="space-y-6">
          <!-- Name -->
          <div>
            <label for="name" class="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input id="name" type="text" name="name" [(ngModel)]="editableUser.name" required
                   class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
          </div>

          <!-- Email (Read-only) -->
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email address</label>
            <input id="email" type="email" name="email" [ngModel]="editableUser.email" readonly
                   class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 cursor-not-allowed sm:text-sm">
          </div>

          <!-- Role (Read-only) -->
          <div>
            <label for="role" class="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <input id="role" type="text" name="role" [ngModel]="editableUser.role" readonly
                   class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 cursor-not-allowed capitalize sm:text-sm">
          </div>

          <!-- Student-specific details -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label for="branch" class="block text-sm font-medium text-gray-700 mb-1">Branch</label>
              <input id="branch" type="text" name="branch" [(ngModel)]="editableUser.branch" required
                     class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
            </div>
            <div>
              <label for="year" class="block text-sm font-medium text-gray-700 mb-1">Year</label>
              <input id="year" type="number" name="year" [(ngModel)]="editableUser.year" required
                     class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
            </div>
            <div>
              <label for="semester" class="block text-sm font-medium text-gray-700 mb-1">Semester</label>
              <input id="semester" type="number" name="semester" [(ngModel)]="editableUser.semester" required
                     class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
            </div>
            <div>
              <label for="rollNo" class="block text-sm font-medium text-gray-700 mb-1">Roll Number</label>
              <input id="rollNo" type="text" name="rollNo" [(ngModel)]="editableUser.rollNo" required
                     class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
            </div>
            <div class="col-span-1">
              <label for="section" class="block text-sm font-medium text-gray-700 mb-1">Section</label>
              <input id="section" type="text" name="section" [(ngModel)]="editableUser.section" required
                     class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
            </div>
          </div>

          @if (message()) {
            <p [class]="message().includes('successfully') ? 'text-green-600' : 'text-red-600'" class="text-sm mt-2">
              {{ message() }}
            </p>
          }

          <div class="pt-4">
            <button type="submit"
                    class="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200">
              Save Changes
            </button>
          </div>
        </form>
      } @else {
        <p class="text-center text-red-600">Please log in as a student to view your profile.</p>
      }
    </div>
  `,
  styles: []
})
export class StudentProfileComponent implements OnInit {
  authService = inject(AuthService);
  userService = inject(UserService);

  originalUser = signal<User | null>(null);
  editableUser!: User; // Will be initialized in ngOnInit

  message = signal('');

  ngOnInit(): void {
    const currentUser = this.authService.currentUser();
    if (currentUser && currentUser.role === 'student') {
      // Create a deep copy for editing
      this.originalUser.set(currentUser);
      this.editableUser = { ...currentUser };
    } else {
      this.originalUser.set(null);
      this.message.set('You must be logged in as a student to view this page.');
    }
  }

  async saveProfile(): Promise<void> {
    this.message.set('');
    if (!this.editableUser || !this.originalUser()?.id) {
      this.message.set('Error: User data not available for update.');
      return;
    }

    // Ensure non-editable fields are preserved from original user
    const userToUpdate: User = {
      ...this.editableUser,
      id: this.originalUser()!.id,
      email: this.originalUser()!.email, // Email is not editable by user
      role: this.originalUser()!.role,   // Role is not editable by user
      approved: this.originalUser()!.approved, // Approval status not editable by user
      password: this.originalUser()!.password, // Password not handled here
      facialData: this.originalUser()!.facialData, // Facial data not handled here
      subjects: this.originalUser()!.subjects, // Faculty-specific, preserve
      department: this.originalUser()!.department, // Faculty-specific, preserve
    };

    const updatedUser = this.userService.updateUser(userToUpdate);

    if (updatedUser) {
      this.authService.setCurrentUser(updatedUser); // Update Auth Service state and sessionStorage
      this.originalUser.set(updatedUser); // Update original user signal
      this.message.set('Profile updated successfully!');
      setTimeout(() => this.message.set(''), 3000);
    } else {
      this.message.set('Failed to update profile. Please try again.');
    }
  }
}