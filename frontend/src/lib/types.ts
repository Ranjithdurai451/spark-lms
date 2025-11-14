export interface RoleStats {
  total: number;
  admin: number;
  hr: number;
  manager: number;
  employee: number;
}

export type Role = "ADMIN" | "HR" | "EMPLOYEE" | "MANAGER";

export interface Organization {
  id: string;
  organizationName: string;
  organizationCode: string;
  organizationDescription?: string | null;
}

export interface User {
  id: string;
  email: string;
  username: string;
  role: Role;
  organization?: Organization | null;
  manager?: { id: string; username: string; email?: string };
}

export type OrganizationMember = Pick<
  User,
  "id" | "username" | "email" | "role" | "manager"
>;

export interface FullOrganization extends Organization {
  createdAt?: string;
  updatedAt?: string;
  users: OrganizationMember[];
}

export type HOLIDAY_TYPE = "COMPANY" | "PUBLIC";
