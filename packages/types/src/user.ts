export type UserRole = "admin" | "general";

export type AppUser = {
  id: string;
  username: string;
  displayName: string;
  email: string;
  role: UserRole;
  failedLoginCount: number;
  lockedAt?: string;
  mustChangePassword: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreateUserInput = {
  username: string;
  displayName: string;
  email: string;
  role: UserRole;
  password: string;
};

export type UpdateUserInput = {
  displayName: string;
  email: string;
  role?: UserRole;
};
