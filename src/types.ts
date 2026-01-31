export interface AuthInput {
  email: string;
  password: string;
}

export interface AuthSuccess {
  success: true;
  token: string;
}

export interface AuthFailure {
  success: false;
  error: string;
}

export type AuthResponse = AuthSuccess | AuthFailure;

export interface WeatherInput {
  city: string;
}

export interface WeatherSuccess {
  city: string;
  temp: number;
  conditions: string;
}

export type ErrorCode = "API_ERROR" | "VALIDATION_ERROR";

export interface StructuredError {
  error: ErrorCode;
  message: string;
}

export type WeatherOutput = WeatherSuccess | StructuredError;

export interface AuthorizerEvent {
  headers?: Record<string, string | undefined>;
}

export interface AuthorizerResponse {
  isAuthorized: boolean;
}
