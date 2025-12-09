import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { User } from '../../models';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-6 bg-white shadow-md rounded-lg">
      <h2 class="text-3xl font-bold text-gray-800 mb-6">User Management</h2>

      <!-- Add New User Form -->
      <div class="mb-8 p-4 border border-gray-200 rounded-lg bg-gray-50">
        <h3 class="text-xl font-semibold text-gray-800 mb-4">Add New User</h3>
        <form (ngSubmit)="addUser()" class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input type="text" [(ngModel)]="newUser.name" name="name" placeholder="Full Name" required
                 class="px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500">
          <input type="email" [(ngModel)]="newUser.email" name="email" placeholder="Email" required
                 class="px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500">
          <input type="password" [(ngModel)]="newUser.password" name="password" placeholder="Password" required
                 class="px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500">
          <select [(ngModel)]="newUser.role" name="role" required
                  class="px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500">
            <option value="" disabled>Select Role</option>
            <option value="student">Student</option>
            <option value="faculty">Faculty</option>
            <option value="admin">Admin</option>
          </select>
          @if (newUser.role === 'student') {
            <input type="text" [(ngModel)]="newUser.branch" name="branch" placeholder="Branch"
                   class="px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500">
            <input type="number" [(ngModel)]="newUser.year" name="year" placeholder="Year"
                   class="px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500">
            <input type="number" [(ngModel)]="newUser.semester" name="semester" placeholder="Semester"
                   class="px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500">
            <input type="text" [(ngModel)]="newUser.rollNo" name="rollNo" placeholder="Roll Number"
                   class="px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500">
            <input type="text" [(ngModel)]="newUser.section" name="section" placeholder="Section"
                   class="px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500">
          } @else if (newUser.role === 'faculty') {
            <input type="text" [(ngModel)]="newUser.department" name="department" placeholder="Department"
                   class="px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500">
            <input type="text" [(ngModel)]="facultySubjectsInput" name="subjects" placeholder="Subjects (comma-separated)"
                   class="px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                   (change)="onFacultySubjectsInputChange()">
          }
          <div class="col-span-full">
            <button type="submit"
                    class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md transition-colors duration-200">
              Add User
            </button>
            @if (formMessage()) {
              <p class="text-sm text-green-600 mt-2">{{ formMessage() }}</p>
            }
          </div>
        </form>
      </div>

      <!-- User List -->
      <div class="overflow-x-auto">
        <table class="min-w-full bg-white border border-gray-300 rounded-lg">
          <thead class="bg-gray-100">
            <tr>
              <th class="py-3 px-4 text-left text-sm font-semibold text-gray-600">Name</th>
              <th class="py-3 px-4 text-left text-sm font-semibold text-gray-600">Email</th>
              <th class="py-3 px-4 text-left text-sm font-semibold text-gray-600">Role</th>
              <th class="py-3 px-4 text-left text-sm font-semibold text-gray-600">Approved</th>
              <th class="py-3 px-4 text-left text-sm font-semibold text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (user of users(); track user.id) {
              <tr class="border-b border-gray-200 last:border-b-0 hover:bg-gray-50">
                <td class="py-3 px-4 text-gray-800">{{ user.name }}</td>
                <td class="py-3 px-4 text-gray-800">{{ user.email }}</td>
                <td class="py-3 px-4 text-gray-800 capitalize">{{ user.role }}</td>
                <td class="py-3 px-4 text-gray-800">
                  <span [class]="user.approved ? 'text-green-600' : 'text-red-600'">{{ user.approved ? 'Yes' : 'No' }}</span>
                </td>
                <td class="py-3 px-4">
                  @if (!user.approved) {
                    <button (click)="approveUser(user.id)"
                            class="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-md text-sm mr-2">
                      Approve
                    </button>
                  }
                  <button (click)="editUser(user)"
                          class="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md text-sm mr-2">
                    Edit
                  </button>
                  <button (click)="deleteUser(user.id)"
                          class="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-sm">
                    Delete
                  </button>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <!-- Edit User Modal -->
      @if (currentEditingUser) {
        <div class="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4">
          <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h3 class="text-xl font-semibold text-gray-800 mb-4">Edit User</h3>
            <form (ngSubmit)="saveUserChanges()" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">Name</label>
                <input type="text" [(ngModel)]="currentEditingUser.name" name="editName"
                       class="mt-1 block w-full px-3 py-2 border rounded-md">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Email</label>
                <input type="email" [(ngModel)]="currentEditingUser.email" name="editEmail"
                       class="mt-1 block w-full px-3 py-2 border rounded-md">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Role</label>
                <select [(ngModel)]="currentEditingUser.role" name="editRole"
                        class="mt-1 block w-full px-3 py-2 border rounded-md">
                  <option value="student">Student</option>
                  <option value="faculty">Faculty</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <!-- Role-specific fields for editing -->
              @if (currentEditingUser.role === 'student') {
                <div>
                  <label class="block text-sm font-medium text-gray-700">Branch</label>
                  <input type="text" [(ngModel)]="currentEditingUser.branch" name="editBranch"
                         class="mt-1 block w-full px-3 py-2 border rounded-md">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Year</label>
                  <input type="number" [(ngModel)]="currentEditingUser.year" name="editYear"
                         class="mt-1 block w-full px-3 py-2 border rounded-md">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Semester</label>
                  <input type="number" [(ngModel)]="currentEditingUser.semester" name="editSemester"
                         class="mt-1 block w-full px-3 py-2 border rounded-md">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Roll Number</label>
                  <input type="text" [(ngModel)]="currentEditingUser.rollNo" name="editRollNo"
                         class="mt-1 block w-full px-3 py-2 border rounded-md">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Section</label>
                  <input type="text" [(ngModel)]="currentEditingUser.section" name="editSection"
                         class="mt-1 block w-full px-3 py-2 border rounded-md">
                </div>
              } @else if (currentEditingUser.role === 'faculty') {
                <div>
                  <label class="block text-sm font-medium text-gray-700">Department</label>
                  <input type="text" [(ngModel)]="currentEditingUser.department" name="editDepartment"
                         class="mt-1 block w-full px-3 py-2 border rounded-md">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Subjects (comma-separated)</label>
                  <input type="text" [(ngModel)]="editingUserFacultySubjectsInput" name="editSubjects"
                         class="mt-1 block w-full px-3 py-2 border rounded-md"
                         (change)="onEditingUserFacultySubjectsInputChange()">
                </div>
              }
              <div>
                <label class="block text-sm font-medium text-gray-700">Approved</label>
                <input type="checkbox" [(ngModel)]="currentEditingUser.approved" name="editApproved"
                       class="mt-1 ml-2">
              </div>
              <div class="flex justify-end space-x-2">
                <button type="button" (click)="currentEditingUser = null"
                        class="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md">Cancel</button>
                <button type="submit"
                        class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `,
  styles: []
})
export class UserManagementComponent implements OnInit {
  userService = inject(UserService);

  users = signal<User[]>([]);
  // Fix: Initialize newUser.role to a valid default role instead of an empty string
  newUser: Partial<User> = {
    name: '', email: '', password: '', role: 'student', approved: true,
    branch: '', year: undefined, semester: undefined, rollNo: '', section: '',
    department: '', subjects: []
  };
  facultySubjectsInput: string = '';
  formMessage = signal('');

  currentEditingUser: User | null = null; // Use a regular property for editing
  editingUserFacultySubjectsInput: string = '';

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.users.set(this.userService.getUsers());
  }

  onFacultySubjectsInputChange(): void {
    this.newUser.subjects = this.facultySubjectsInput.split(',').map(s => s.trim()).filter(s => s);
  }

  onEditingUserFacultySubjectsInputChange(): void {
    if (this.currentEditingUser) {
      this.currentEditingUser.subjects = this.editingUserFacultySubjectsInput.split(',').map(s => s.trim()).filter(s => s);
    }
  }

  async addUser(): Promise<void> {
    if (this.newUser.email && this.newUser.password && this.newUser.name && this.newUser.role) {
      const user = await this.userService.addUser(this.newUser as User);
      if (user) {
        this.loadUsers();
        this.formMessage.set('User added successfully!');
        // Fix: Reset newUser.role to a valid default role instead of an empty string
        this.newUser = { // Reset form
          name: '', email: '', password: '', role: 'student', approved: true,
          branch: '', year: undefined, semester: undefined, rollNo: '', section: '',
          department: '', subjects: []
        };
        this.facultySubjectsInput = '';
        setTimeout(() => this.formMessage.set(''), 3000);
      } else {
        this.formMessage.set('Failed to add user.');
      }
    } else {
      this.formMessage.set('Please fill all required fields.');
    }
  }

  editUser(user: User): void {
    this.currentEditingUser = { ...user }; // Create a copy for editing
    if (user.role === 'faculty' && user.subjects) {
      this.editingUserFacultySubjectsInput = user.subjects.join(', ');
    } else {
      this.editingUserFacultySubjectsInput = '';
    }
  }

  saveUserChanges(): void {
    if (this.currentEditingUser) {
      this.userService.updateUser(this.currentEditingUser);
      this.loadUsers(); // Refresh the list
      this.currentEditingUser = null; // Close modal
    }
  }

  approveUser(id: string): void {
    const user = this.userService.getUserById(id);
    if (user) {
      const updatedUser: User = { ...user, approved: true };
      this.userService.updateUser(updatedUser);
      this.loadUsers();
    }
  }

  deleteUser(id: string): void {
    if (confirm('Are you sure you want to delete this user?')) {
      this.userService.deleteUser(id);
      this.loadUsers();
    }
  }
}