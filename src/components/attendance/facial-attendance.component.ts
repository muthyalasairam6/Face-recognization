import { Component, inject, signal, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Import FormsModule for ngModel
import { AttendanceService } from '../../services/attendance.service';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models';

@Component({
  selector: 'app-facial-attendance',
  standalone: true,
  imports: [CommonModule, FormsModule], // Add FormsModule
  template: `
    <div class="p-6 bg-white shadow-md rounded-lg max-w-2xl mx-auto">
      <h2 class="text-3xl font-bold text-gray-800 mb-6 text-center">Mark Attendance with Face Scan</h2>

      @if (currentUser() && currentUser()?.role === 'student') {
        <div class="space-y-6">
          <div class="relative w-full aspect-video bg-gray-200 rounded-lg overflow-hidden border-2 border-dashed border-gray-400 flex items-center justify-center">
            <video #videoElement autoplay muted playsinline [hidden]="!videoEnabled()" class="absolute inset-0 w-full h-full object-cover"></video>
            @if (!videoEnabled()) {
              <p class="text-gray-600">Camera preview will appear here.</p>
            }
            @if (errorMessage()) {
              <p class="absolute top-4 left-4 bg-red-500 text-white text-sm px-3 py-1 rounded">{{ errorMessage() }}</p>
            }
          </div>

          <div>
            <label for="subject" class="block text-sm font-medium text-gray-700 mb-1">Subject for Attendance</label>
            <input type="text" id="subject" [(ngModel)]="currentSubject"
                   class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                   placeholder="e.g., Data Structures" [disabled]="isScanning()">
          </div>

          <div class="flex justify-center space-x-4">
            <button (click)="startCamera()" [disabled]="videoEnabled() || isScanning()"
                    class="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg shadow-md transition-colors duration-200 disabled:opacity-50">
              <span class="material-icons mr-2">videocam</span>
              Start Camera
            </button>
            <button (click)="takeAttendance()" [disabled]="!videoEnabled() || isScanning()"
                    class="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg shadow-md transition-colors duration-200 disabled:opacity-50">
              <span class="material-icons mr-2">face_unlock</span>
              Mark Attendance
            </button>
          </div>

          @if (statusMessage()) {
            <div [class]="statusMessage().includes('Success') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
                 class="p-4 rounded-md mt-4 text-center">
              {{ statusMessage() }}
            </div>
          }
        </div>
      } @else {
        <p class="text-center text-red-600">Only students can mark attendance.</p>
      }
    </div>
  `,
  styles: [`
    .material-icons {
      font-family: 'Material Icons';
      font-weight: normal;
      font-style: normal;
      font-size: 24px;
      display: inline-block;
      line-height: 1;
      text-transform: none;
      letter-spacing: normal;
      word-wrap: normal;
      white-space: nowrap;
      direction: ltr;
      -webkit-font-smoothing: antialiased;
      text-rendering: optimizeLegibility;
      -moz-osx-font-smoothing: grayscale;
      font-feature-settings: 'liga';
    }
  `]
})
export class FacialAttendanceComponent implements OnInit, OnDestroy, AfterViewInit {
  authService = inject(AuthService);
  attendanceService = inject(AttendanceService);

  currentUser = this.authService.currentUser;
  
  @ViewChild('videoElement') videoElementRef!: ElementRef<HTMLVideoElement>;
  videoElement!: HTMLVideoElement; // Will be assigned in ngAfterViewInit

  mediaStream: MediaStream | null = null;

  videoEnabled = signal(false);
  isScanning = signal(false);
  statusMessage = signal('');
  errorMessage = signal('');
  currentSubject: string = ''; // Changed from signal to regular property

  ngOnInit(): void {
    // Initialization logic if needed
  }

  ngAfterViewInit(): void {
    this.videoElement = this.videoElementRef.nativeElement;
  }

  ngOnDestroy(): void {
    this.stopCamera();
  }

  async startCamera(): Promise<void> {
    this.errorMessage.set('');
    this.statusMessage.set('');
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      this.errorMessage.set('getUserMedia not supported on your browser!');
      return;
    }

    if (!this.videoElement) {
      this.errorMessage.set('Video element not available.');
      return;
    }

    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      this.videoElement.srcObject = this.mediaStream;
      await this.videoElement.play();
      this.videoEnabled.set(true);
    } catch (err) {
      console.error('Error accessing camera: ', err);
      this.errorMessage.set('Could not access camera. Please check permissions.');
      this.videoEnabled.set(false);
    }
  }

  stopCamera(): void {
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }
    if (this.videoElement) {
      this.videoElement.srcObject = null;
    }
    this.videoEnabled.set(false);
    this.isScanning.set(false);
  }

  async takeAttendance(): Promise<void> {
    if (!this.videoElement || !this.videoEnabled() || this.isScanning()) {
      this.errorMessage.set('Camera not active or already scanning.');
      return;
    }
    if (!this.currentSubject) { // Access as property
      this.errorMessage.set('Please enter the subject for attendance.');
      return;
    }

    this.isScanning.set(true);
    this.statusMessage.set('Scanning for face...');
    this.errorMessage.set('');

    const student = this.currentUser();
    if (!student || student.role !== 'student') {
      this.statusMessage.set('Error: Not a student user.');
      this.isScanning.set(false);
      return;
    }

    // Simulate taking a snapshot and processing it
    const canvas = document.createElement('canvas');
    canvas.width = this.videoElement.videoWidth;
    canvas.height = this.videoElement.videoHeight;
    const context = canvas.getContext('2d');
    if (context) {
      context.drawImage(this.videoElement, 0, 0, canvas.width, canvas.height);
      const imageData = canvas.toDataURL('image/png'); // This would be sent to a real ML model

      // Simulate facial recognition success/failure
      // For this example, we're just checking against a dummy facialData string.
      // In a real app, 'imageData' would be sent to an actual facial recognition service.
      const recognitionResult = await this.attendanceService.recognizeFace(imageData, student.id);

      if (recognitionResult.success && recognitionResult.student?.id === student.id) {
        await this.attendanceService.markAttendance(student.id, this.currentSubject); // Pass property
        this.statusMessage.set('Attendance marked successfully! You are Present.');
      } else {
        this.statusMessage.set('Face not recognized or matched. Please try again.');
      }
    } else {
      this.errorMessage.set('Failed to get canvas context.');
    }

    this.isScanning.set(false);
    this.stopCamera(); // Stop camera after marking attendance
  }
}