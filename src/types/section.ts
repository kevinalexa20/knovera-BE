export interface CreateSectionDTO {
  title: string;
  order: number;
}

export interface SectionResponse {
  id: string;
  title: string;
  order: number;
  courseId: string;
}