import { Injectable, signal } from '@angular/core';
import { User } from '../models';
import { v4 as uuidv4 } from 'uuid';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private users = signal<User[]>([
    {
      id: uuidv4(),
      email: 'admin@example.com',
      password: 'password',
      role: 'admin',
      name: 'Admin User',
      approved: true
    },
    {
      id: uuidv4(),
      email: 'faculty@example.com',
      password: 'password',
      role: 'faculty',
      name: 'Dr. Alice Smith',
      branch: 'Computer Science',
      department: 'CSE',
      subjects: ['DBMS', 'DSA'],
      approved: true
    },
    {
      id: uuidv4(),
      email: 'student@example.com',
      password: 'password',
      role: 'student',
      name: 'Bob Johnson',
      branch: 'Computer Science',
      year: 3,
      semester: 6,
      section: 'A',
      rollNo: 'CS001',
      approved: true,
      facialData: 'base64simulatedstudentface' // For facial attendance simulation
    },
    {
      id: uuidv4(),
      email: 'student2@example.com',
      password: 'password',
      role: 'student',
      name: 'Charlie Brown',
      branch: 'Computer Science',
      year: 3,
      semester: 6,
      section: 'A',
      rollNo: 'CS002',
      approved: true,
      facialData: 'base64simulatedstudentface2'
    }
  ]);

  constructor() {
    // In a real app, this would fetch from a backend
  }

  getUsers(): User[] {
    return this.users();
  }

  getUserById(id: string): User | undefined {
    return this.users().find(user => user.id === id);
  }

  getUserByEmail(email: string): User | undefined {
    return this.users().find(user => user.email === email);
  }

  getAllStudents(): User[] {
    return this.users().filter(user => user.role === 'student');
  }

  async addUser(user: Omit<User, 'id'>): Promise<User> {
    const newUser: User = { ...user, id: uuidv4() };
    this.users.update(currentUsers => [...currentUsers, newUser]);
    return newUser;
  }

  updateUser(updatedUser: User): User | undefined {
    let userIndex = -1;
    this.users.update(currentUsers => {
      userIndex = currentUsers.findIndex(u => u.id === updatedUser.id);
      if (userIndex !== -1) {
        return [
          ...currentUsers.slice(0, userIndex),
          updatedUser,
          ...currentUsers.slice(userIndex + 1)
        ];
      }
      return currentUsers;
    });
    return userIndex !== -1 ? updatedUser : undefined;
  }

  deleteUser(id: string): boolean {
    const initialLength = this.users().length;
    this.users.update(currentUsers => currentUsers.filter(user => user.id !== id));
    return this.users().length < initialLength;
  }

  getStudentsBySection(section: string): User[] {
    return this.users().filter(user => user.role === 'student' && user.section === section);
  }
}