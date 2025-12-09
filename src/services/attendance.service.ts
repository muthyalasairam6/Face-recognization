import { Injectable, signal, computed, inject } from '@angular/core';
import { AttendanceRecord, User } from '../models';
import { v4 as uuidv4 } from 'uuid';
import { UserService } from './user.service';
import { DatePipe } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AttendanceService {
  private userService = inject(UserService);
  private datePipe = new DatePipe('en-US');

  private attendanceRecords = signal<AttendanceRecord[]>([]);

  constructor() {
    // Initialize some dummy attendance data
    const student1 = this.userService.getUsers().find(u => u.rollNo === 'CS001');
    const student2 = this.userService.getUsers().find(u => u.rollNo === 'CS002');
    const faculty = this.userService.getUsers().find(u => u.role === 'faculty');

    if (student1 && faculty) {
      this.attendanceRecords.update(records => [...records,
        { id: uuidv4(), studentId: student1.id, date: new Date('2024-03-01'), time: '09:00', status: 'present', subject: 'DBMS', creatorId: faculty.id },
        { id: uuidv4(), studentId: student1.id, date: new Date('2024-03-02'), time: '09:05', status: 'present', subject: 'DBMS', creatorId: faculty.id },
        { id: uuidv4(), studentId: student1.id, date: new Date('2024-03-03'), time: '09:00', status: 'absent', subject: 'DBMS', creatorId: faculty.id },
        { id: uuidv4(), studentId: student1.id, date: new Date('2024-03-04'), time: '10:00', status: 'present', subject: 'DSA', creatorId: faculty.id }
      ]);
    }
    if (student2 && faculty) {
      this.attendanceRecords.update(records => [...records,
        { id: uuidv4(), studentId: student2.id, date: new Date('2024-03-01'), time: '09:00', status: 'present', subject: 'DBMS', creatorId: faculty.id },
        { id: uuidv4(), studentId: student2.id, date: new Date('2024-03-02'), time: '09:05', status: 'absent', subject: 'DBMS', creatorId: faculty.id },
        { id: uuidv4(), studentId: student2.id, date: new Date('2024-03-03'), time: '09:00', status: 'present', subject: 'DBMS', creatorId: faculty.id },
        { id: uuidv4(), studentId: student2.id, date: new Date('2024-03-04'), time: '10:00', status: 'present', subject: 'DSA', creatorId: faculty.id }
      ]);
    }
  }

  async markStudentAttendanceByFaculty(
    studentId: string,
    subject: string,
    date: Date,
    status: 'present' | 'absent' | 'leave',
    facultyId: string
  ): Promise<AttendanceRecord> {
    const formattedTime = this.datePipe.transform(new Date(), 'HH:mm');

    const newRecord: AttendanceRecord = {
      id: uuidv4(),
      studentId: studentId,
      date: date,
      time: formattedTime || '',
      status: status,
      subject: subject,
      creatorId: facultyId
    };

    // Check for existing record for the same student, subject, and date to avoid duplicates
    const existingIndex = this.attendanceRecords().findIndex(
      record => record.studentId === studentId &&
                record.subject === subject &&
                this.datePipe.transform(record.date, 'yyyy-MM-dd') === this.datePipe.transform(date, 'yyyy-MM-dd')
    );

    if (existingIndex !== -1) {
      // Update existing record
      this.attendanceRecords.update(records => [
        ...records.slice(0, existingIndex),
        newRecord, // Replace with new record
        ...records.slice(existingIndex + 1)
      ]);
    } else {
      // Add new record
      this.attendanceRecords.update(records => [...records, newRecord]);
    }

    return newRecord;
  }

  getAttendanceByStudent(studentId: string): AttendanceRecord[] {
    return this.attendanceRecords().filter(record => record.studentId === studentId);
  }

  getAttendanceByDate(date: Date): AttendanceRecord[] {
    const formattedDate = this.datePipe.transform(date, 'yyyy-MM-dd');
    return this.attendanceRecords().filter(record =>
      this.datePipe.transform(record.date, 'yyyy-MM-dd') === formattedDate
    );
  }

  getAttendanceBySubject(subject: string): AttendanceRecord[] {
    return this.attendanceRecords().filter(record =>
      record.subject?.toLowerCase() === subject.toLowerCase()
    );
  }

  getOverallAttendancePercentage(studentId: string): number {
    const studentRecords = this.getAttendanceByStudent(studentId);
    if (studentRecords.length === 0) return 0;
    const presentCount = studentRecords.filter(r => r.status === 'present').length;
    return (presentCount / studentRecords.length) * 100;
  }

  getSubjectAttendancePercentage(studentId: string, subject: string): number {
    const studentRecords = this.getAttendanceByStudent(studentId).filter(r => r.subject === subject);
    if (studentRecords.length === 0) return 0;
    const presentCount = studentRecords.filter(r => r.status === 'present').length;
    return (presentCount / studentRecords.length) * 100;
  }

  getAllAttendanceRecords(): AttendanceRecord[] {
    return this.attendanceRecords();
  }

  getAttendanceStatsForAdmin(): { totalPresent: number, totalAbsent: number, totalRecords: number } {
    const records = this.attendanceRecords();
    const totalPresent = records.filter(r => r.status === 'present').length;
    const totalAbsent = records.filter(r => r.status === 'absent').length;
    return { totalPresent, totalAbsent, totalRecords: records.length };
  }
}