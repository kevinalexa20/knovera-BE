export interface CreateLessonDTO {
  title: string;
  content: string;
  duration: number;
  order: number;
  type: 'VIDEO' | 'TEXT' | 'QUIZ';
}

export interface LessonResponse {
  id: string;
  title: string;
  content: string;
  duration: number;
  type: string;
  isPublished: boolean;
}