import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { NotesService } from '../../services/notes.service';
import { Note } from '../../models';
import { FormsModule } from '@angular/forms'; // Import FormsModule

@Component({
  selector: 'app-admin-notes-oversight',
  standalone: true,
  imports: [CommonModule, FormsModule], // Add FormsModule here
  providers: [DatePipe],
  template: `
    <div class="p-6 bg-white shadow-md rounded-lg">
      <h2 class="text-3xl font-bold text-gray-800 mb-6">Notes Oversight</h2>

      <div class="mb-4">
        <label for="filterStatus" class="block text-sm font-medium text-gray-700">Filter by Status:</label>
        <select id="filterStatus" [(ngModel)]="filterStatus" (change)="loadNotes()"
                class="mt-1 block w-48 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
          <option value="all">All</option>
          <option value="approved">Approved</option>
          <option value="pending">Pending</option>
        </select>
      </div>

      <div class="overflow-x-auto">
        <table class="min-w-full bg-white border border-gray-300 rounded-lg">
          <thead class="bg-gray-100">
            <tr>
              <th class="py-3 px-4 text-left text-sm font-semibold text-gray-600">Subject</th>
              <th class="py-3 px-4 text-left text-sm font-semibold text-gray-600">Unit</th>
              <th class="py-3 px-4 text-left text-sm font-semibold text-gray-600">Tags</th>
              <th class="py-3 px-4 text-left text-sm font-semibold text-gray-600">Upload Date</th>
              <th class="py-3 px-4 text-left text-sm font-semibold text-gray-600">Status</th>
              <th class="py-3 px-4 text-left text-sm font-semibold text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            @if (filteredNotes().length === 0) {
              <tr>
                <td colspan="6" class="py-4 px-4 text-center text-gray-600">No notes found for this filter.</td>
              </tr>
            } @else {
              @for (note of filteredNotes(); track note.id) {
                <tr class="border-b border-gray-200 last:border-b-0 hover:bg-gray-50">
                  <td class="py-3 px-4 text-gray-800">{{ note.subject }}</td>
                  <td class="py-3 px-4 text-gray-800">{{ note.unit }}</td>
                  <td class="py-3 px-4 text-gray-800">
                    @for (tag of note.tags; track tag) {
                      <span class="inline-block bg-blue-100 text-blue-800 text-xs font-medium mr-1 px-2.5 py-0.5 rounded-full">{{ tag }}</span>
                    }
                  </td>
                  <td class="py-3 px-4 text-gray-800">{{ datePipe.transform(note.uploadDate, 'shortDate') }}</td>
                  <td class="py-3 px-4 text-gray-800">
                    <span [class]="note.approved ? 'text-green-600' : 'text-orange-600'">{{ note.approved ? 'Approved' : 'Pending' }}</span>
                  </td>
                  <td class="py-3 px-4">
                    @if (!note.approved) {
                      <button (click)="approveNote(note.id)"
                              class="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-md text-sm mr-2">
                        Approve
                      </button>
                    }
                    <button (click)="deleteNote(note.id)"
                            class="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-sm">
                      Delete
                    </button>
                  </td>
                </tr>
              }
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: []
})
export class AdminNotesOversightComponent implements OnInit {
  notesService = inject(NotesService);
  datePipe = inject(DatePipe);

  allNotes = signal<Note[]>([]);
  filteredNotes = signal<Note[]>([]);
  filterStatus = signal<'all' | 'approved' | 'pending'>('pending'); // Default to pending for review

  ngOnInit(): void {
    this.loadNotes();
  }

  loadNotes(): void {
    const notes = this.notesService.getNotes();
    this.allNotes.set(notes);
    this.applyFilter();
  }

  applyFilter(): void {
    if (this.filterStatus() === 'all') {
      this.filteredNotes.set(this.allNotes());
    } else if (this.filterStatus() === 'approved') {
      this.filteredNotes.set(this.allNotes().filter(note => note.approved));
    } else { // 'pending'
      this.filteredNotes.set(this.allNotes().filter(note => !note.approved));
    }
  }

  approveNote(noteId: string): void {
    const approved = this.notesService.approveNote(noteId);
    if (approved) {
      alert('Note approved!');
      this.loadNotes(); // Reload to update status
    }
  }

  deleteNote(noteId: string): void {
    if (confirm('Are you sure you want to delete this note?')) {
      const deleted = this.notesService.deleteNote(noteId);
      if (deleted) {
        alert('Note deleted!');
        this.loadNotes();
      }
    }
  }
}