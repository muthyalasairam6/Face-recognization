import { Injectable, signal, computed, inject } from '@angular/core';
import { UserService } from './user.service';
import { User } from '../models';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userService = inject(UserService);
  private router = inject(Router);

  currentUser = signal<User | null>(null);
  isLoggedIn = computed(() => !!this.currentUser());
  isAdmin = computed(() => {
    const user = this.currentUser();
    console.log('AuthService.isAdmin computed:', { userRole: user?.role, isAdmin: user?.role === 'admin' });
    return user?.role === 'admin';
  });
  isFaculty = computed(() => {
    const user = this.currentUser();
    console.log('AuthService.isFaculty computed:', { userRole: user?.role, isFaculty: user?.role === 'faculty' });
    return user?.role === 'faculty';
  });
  isStudent = computed(() => {
    const user = this.currentUser();
    console.log('AuthService.isStudent computed:', { userRole: user?.role, isStudent: user?.role === 'student' });
    return user?.role === 'student';
  });

  constructor() {
    // Attempt to load user from session storage on init
    const storedUser = sessionStorage.getItem('currentUser');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        // Basic validation: ensure it's a valid User structure with required properties
        if (user && user.id && user.email && user.role) {
          this.currentUser.set(user);
          console.log('AuthService: User loaded from sessionStorage:', this.currentUser());
        } else {
          console.warn('AuthService: Invalid user data in sessionStorage. Clearing.');
          sessionStorage.removeItem('currentUser');
        }
      } catch (e) {
        console.error('AuthService: Failed to parse user from sessionStorage:', e);
        sessionStorage.removeItem('currentUser');
      }
    }
    console.log('AuthService: Initial currentUser state:', this.currentUser());
  }

  async login(email: string, password: string): Promise<boolean> {
    const user = await this.userService.getUserByEmail(email);

    console.log('AuthService: Attempting login for:', email);
    console.log('AuthService: User found:', user);

    if (user && user.password === password) { // In a real app, hash and compare passwords
      this.setCurrentUser(user);
      console.log('AuthService: Login successful. Current User after set:', this.currentUser());
      this.navigateToDashboard(user.role);
      return true;
    }
    this.currentUser.set(null);
    console.log('AuthService: Login failed. Current User after set to null:', this.currentUser());
    return false;
  }

  async register(newUser: Omit<User, 'id' | 'approved'>, password?: string): Promise<User | undefined> {
    // In a real app, 'approved' would be false by default and admin would approve.
    // For this simulation, auto-approve.
    const userToRegister: Omit<User, 'id'> = {
      ...newUser,
      password: password, // Store password for simulation
      approved: true // Auto-approve for simulation
    };
    const user = await this.userService.addUser(userToRegister as User);
    return user;
  }

  logout(): void {
    this.currentUser.set(null);
    sessionStorage.removeItem('currentUser');
    this.router.navigate(['/login']);
  }

  setCurrentUser(user: User): void {
    this.currentUser.set(user);
    sessionStorage.setItem('currentUser', JSON.stringify(user));
  }

  private navigateToDashboard(role: 'student' | 'faculty' | 'admin'): void {
    switch (role) {
      case 'admin':
        this.router.navigate(['/admin/dashboard']);
        break;
      case 'faculty':
        this.router.navigate(['/faculty/dashboard']);
        break;
      case 'student':
        this.router.navigate(['/student/dashboard']);
        break;
      default:
        this.router.navigate(['/']);
    }
  }
}