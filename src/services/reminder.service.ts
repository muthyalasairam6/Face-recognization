import { Injectable, signal } from '@angular/core';
import { Reminder } from '../models';
import { v4 as uuidv4 } from 'uuid';

@Injectable({
  providedIn: 'root'
})
export class ReminderService {
  private reminders = signal<Reminder[]>([
    {
      id: uuidv4(),
      creatorId: 'admin123', // Placeholder
      title: 'Mid-term Exam Schedule Released',
      description: 'Check your portal for the updated mid-term exam schedule. Applies to all branches.',
      targetRole: 'student',
      dueDate: new Date('2024-03-25T09:00:00'),
      createdAt: new Date('2024-03-20T10:00:00')
    },
    {
      id: uuidv4(),
      creatorId: 'faculty123', // Placeholder
      title: 'DSA Assignment 2 Deadline',
      description: 'The deadline for Data Structures & Algorithms Assignment 2 is approaching.',
      targetRole: 'student',
      dueDate: new Date('2024-03-30T23:59:59'),
      createdAt: new Date('2024-03-22T14:30:00')
    },
    {
      id: uuidv4(),
      creatorId: 'admin123', // Placeholder
      title: 'Faculty Meeting',
      description: 'Mandatory faculty meeting in Auditorium A on Friday.',
      targetRole: 'faculty',
      dueDate: new Date('2024-03-29T11:00:00'),
      createdAt: new Date('2024-03-25T09:00:00')
    }
  ]);

  constructor() { }

  getReminders(): Reminder[] {
    return this.reminders();
  }

  getRemindersForRole(role: 'student' | 'faculty' | 'admin'): Reminder[] {
    const today = new Date();
    return this.reminders().filter(r =>
      (r.targetRole === 'all' || r.targetRole === role) &&
      r.dueDate >= today // Only show upcoming reminders
    ).sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
  }

  getNotificationsHistoryForRole(role: 'student' | 'faculty' | 'admin'): Reminder[] {
    return this.reminders().filter(r =>
      (r.targetRole === 'all' || r.targetRole === role)
    ).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()); // Latest first
  }

  async addReminder(reminder: Omit<Reminder, 'id' | 'createdAt'>): Promise<Reminder> {
    const newReminder: Reminder = {
      ...reminder,
      id: uuidv4(),
      createdAt: new Date()
    };
    this.reminders.update(currentReminders => [...currentReminders, newReminder]);
    return newReminder;
  }

  deleteReminder(id: string): boolean {
    const initialLength = this.reminders().length;
    this.reminders.update(currentReminders => currentReminders.filter(r => r.id !== id));
    return this.reminders().length < initialLength;
  }
}
