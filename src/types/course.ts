import { User } from "@supabase/supabase-js"

export interface CreateCourseDTO {
  title: string;
  description: string;
  price: number;
  categoryIds: string[];
}

export interface CourseResponse {
  id: string;
  title: string;
  description: string;
  price: number;
  instructor: User;
  categoryId: string;
}