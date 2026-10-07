/** Panel foydalanuvchisi — qubnix foydalanuvchilaridan alohida akkaunt (alohida auth). */
export type AdminRole = "admin" | "marketing" | "analyst";

export interface AdminUser {
  id: number;
  login: string;
  fullName: string;
  role: AdminRole;
}

export interface LoginRequest {
  login: string;
  password: string;
}

export interface LoginResponse {
  /** Har so'rovga `Authorization: Bearer` bo'lib qo'shiladi (interceptors.ts). */
  token: string;
  admin: AdminUser;
}
