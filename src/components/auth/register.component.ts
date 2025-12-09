import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models';
import { FacialRegistrationModalComponent } from './facial-registration-modal.component';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, FacialRegistrationModalComponent],
  template: `
    <div class="w-full max-w-lg bg-white rounded-lg shadow-xl p-8 transform transition-all duration-300 hover:scale-105">
      <h2 class="text-3xl font-extrabold text-gray-900 text-center mb-6">Register for EduConnect</h2>
      @if (!showFacialRegistrationModal()) {
        <form (ngSubmit)="onRegister()" class="space-y-6">
          <div>
            <label for="name" class="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input id="name" type="text" name="name" [(ngModel)]="newUser.name" required
                   class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
          </div>
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email address</label>
            <input id="email" type="email" name="email" [(ngModel)]="newUser.email" required
                   class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
          </div>
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input id="password" type="password" name="password" [(ngModel)]="password" required
                   class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
          </div>
          <div>
            <label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
            <input id="confirmPassword" type="password" name="confirmPassword" [(ngModel)]="confirmPassword" required
                   class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
          </div>

          <div>
            <label for="role" class="block text-sm font-medium text-gray-700 mb-1">Register as</label>
            <select id="role" name="role" [(ngModel)]="newUser.role" required
                    class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
              <option value="student">Student</option>
              <option value="faculty">Faculty</option>
            </select>
          </div>

          @if (newUser.role === 'student') {
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label for="branch" class="block text-sm font-medium text-gray-700 mb-1">Branch</label>
                <input id="branch" type="text" name="branch" [(ngModel)]="newUser.branch" required
                       class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
              </div>
              <div>
                <label for="year" class="block text-sm font-medium text-gray-700 mb-1">Year</label>
                <input id="year" type="number" name="year" [(ngModel)]="newUser.year" required
                       class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
              </div>
              <div>
                <label for="semester" class="block text-sm font-medium text-gray-700 mb-1">Semester</label>
                <input id="semester" type="number" name="semester" [(ngModel)]="newUser.semester" required
                       class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
              </div>
              <div>
                <label for="rollNo" class="block text-sm font-medium text-gray-700 mb-1">Roll Number</label>
                <input id="rollNo" type="text" name="rollNo" [(ngModel)]="newUser.rollNo" required
                       class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
              </div>
              <div>
                <label for="section" class="block text-sm font-medium text-gray-700 mb-1">Section</label>
                <input id="section" type="text" name="section" [(ngModel)]="newUser.section" required
                       class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
              </div>
            </div>
          } @else if (newUser.role === 'faculty') {
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label for="department" class="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <input id="department" type="text" name="department" [(ngModel)]="newUser.department" required
                       class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
              </div>
              <div>
                <label for="subjects" class="block text-sm font-medium text-gray-700 mb-1">Subjects (comma-separated)</label>
                <input id="subjects" type="text" name="subjects" [(ngModel)]="facultySubjectsInput"
                       class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                       (change)="onFacultySubjectsChange()">
              </div>
            </div>
          }

          @if (errorMessage()) {
            <p class="text-sm text-red-600">{{ errorMessage() }}</p>
          }
          <div>
            <button type="submit"
                    class="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200">
              Register
            </button>
          </div>
        </form>
        <div class="mt-6 text-center text-sm">
          <p class="text-gray-600">Already have an account?
            <a routerLink="/login" class="font-medium text-indigo-600 hover:text-indigo-500">Login here</a>
          </p>
        </div>
      } @else if (registeredStudentId()) {
        <app-facial-registration-modal
          [userId]="registeredStudentId()!"
          (facialDataRegistered)="onFacialDataComplete($event)"
          (skipped)="onFacialRegistrationSkipped()">
        </app-facial-registration-modal>
      }
    </div>
  `,
  styles: []
})
export class RegisterComponent {
  authService = inject(AuthService);
  router = inject(Router);

  newUser: Partial<User> = {
    name: '',
    email: '',
    role: 'student', // Default role
    branch: '',
    year: undefined,
    semester: undefined,
    section: '',
    rollNo: '',
    department: '',
    subjects: []
  };

  password: string = '';
  confirmPassword: string = '';
  errorMessage = signal('');
  facultySubjectsInput: string = '';

  showFacialRegistrationModal = signal(false);
  registeredStudentId = signal<string | null>(null);


  onFacultySubjectsChange() {
    this.newUser.subjects = this.facultySubjectsInput.split(',').map(s => s.trim()).filter(s => s);
  }

  async onRegister(): Promise<void> {
    this.errorMessage.set('');

    if (this.password !== this.confirmPassword) {
      this.errorMessage.set('Passwords do not match.');
      return;
    }

    if (!this.newUser.email || !this.password || !this.newUser.name || !this.newUser.role) {
      this.errorMessage.set('Please fill in all required fields.');
      return;
    }

    // Prepare user object for registration, excluding 'id' and 'approved'
    const userToRegister: Omit<User, 'id' | 'approved'> = {
      name: this.newUser.name!,
      email: this.newUser.email!,
      role: this.newUser.role!,
      branch: this.newUser.branch,
      year: this.newUser.year,
      semester: this.newUser.semester,
      section: this.newUser.section,
      rollNo: this.newUser.rollNo,
      department: this.newUser.department,
      subjects: this.newUser.subjects,
    };

    const registeredUser = await this.authService.register(userToRegister, this.password);

    if (registeredUser) {
      if (registeredUser.role === 'student') {
        this.registeredStudentId.set(registeredUser.id);
        this.showFacialRegistrationModal.set(true);
      } else {
        alert('Registration successful! You can now log in.');
        this.router.navigate(['/login']);
      }
    } else {
      this.errorMessage.set('Registration failed. Please try again.');
    }
  }

  onFacialDataComplete(updatedUser: User): void {
    // Optionally update authService.currentUser if needed, but not strictly for registration flow
    // this.authService.setCurrentUser(updatedUser);
    alert('Facial data registered and registration complete! You can now log in.');
    this.showFacialRegistrationModal.set(false);
    this.registeredStudentId.set(null);
    this.router.navigate(['/login']);
  }

  onFacialRegistrationSkipped(): void {
    alert('Facial data registration skipped. You can still log in.');
    this.showFacialRegistrationModal.set(false);
    this.registeredStudentId.set(null);
    this.router.navigate(['/login']);
  }
}