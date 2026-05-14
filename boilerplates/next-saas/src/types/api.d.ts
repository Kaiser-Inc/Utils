export interface ApiUser {
  id: string;
  username: string;
  email: string;
  role: "user" | "admin";
  createdAt: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: "bearer";
}

export interface ApiError {
  error: string;
}

export interface HealthResponse {
  status: "ok";
  timestamp: string;
}
