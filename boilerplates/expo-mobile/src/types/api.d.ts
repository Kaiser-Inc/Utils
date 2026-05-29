export interface ApiUser {
  id: string;
  username: string;
  email: string;
  role: "user" | "admin";
  created_at: string;
  updated_at: string;
}

export interface LoginResponse {
  access_token: string;
}
