export interface otpTokenPayload {
  email: string;
  otp: string;
}

export type Role = "ADMIN" | "HR" | "EMPLOYEE";

export interface authTokenPayload {
  userId: string;
  role: Role;
}

export interface memberInviteTokenPayload {
  role: Role;
  email: string;
  organizationId: string;
  managerId: string;
}
export interface resetPasswordTokenPayload {
  email: string;
}
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
  manager?: { id: string; username: string };
}
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}
