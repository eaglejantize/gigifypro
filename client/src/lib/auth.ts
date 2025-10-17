import { User } from "@shared/schema";

export interface AuthUser extends User {
  role: "user" | "worker" | "admin";
}

export function getAuthUser(): AuthUser | null {
  const userStr = localStorage.getItem("user");
  if (!userStr) return null;
  return JSON.parse(userStr);
}

export function setAuthUser(user: AuthUser): void {
  localStorage.setItem("user", JSON.stringify(user));
}

export function clearAuthUser(): void {
  localStorage.removeItem("user");
}

export function isWorker(user: AuthUser | null): boolean {
  return user?.role === "worker" || user?.role === "admin";
}

export function isAdmin(user: AuthUser | null): boolean {
  return user?.role === "admin";
}
