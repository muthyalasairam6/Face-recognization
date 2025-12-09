import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotesService } from '../../services/notes.service';
import { AuthService } from '../../services/auth.service';
import { Note } from '../../models';

@Component({
  selector: 'app-faculty-notes-upload',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [DatePipe],
  template: `
    <div class="p-6 bg-white shadow-md rounded-lg">
      <h2 class="text-3xl font-bold text-gray-800 mb-6">Upload Notes & Study Material</h2>

      <!-- Upload Form -->
      <div class="mb-8 p-4 border border-gray-200 rounded-lg bg-gray-50">
        <h3 class="text-xl font-semibold text-gray-800 mb-4">New Material Upload</h3>
        <form (ngSubmit)="uploadNote()" class="space-y-4">
          <div>
            <label for="subject" class="block text-sm font-medium text-gray-700">Subject</label>
            <input type="text" id="subject" [(ngModel)]="newNote.subject" name="subject" required
                   class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm">
          </div>
          <div>
            <label for="unit" class="block text-sm font-medium text-gray-700">Unit</label>
            <input type="text" id="unit" [(ngModel)]="newNote.unit" name="unit" required
                   class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm">
          </div>
          <div>
            <label for="description" class="block text-sm font-medium text-gray-700">Description (Optional)</label>
            <textarea id="description" [(ngModel)]="newNote.description" name="description" rows="2"
                      class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"></textarea>
          </div>
          <div>
            <label for="file" class="block text-sm font-medium text-gray-700">Upload File</label>
            <input type="file" id="file" (change)="onFileSelected($event)"
                   class="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100">
            @if (selectedFileName()) {
              <p class="mt-2 text-sm text-gray-600">Selected file: <span class="font-medium">{{ selectedFileName() }}</span></p>
            }
            @if (fileUploadError()) {
              <p class="text-sm text-red-600 mt-2">{{ fileUploadError() }}</p>
            }
          </div>
          <div>
            <button type="submit" [disabled]="isUploading()"
                    class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md transition-colors duration-200 disabled:opacity-50">
              @if (isUploading()) {
                Uploading...
              } @else {
                Upload Note
              }
            </button>
            @if (formMessage()) {
              <p class="text-sm text-green-600 mt-2">{{ formMessage() }}</p>
            }
          </div>
        </form>
      </div>

      <!-- My Uploaded Notes List -->
      <h3 class="text-xl font-semibold text-gray-800 mb-4">My Uploaded Notes</h3>
      @if (myNotes().length === 0) {
        <p class="text-gray-600">You haven't uploaded any notes yet.</p>
      } @else {
        <div class="overflow-x-auto">
          <table class="min-w-full bg-white border border-gray-300 rounded-lg">
            <thead class="bg-gray-100">
              <tr>
                <th class="py-3 px-4 text-left text-sm font-semibold text-gray-600">Subject</th>
                <th class="py-3 px-4 text-left text-sm font-semibold text-gray-600">Unit</th>
                <th class="py-3 px-4 text-left text-sm font-semibold text-gray-600">Upload Date</th>
                <th class="py-3 px-4 text-left text-sm font-semibold text-gray-600">Status</th>
                <th class="py-3 px-4 text-left text-sm font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (note of myNotes(); track note.id) {
                <tr class="border-b border-gray-200 last:border-b-0 hover:bg-gray-50">
                  <td class="py-3 px-4 text-gray-800">{{ note.subject }}</td>
                  <td class="py-3 px-4 text-gray-800">{{ note.unit }}</td>
                  <td class="py-3 px-4 text-gray-800">{{ datePipe.transform(note.uploadDate, 'shortDate') }}</td>
                  <td class="py-3 px-4 text-gray-800">
                    <span [class]="note.approved ? 'text-green-600' : 'text-orange-600'">{{ note.approved ? 'Approved' : 'Pending' }}</span>
                  </td>
                  <td class="py-3 px-4">
                    <a [href]="note.fileUrl" target="_blank"
                       class="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md text-sm mr-2">
                      View
                    </a>
                    <button (click)="deleteNote(note.id)"
                            class="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-sm">
                      Delete
                    </button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>
  `,
  styles: []
})
export class FacultyNotesUploadComponent implements OnInit {
  notesService = inject(NotesService);
  authService = inject(AuthService);
  datePipe = inject(DatePipe);

  newNote: Omit<Note, 'id' | 'uploadDate' | 'approved' | 'facultyId'> = {
    subject: '',
    unit: '',
    tags: [], // Keep as empty array as tags are no longer input by faculty
    fileUrl: '', // This will hold Base64 string
    description: ''
  };
  formMessage = signal('');
  myNotes = signal<Note[]>([]);

  selectedFile: File | null = null;
  selectedFileName = signal('');
  fileUploadError = signal('');
  isUploading = signal(false);

  ngOnInit(): void {
    this.loadMyNotes();
  }

  loadMyNotes(): void {
    const facultyId = this.authService.currentUser()?.id;
    if (facultyId) {
      this.myNotes.set(this.notesService.getNotesByFaculty(facultyId));
    }
  }

  onFileSelected(event: Event): void {
    this.selectedFile = null;
    this.selectedFileName.set('');
    this.fileUploadError.set('');

    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      // Basic validation: max size 5MB
      const MAX_FILE_SIZE_MB = 5;
      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        this.fileUploadError.set(`File size exceeds ${MAX_FILE_SIZE_MB}MB limit.`);
        // Clear the file input visually by resetting its value
        input.value = '';
        return;
      }

      this.selectedFile = file;
      this.selectedFileName.set(file.name);
    }
  }

  async uploadNote(): Promise<void> {
    this.formMessage.set('');
    this.fileUploadError.set('');
    const currentUser = this.authService.currentUser();
    if (!currentUser || currentUser.role !== 'faculty') {
      this.formMessage.set('You must be logged in as faculty to upload notes.');
      return;
    }

    if (!this.newNote.subject || !this.newNote.unit) {
      this.formMessage.set('Please fill in Subject and Unit.');
      return;
    }

    if (!this.selectedFile) {
      this.fileUploadError.set('Please select a file to upload.');
      return;
    }

    this.isUploading.set(true);

    try {
      // Read file as Base64
      const reader = new FileReader();
      reader.readAsDataURL(this.selectedFile);

      reader.onloadend = async () => {
        this.newNote.fileUrl = reader.result as string;

        // Tags are no longer directly input by faculty, keep it as an empty array or default
        // this.newNote.tags = this.tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag);

        const noteToUpload: Omit<Note, 'id' | 'uploadDate' | 'approved'> = {
          ...this.newNote,
          facultyId: currentUser.id
        };

        const uploaded = await this.notesService.addNote(noteToUpload);
        if (uploaded) {
          this.formMessage.set('Note uploaded successfully! It is pending admin approval.');
          // Reset form
          this.newNote = { subject: '', unit: '', tags: [], fileUrl: '', description: '' };
          // this.tagsInput = ''; // Removed
          this.selectedFile = null;
          this.selectedFileName.set('');
          this.loadMyNotes(); // Refresh list
          setTimeout(() => this.formMessage.set(''), 3000);
        } else {
          this.formMessage.set('Failed to upload note.');
        }
        this.isUploading.set(false);
      };

      reader.onerror = () => {
        this.fileUploadError.set('Failed to read file.');
        this.isUploading.set(false);
      };

    } catch (error) {
      console.error('Error during file upload:', error);
      this.fileUploadError.set('An unexpected error occurred during file processing.');
      this.isUploading.set(false);
    }
  }

  deleteNote(id: string): void {
    if (confirm('Are you sure you want to delete this note?')) {
      const deleted = this.notesService.deleteNote(id);
      if (deleted) {
        alert('Note deleted!');
        this.loadMyNotes();
      }
    }
  }
}