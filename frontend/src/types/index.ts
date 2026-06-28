export interface User {
  id: number;
  name: string;
  surname: string;
  email: string;
  phone: string | null;
  gender: string | null;
  status: 'active' | 'passive';
  address: string | null;
  roles?: string[];
  permissions?: string[];
  created_at: string;
  updated_at: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface PaginationLinks {
  first: string | null;
  last: string | null;
  prev: string | null;
  next: string | null;
}

export interface PaginationMetaLink {
  url: string | null;
  label: string;
  active: boolean;
}

export interface PaginationMeta {
  current_page: number;
  from: number | null;
  last_page: number;
  links: PaginationMetaLink[];
  path: string;
  per_page: number;
  to: number | null;
  total: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  links: PaginationLinks;
  meta: PaginationMeta;
}

export interface UserQueryParams {
  page?: number;
  per_page?: number;
  'filter[search]'?: string;
  'filter[status]'?: 'active' | 'passive' | '';
  'filter[gender]'?: 'male' | 'female' | '';
  sort?: string;
}

export interface Permission {
  id: number;
  name: string;
  guard_name: string;
}

export interface Role {
  id: number;
  name: string;
  userCount: number;
  permissions: string[];
  users?: User[];
}
