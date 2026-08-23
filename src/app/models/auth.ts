export interface LoginRequest {
  username: string;
  password: string;
}

export interface SignupRequest {
  username: string;
  email: string;
  password: string;
  role?: string;
}

export interface AuthResponse {
  token: string;
  username: string;
  role: string;
  message: string;
}

export interface User {
  username: string;
  role: string;
}

export interface UserProfile {
  id: number;
  username: string;
  email: string;
  role: string;
  createdAt: string;
}
