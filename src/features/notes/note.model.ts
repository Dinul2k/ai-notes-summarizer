export interface Note {
  id?: string;
  userId: string;
  content: string;
  summary?: string;
  createdAt: number;
}
