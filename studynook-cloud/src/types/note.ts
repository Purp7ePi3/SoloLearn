export interface Note {
  id: string;
  title: string;
  subject: string;
  description: string;
  fileType: 'pdf' | 'doc' | 'ppt' | 'txt' | 'image';
  fileSize: string;
  uploadDate: Date;
  downloads: number;
  author: string;
  tags: string[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  university: string;
  major: string;
  uploadedNotes: number;
  downloadedNotes: number;
  joinDate: Date;
}

export type Subject = 
  | 'Mathematics'
  | 'Physics'
  | 'Chemistry'
  | 'Biology'
  | 'Computer Science'
  | 'Literature'
  | 'History'
  | 'Economics'
  | 'Psychology'
  | 'Other';

export type FileType = 'pdf' | 'doc' | 'ppt' | 'txt' | 'image';

export interface FilterOptions {
  subject: Subject | 'All';
  fileType: FileType | 'All';
  sortBy: 'newest' | 'oldest' | 'most-downloaded' | 'alphabetical';
  searchQuery: string;
}
