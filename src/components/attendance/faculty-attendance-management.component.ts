import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AttendanceService } from '../../services/attendance.service';
import { UserService } from '../../services/user.service';
import { AttendanceRecord, User } from '../../models';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-faculty-attendance-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [DatePipe],
  template: `
    <div class="p-6 bg-white shadow-md rounded-lg">
      <h2 class="text-3xl font-bold text-gray-800 mb-6">Attendance Management</h2>

      <!-- Mark Attendance Section -->
      <div class="mb-8 p-4 border border-indigo-200 rounded-lg bg-indigo-50">
        <h3 class="text-xl font-semibold text-indigo-800 mb-4">Mark Today's Attendance</h3>
        <form (ngSubmit)="submitClassAttendance()" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label for="attendanceDate" class="block text-sm font-medium text-indigo-700">Date</label>
              <input type="date" id="attendanceDate" [(ngModel)]="attendanceDate" name="attendanceDate" required
                     (change)="loadStudentsForAttendanceMarking()"
                     class="mt-1 block w-full px-3 py-2 border border-indigo-300 rounded-md shadow-sm">
            </div>
            <div>
              <label for="attendanceSubject" class="block text-sm font-medium text-indigo-700">Subject</label>
              <select id="attendanceSubject" [(ngModel)]="attendanceSubject" name="attendanceSubject" required
                      (change)="loadStudentsForAttendanceMarking()"
                      class="mt-1 block w-full px-3 py-2 border border-indigo-300 rounded-md shadow-sm">
                <option value="" disabled>Select Subject</option>
                @for (subject of availableSubjects(); track subject) {
                  <option [value]="subject">{{ subject }}</option>
                }
              </select>
            </div>
          </div>

          @if (studentsForAttendance().length > 0) {
            <div class="overflow-x-auto">
              <table class="min-w-full bg-white border border-gray-300 rounded-lg">
                <thead class="bg-gray-100">
                  <tr>
                    <th class="py-3 px-4 text-left text-sm font-semibold text-gray-600">Student Name</th>
                    <th class="py-3 px-4 text-left text-sm font-semibold text-gray-600">Roll No</th>
                    <th class="py-3 px-4 text-left text-sm font-semibold text-gray-600">Status</th>
                  </tr>
                </thead>
                <tbody>@for (student of studentsForAttendance(); track student.id) {
                    <tr class="border-b border-gray-200 last:border-b-0 hover:bg-gray-50">
                      <td class="py-3 px-4 text-gray-800">{{ student.name }}</td>
                      <td class="py-3 px-4 text-gray-800">{{ student.rollNo }}</td>
                      <td class="py-3 px-4 text-gray-800">
                        <select [(ngModel)]="currentAttendanceStatuses[student.id]" name="status_{{student.id}}"
                                (change)="onStatusChange(student.id, $any($event.target).value)"
                                class="px-2 py-1 border rounded-md text-sm">
                          <option value="present">Present</option>
                          <option value="absent">Absent</option>
                          <option value="leave">Leave</option>
                        </select>
                      </td>
                    </tr>
                  }</tbody>
              </table>
            </div>
            <div>
              <button type="submit"
                      class="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-md shadow-md transition-colors duration-200">
                Save Class Attendance
              </button>
              @if (attendanceFormMessage()) {
                <p class="text-sm text-green-600 mt-2">{{ attendanceFormMessage() }}</p>
              }
            </div>
          } @else {
            <p class="text-indigo-700 text-center">Select a date and subject to load students for attendance.</p>
          }
        </form>
      </div>


      <!-- Filter & View Past Records Section -->
      <h3 class="text-xl font-semibold text-gray-800 mb-4">Past Attendance Records</h3>
      <div class="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label for="filterDate" class="block text-sm font-medium text-gray-700">Filter by Date</label>
          <input type="date" id="filterDate" [(ngModel)]="filterDate" (change)="applyFilters()"
                 class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm">
        </div>
        <div>
          <label for="filterSubject" class="block text-sm font-medium text-gray-700">Filter by Subject</label>
          <input type="text" id="filterSubject" [(ngModel)]="filterSubject" (input)="applyFilters()"
                 class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm">
        </div>
        <div>
          <label for="filterSection" class="block text-sm font-medium text-gray-700">Filter by Section</label>
          <input type="text" id="filterSection" [(ngModel)]="filterSection" (input)="applyFilters()"
                 class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm">
        </div>
      </div>

      @if (filteredRecords().length === 0) {
        <p class="text-gray-600">No attendance records found for your selected filters.</p>
      } @else {
        <div class="overflow-x-auto mb-8">
          <table class="min-w-full bg-white border border-gray-300 rounded-lg">
            <thead class="bg-gray-100">
              <tr>
                <th class="py-3 px-4 text-left text-sm font-semibold text-gray-600">Student Name</th>
                <th class="py-3 px-4 text-left text-sm font-semibold text-gray-600">Roll No</th>
                <th class="py-3 px-4 text-left text-sm font-semibold text-gray-600">Subject</th>
                <th class="py-3 px-4 text-left text-sm font-semibold text-gray-600">Date</th>
                <th class="py-3 px-4 text-left text-sm font-semibold text-gray-600">Time</th>
                <th class="py-3 px-4 text-left text-sm font-semibold text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody>@for (record of filteredRecords(); track record.id) {
                <tr class="border-b border-gray-200 last:border-b-0 hover:bg-gray-50">
                  <td class="py-3 px-4 text-gray-800">{{ getStudentName(record.studentId) }}</td>
                  <td class="py-3 px-4 text-gray-800">{{ getStudentRollNo(record.studentId) }}</td>
                  <td class="py-3 px-4 text-gray-800">{{ record.subject }}</td>
                  <td class="py-3 px-4 text-gray-800">{{ datePipe.transform(record.date, 'shortDate') }}</td>
                  <td class="py-3 px-4 text-gray-800">{{ record.time }}</td>
                  <td class="py-3 px-4 text-gray-800 capitalize">
                    <span [class]="record.status === 'present' ? 'text-green-600' : 'text-red-600'">{{ record.status }}</span>
                  </td>
                </tr>
              }</tbody>
          </table>
        </div>
      }

      <h3 class="text-xl font-semibold text-gray-800 mb-4">Low Attendance Students</h3>
      @if (lowAttendanceStudents().length === 0) {
        <p class="text-gray-600">No students with low attendance (below 75%).</p>
      } @else {
        <div class="overflow-x-auto">
          <table class="min-w-full bg-white border border-gray-300 rounded-lg">
            <thead class="bg-gray-100">
              <tr>
                <th class="py-3 px-4 text-left text-sm font-semibold text-gray-600">Student Name</th>
                <th class="py-3 px-4 text-left text-sm font-semibold text-gray-600">Roll No</th>
                <th class="py-3 px-4 text-left text-sm font-semibold text-gray-600">Overall %</th>
              </tr>
            </thead>
            <tbody>@for (student of lowAttendanceStudents(); track student.id) {
                <tr class="border-b border-gray-200 last:border-b-0 hover:bg-gray-50">
                  <td class="py-3 px-4 text-gray-800">{{ student.name }}</td>
                  <td class="py-3 px-4 text-gray-800">{{ student.rollNo }}</td>
                  <td class="py-3 px-4 text-red-600 font-semibold">{{ attendanceService.getOverallAttendancePercentage(student.id) | number:'1.0-2' }}%</td>
                </tr>
              }</tbody>
          </table>
        </div>
      }
    </div>
  `,
  styles: []
})
export class FacultyAttendanceManagementComponent implements OnInit {
  attendanceService = inject(AttendanceService);
  userService = inject(UserService);
  authService = inject(AuthService);
  datePipe = inject(DatePipe);

  allRecords = signal<AttendanceRecord[]>([]);
  filteredRecords = signal<AttendanceRecord[]>([]);
  allStudents = signal<User[]>([]); // All students in the system

  filterDate = signal('');
  filterSubject = signal('');
  filterSection = signal('');

  // For marking attendance
  attendanceDate: string = this.datePipe.transform(new Date(), 'yyyy-MM-dd') || '';
  attendanceSubject: string = '';
  studentsForAttendance = signal<User[]>([]);
  currentAttendanceStatuses: { [studentId: string]: 'present' | 'absent' | 'leave' } = {};
  availableSubjects = signal<string[]>([]);
  attendanceFormMessage = signal('');

  lowAttendanceStudents = signal<User[]>([]);

  ngOnInit(): void {
    this.loadData();
    this.availableSubjects.set(this.authService.currentUser()?.subjects || []);
    if (this.availableSubjects().length > 0) {
      this.attendanceSubject = this.availableSubjects()[0]; // Default to first subject
    }
    this.loadStudentsForAttendanceMarking(); // Load students for initial date/subject
  }

  loadData(): void {
    this.allRecords.set(this.attendanceService.getAllAttendanceRecords());
    this.allStudents.set(this.userService.getAllStudents()); // Get all student users
    this.applyFilters();
    this.identifyLowAttendanceStudents();
  }

  loadStudentsForAttendanceMarking(): void {
    this.attendanceFormMessage.set('');
    if (!this.attendanceDate || !this.attendanceSubject) {
      this.studentsForAttendance.set([]);
      this.currentAttendanceStatuses = {};
      return;
    }

    const students = this.allStudents();
    this.studentsForAttendance.set(students);
    this.currentAttendanceStatuses = {}; // Reset statuses

    // Pre-populate statuses from existing records for this date/subject
    const existingRecordsForDateAndSubject = this.allRecords().filter(
      record => this.datePipe.transform(record.date, 'yyyy-MM-dd') === this.attendanceDate &&
                record.subject === this.attendanceSubject
    );

    this.studentsForAttendance().forEach(student => {
      const existingRecord = existingRecordsForDateAndSubject.find(rec => rec.studentId === student.id);
      this.currentAttendanceStatuses[student.id] = existingRecord ? existingRecord.status : 'absent'; // Default to absent
    });
  }

  onStatusChange(studentId: string, status: 'present' | 'absent' | 'leave'): void {
    this.currentAttendanceStatuses[studentId] = status;
  }

  async submitClassAttendance(): Promise<void> {
    this.attendanceFormMessage.set('');
    const faculty = this.authService.currentUser();
    if (!faculty || faculty.role !== 'faculty') {
      this.attendanceFormMessage.set('Error: Only faculty can mark attendance.');
      return;
    }

    if (!this.attendanceDate || !this.attendanceSubject) {
      this.attendanceFormMessage.set('Please select both a date and a subject.');
      return;
    }

    if (this.studentsForAttendance().length === 0) {
      this.attendanceFormMessage.set('No students to mark attendance for.');
      return;
    }

    const date = new Date(this.attendanceDate);

    for (const student of this.studentsForAttendance()) {
      const status = this.currentAttendanceStatuses[student.id] || 'absent';
      await this.attendanceService.markStudentAttendanceByFaculty(
        student.id,
        this.attendanceSubject,
        date,
        status,
        faculty.id
      );
    }

    this.attendanceFormMessage.set('Class attendance saved successfully!');
    this.loadData(); // Reload all data to include new records
    this.loadStudentsForAttendanceMarking(); // Reload students to reflect changes in marking section
    setTimeout(() => this.attendanceFormMessage.set(''), 3000);
  }


  applyFilters(): void {
    let records = this.allRecords();
    const currentUser = this.authService.currentUser();
    const facultySubjects = currentUser?.subjects || [];

    // Filter by faculty's assigned subjects
    records = records.filter(record => facultySubjects.includes(record.subject || ''));


    if (this.filterDate()) {
      const filterDateObj = new Date(this.filterDate());
      records = records.filter(record =>
        this.datePipe.transform(record.date, 'yyyy-MM-dd') === this.datePipe.transform(filterDateObj, 'yyyy-MM-dd')
      );
    }

    if (this.filterSubject()) {
      records = records.filter(record =>
        record.subject?.toLowerCase().includes(this.filterSubject().toLowerCase())
      );
    }

    if (this.filterSection()) {
      records = records.filter(record => {
        const student = this.userService.getUserById(record.studentId);
        return student?.section?.toLowerCase() === this.filterSection().toLowerCase();
      });
    }

    this.filteredRecords.set(records);
  }

  identifyLowAttendanceStudents(threshold: number = 75): void {
    const lowStudents: User[] = [];
    this.allStudents().forEach(student => {
      const percentage = this.attendanceService.getOverallAttendancePercentage(student.id);
      if (percentage < threshold) {
        lowStudents.push(student);
      }
    });
    this.lowAttendanceStudents.set(lowStudents);
  }

  getStudentName(studentId: string): string {
    return this.userService.getUserById(studentId)?.name || 'Unknown';
  }

  getStudentRollNo(studentId: string): string {
    return this.userService.getUserById(studentId)?.rollNo || 'N/A';
  }
}