import { Component, inject, signal, Input, Output, EventEmitter, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { User } from '../../models';

@Component({
  selector: 'app-facial-registration-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-lg shadow-xl p-8 w-full max-w-lg transform transition-all duration-300">
        <h2 class="text-2xl font-bold text-gray-800 text-center mb-6">Register Your Facial Data</h2>
        <p class="text-gray-600 text-center mb-4">
          Please allow camera access to capture your facial data for attendance.
        </p>

        <div class="relative w-full aspect-video bg-gray-200 rounded-lg overflow-hidden border-2 border-dashed border-gray-400 flex items-center justify-center mb-6">
          <video #videoElement autoplay muted playsinline [hidden]="!videoEnabled()" class="absolute inset-0 w-full h-full object-cover"></video>
          @if (!videoEnabled()) {
            <p class="text-gray-600">Camera preview will appear here.</p>
          }
          @if (errorMessage()) {
            <p class="absolute top-4 left-4 bg-red-500 text-white text-sm px-3 py-1 rounded">{{ errorMessage() }}</p>
          }
        </div>

        <div class="flex flex-col space-y-3">
          <div class="flex justify-center space-x-3">
            <button (click)="startCamera()" [disabled]="videoEnabled() || isCapturing()"
                    class="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-md shadow-md transition-colors duration-200 disabled:opacity-50 flex items-center">
              <span class="material-icons mr-2">videocam</span>
              Start Camera
            </button>
            <button (click)="captureFacialData()" [disabled]="!videoEnabled() || isCapturing()"
                    class="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-md shadow-md transition-colors duration-200 disabled:opacity-50 flex items-center">
              <span class="material-icons mr-2">face</span>
              Capture Face
            </button>
          </div>
          <button (click)="skipRegistration()" [disabled]="isCapturing()"
                  class="w-full bg-gray-400 hover:bg-gray-500 text-white px-5 py-2 rounded-md shadow-md transition-colors duration-200 disabled:opacity-50 flex items-center justify-center">
            <span class="material-icons mr-2">skip_next</span>
            Skip for now
          </button>
        </div>

        @if (statusMessage()) {
          <div [class]="statusMessage().includes('Success') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
               class="p-4 rounded-md mt-6 text-center">
            {{ statusMessage() }}
          </div>
        }
      </div>
    </div>
  `,
  host: {
    class: 'block'
  }
})
export class FacialRegistrationModalComponent implements OnInit, OnDestroy, AfterViewInit {
  authService = inject(AuthService);
  userService = inject(UserService);

  @Input() userId!: string;
  @Output() facialDataRegistered = new EventEmitter<User>();
  @Output() skipped = new EventEmitter<void>();

  @ViewChild('videoElement') videoElementRef!: ElementRef<HTMLVideoElement>;
  videoElement!: HTMLVideoElement; // Will be assigned in ngAfterViewInit
  mediaStream: MediaStream | null = null;

  videoEnabled = signal(false);
  isCapturing = signal(false);
  statusMessage = signal('');
  errorMessage = signal('');

  ngOnInit(): void {
    // If we want to auto-start camera, call startCamera() here.
    // For now, let user click "Start Camera".
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
      this.statusMessage.set('Camera ready! Look at the camera and click "Capture Face".');
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
    this.isCapturing.set(false);
  }

  async captureFacialData(): Promise<void> {
    if (!this.videoElement || !this.videoEnabled() || this.isCapturing()) {
      this.errorMessage.set('Camera not active or already capturing.');
      return;
    }

    this.isCapturing.set(true);
    this.statusMessage.set('Capturing and processing facial data...');
    this.errorMessage.set('');

    try {
      const canvas = document.createElement('canvas');
      canvas.width = this.videoElement.videoWidth;
      canvas.height = this.videoElement.videoHeight;
      const context = canvas.getContext('2d');

      if (context) {
        context.drawImage(this.videoElement, 0, 0, canvas.width, canvas.height);
        const imageData = canvas.toDataURL('image/png'); // Base64 image data

        // Retrieve the current user and update their facialData
        const user = this.userService.getUserById(this.userId);
        if (user) {
          const updatedUser: User = { ...user, facialData: imageData };
          const result = this.userService.updateUser(updatedUser);
          if (result) {
            this.statusMessage.set('Facial data registered successfully!');
            this.stopCamera();
            setTimeout(() => this.facialDataRegistered.emit(result), 1500); // Emit updated user
          } else {
            this.errorMessage.set('Failed to save facial data.');
          }
        } else {
          this.errorMessage.set('User not found.');
        }
      } else {
        this.errorMessage.set('Failed to get canvas context.');
      }
    } catch (err) {
      console.error('Error capturing facial data:', err);
      this.errorMessage.set('An error occurred during capture. Please try again.');
    } finally {
      this.isCapturing.set(false);
    }
  }

  skipRegistration(): void {
    this.stopCamera();
    this.skipped.emit();
  }
}