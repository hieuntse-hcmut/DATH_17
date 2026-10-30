export type PublicationState = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export interface ICourseResponse {
  id: number;
  title: string;
  description: string | null;
  publicationState: PublicationState;
  enrollmentOpen: boolean;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
}

export type PublicationFilter = PublicationState | "ALL";
export type EnrollmentFilter = "ALL" | "OPEN" | "CLOSED";
export type CourseSortOption =
  | "createdAt,desc"
  | "createdAt,asc"
  | "title,asc"
  | "title,desc"
  | "id,asc"
  | "id,desc";
