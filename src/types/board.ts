export interface ActivityEntry {
  id: string;
  text: string;
  createdAt: string;
  type: 'activity';
}

export interface ChecklistItem {
  id: string;
  text: string;
  done: boolean;
  assignee?: CardMember;
  dueDate?: string;
}

export interface Checklist {
  id: string;
  title: string;
  items: ChecklistItem[];
}

export interface CardLabel {
  id: string;
  color: string;
  text?: string;
}

export interface CardMember {
  id: string;
  initials: string;
  name: string;
  color: string;
}

export interface CardAttachment {
  id: string;
  name: string;
  url: string;
  addedAt: string;
}

export interface CustomField {
  id: string;
  name: string;
  type: 'select' | 'text' | 'number';
  value?: string;
  options?: string[];
}

export interface Card {
  id: string;
  title: string;
  description?: string;
  label?: { text: string; color: string };
  labels?: CardLabel[];
  image?: string;
  coverSize?: 'full' | 'half';
  attachments?: number;
  attachmentFiles?: CardAttachment[];
  checklists?: Checklist[];
  isCategory?: boolean;
  completed?: boolean;
  dueDate?: string;
  startDate?: string;
  members?: CardMember[];
  customFields?: CustomField[];
  archived?: boolean;
  mirrorOf?: string;
  activities?: ActivityEntry[];
}

export interface Column {
  id: string;
  title: string;
  cards: Card[];
  collapsed?: boolean;
}

export interface Board {
  id: string;
  title: string;
  columns: Column[];
}

export interface BoardMeta {
  id: string;
  title: string;
  color: string;
  icon?: string;
  starred: boolean;
  createdAt: string;
  columns: Column[];
}

export interface Workspace {
  id: string;
  title: string;
  icon: string;
  boards: BoardMeta[];
  createdAt: string;
}

export interface UserProfile {
  id: string;
  name: string;
  initials: string;
  color: string;
  avatarUrl?: string;
}
