export interface otpTokenPayload {
  email: string;
  otp: string;
}

export type Role = "ADMIN" | "HR" | "EMPLOYEE";

export interface authTokenPayload {
  userId: string;
  role: Role;
}
