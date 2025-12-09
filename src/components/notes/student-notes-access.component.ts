import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotesService } from '../../services/notes.service';
import { Note } from '../../models';

@Component({
  selector: 'app-student-notes-access',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [DatePipe],
  template: `
    <div class="p-6 bg-white shadow-md rounded-lg">
      <h2 class="text-3xl font-bold text-gray-800 mb-6">Access Study Notes</h2>

      <div class="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label for="subjectFilter" class="block text-sm font-medium text-gray-700">Filter by Subject</label>
          <input type="text" id="subjectFilter" [(ngModel)]="filterSubject" (input)="applyFilters()"
                 class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm">
        </div>
        <div>
          <label for="unitFilter" class="block text-sm font-medium text-gray-700">Filter by Unit</label>
          <input type="text" id="unitFilter" [(ngModel)]="filterUnit" (input)="applyFilters()"
                 class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm">
        </div>
        <!-- Removed Filter by Tag -->
      </div>

      @if (filteredNotes().length === 0) {
        <p class="text-gray-600 text-center py-8">No notes available matching your criteria.</p>
      } @else {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          @for (note of filteredNotes(); track note.id) {
            <div class="bg-gray-50 border border-gray-200 rounded-lg shadow-sm p-5">
              <h3 class="text-xl font-semibold text-gray-800 mb-2">{{ note.subject }} - {{ note.unit }}</h3>
              <p class="text-gray-600 text-sm mb-3">{{ note.description }}</p>
              <div class="mb-3">
                @for (tag of note.tags; track tag) {
                  <span class="inline-block bg-indigo-100 text-indigo-800 text-xs font-medium mr-1 px-2.5 py-0.5 rounded-full">{{ tag }}</span>
                }
              </div>
              <p class="text-xs text-gray-500 mb-4">Uploaded: {{ datePipe.transform(note.uploadDate, 'shortDate') }}</p>
              <a [href]="note.fileUrl" target="_blank"
                 class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                <span class="material-icons mr-2 text-base">download</span>
                View / Download
              </a>
            </div>
          }
        </div>
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
export class StudentNotesAccessComponent implements OnInit {
  notesService = inject(NotesService);
  datePipe = inject(DatePipe);

  allApprovedNotes = signal<Note[]>([]);
  filteredNotes = signal<Note[]>([]);

  filterSubject = signal('');
  filterUnit = signal('');

  ngOnInit(): void {
    this.loadNotes();
  }

  loadNotes(): void {
    this.allApprovedNotes.set(this.notesService.getApprovedNotes());
    this.applyFilters();
  }

  applyFilters(): void {
    let notes = this.allApprovedNotes();

    if (this.filterSubject()) {
      notes = notes.filter(note =>
        note.subject.toLowerCase().includes(this.filterSubject().toLowerCase())
      );
    }
    if (this.filterUnit()) {
      notes = notes.filter(note =>
        note.unit.toLowerCase().includes(this.filterUnit().toLowerCase())
      );
    }
    // Removed filtering by tags

    this.filteredNotes.set(notes);
  }
}