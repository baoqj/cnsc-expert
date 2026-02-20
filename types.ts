export type Language = 'en' | 'fr' | 'es' | 'zh';

export type UserRole = 'user' | 'admin';

export type ViewState = 
  | 'dashboard' 
  | 'qa' 
  | 'search' 
  | 'compliance' 
  | 'library'
  | 'admin-settings'
  | 'admin-kb'
  | 'admin-users';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  status: 'active' | 'inactive';
  lastActive: string;
}

export interface Document {
  id: string;
  title: string;
  type: 'pdf' | 'docx' | 'web';
  date: string;
  status: 'indexed' | 'processing' | 'error';
  tags: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sources?: string[];
}

export interface ChatApiResponse {
  answer: string;
  conversationId: string | null;
  messageId: string | null;
  sources: string[];
}

export interface ComplianceReport {
  id: string;
  projectName: string;
  score: number;
  status: 'compliant' | 'warning' | 'critical';
  date: string;
}
