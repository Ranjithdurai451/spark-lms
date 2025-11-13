export interface Organization {
  id: string;
  organizationName: string;
  organizationCode: string;
  organizationDescription?: string | null;
}
export type Role = "ADMIN" | "HR" | "EMPLOYEE" | "MANAGER";
export interface User {
  id: string;
  email: string;
  username: string;
  role: Role;
  organization?: Organization | null;
  manager?: { id: string; username: string };
}
// src/lib/types/organization.ts
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
