export interface User {
  id: string;
  email: string;
  password?: string; // For client-side simulation, should not be stored in production
  role: 'student' | 'faculty' | 'admin';
  name: string;
  branch?: string;
  year?: number;
  semester?: number;
  approved: boolean;
  facialData?: string; // Base64 string for simulated facial data
  subjects?: string[]; // Faculty specific
  department?: string; // Faculty specific
  section?: string; // Student specific
  rollNo?: string; // Student specific
}

export interface Note {
  id: string;
  facultyId: string;
  subject: string;
  unit: string;
  tags: string[];
  fileUrl: string; // URL for the note content (e.g., PDF link, image link)
  approved: boolean;
  uploadDate: Date;
  description?: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  date: Date;
  time: string;
  status: 'present' | 'absent' | 'leave';
  subject?: string; // Optional, for context
  creatorId?: string; // ID of the faculty or admin who marked attendance
}

export interface Reminder {
  id: string;
  creatorId: string;
  title: string;
  description: string;
  targetRole: 'all' | 'student' | 'faculty';
  targetUsers?: string[]; // IDs of specific users
  dueDate: Date;
  createdAt: Date;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
}