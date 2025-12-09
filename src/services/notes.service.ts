import { Injectable, signal } from '@angular/core';
import { Note } from '../models';
import { v4 as uuidv4 } from 'uuid';

@Injectable({
  providedIn: 'root'
})
export class NotesService {
  private notes = signal<Note[]>([]);

  constructor() { }

  getNotes(): Note[] {
    return this.notes();
  }

  getApprovedNotes(): Note[] {
    return this.notes().filter(note => note.approved);
  }

  getNotesByFaculty(facultyId: string): Note[] {
    return this.notes().filter(note => note.facultyId === facultyId);
  }

  getNotesBySubject(subject: string): Note[] {
    return this.notes().filter(note => note.subject.toLowerCase() === subject.toLowerCase() && note.approved);
  }

  getNotesBySubjectAndUnit(subject: string, unit: string): Note[] {
    return this.notes().filter(note =>
      note.subject.toLowerCase() === subject.toLowerCase() &&
      note.unit.toLowerCase() === unit.toLowerCase() &&
      note.approved
    );
  }

  async addNote(note: Omit<Note, 'id' | 'uploadDate' | 'approved'>): Promise<Note> {
    const newNote: Note = {
      ...note,
      id: uuidv4(),
      uploadDate: new Date(),
      approved: false // Admin approval needed in a real scenario, auto-approve for now
    };
    this.notes.update(currentNotes => [...currentNotes, newNote]);
    return newNote;
  }

  updateNote(updatedNote: Note): Note | undefined {
    let noteIndex = -1;
    this.notes.update(currentNotes => {
      noteIndex = currentNotes.findIndex(n => n.id === updatedNote.id);
      if (noteIndex !== -1) {
        return [
          ...currentNotes.slice(0, noteIndex),
          updatedNote,
          ...currentNotes.slice(noteIndex + 1)
        ];
      }
      return currentNotes;
    });
    return noteIndex !== -1 ? updatedNote : undefined;
  }

  approveNote(noteId: string): Note | undefined {
    let approvedNote: Note | undefined;
    this.notes.update(currentNotes => {
      const noteIndex = currentNotes.findIndex(n => n.id === noteId);
      if (noteIndex !== -1) {
        approvedNote = { ...currentNotes[noteIndex], approved: true };
        return [
          ...currentNotes.slice(0, noteIndex),
          approvedNote,
          ...currentNotes.slice(noteIndex + 1)
        ];
      }
      return currentNotes;
    });
    return approvedNote;
  }

  deleteNote(id: string): boolean {
    const initialLength = this.notes().length;
    this.notes.update(currentNotes => currentNotes.filter(note => note.id !== id));
    return this.notes().length < initialLength;
  }
}