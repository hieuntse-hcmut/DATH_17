export type UserRole = "STUDENT" | "LECTURER" | "ADMIN";

export type UserStatus = "ACTIVE" | "INACTIVE";

export interface IUser {
  id: number;
  username: string;
  fullName: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
}

export interface PageResponse<T> {
  content: T[];
  pageable?: {
    pageNumber: number;
    pageSize: number;
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  totalPages: number;
  totalElements: number;
  last: boolean;
  size: number;
  number: number;
  numberOfElements: number;
  first: boolean;
  empty: boolean;
}

export interface UserQueryParams {
  page?: number;
  size?: number;
  sort?: string;
}

export interface UpdateRolePayload {
  userId: number;
  role: UserRole;
}
