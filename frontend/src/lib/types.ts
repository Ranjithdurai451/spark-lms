export interface Organization {
  id: string;
  organizationName: string;
  organizationCode: string;
  organizationDescription?: string | null;
}
export type Role = "ADMIN" | "HR" | "EMPLOYEE";
export interface User {
  id: string;
  email: string;
  username: string;
  role: Role;
  organization?: Organization | null;
}
