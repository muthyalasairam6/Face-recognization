import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="w-full max-w-md bg-white rounded-lg shadow-xl p-8 transform transition-all duration-300 hover:scale-105">
      <h2 class="text-3xl font-extrabold text-gray-900 text-center mb-6">Welcome Back!</h2>
      <form (ngSubmit)="onLogin()" class="space-y-6">
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email address</label>
          <input
            id="email"
            type="email"
            name="email"
            [(ngModel)]="email"
            required
            class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="your@example.com"
          >
        </div>
        <div>
          <label for="password" class="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input
            id="password"
            type="password"
            name="password"
            [(ngModel)]="password"
            required
            class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="••••••••"
          >
        </div>
        @if (errorMessage()) {
          <p class="text-sm text-red-600">{{ errorMessage() }}</p>
        }
        <div>
          <button
            type="submit"
            class="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
          >
            Sign in
          </button>
        </div>
      </form>
      <div class="mt-6 text-center text-sm">
        <p class="text-gray-600">Don't have an account?
          <a routerLink="/register" class="font-medium text-indigo-600 hover:text-indigo-500">Register here</a>
        </p>
      </div>
    </div>
  `,
  styles: []
})
export class LoginComponent {
  authService = inject(AuthService);
  router = inject(Router);

  email: string = '';
  password: string = '';
  errorMessage = signal('');

  async onLogin(): Promise<void> {
    this.errorMessage.set('');
    const success = await this.authService.login(this.email, this.password);
    if (!success) {
      this.errorMessage.set('Invalid email or password.');
    }
    // Redirection is handled by the authService on successful login
  }
}