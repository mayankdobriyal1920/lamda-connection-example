import { AuthFailure, AuthInput, AuthResponse, AuthSuccess } from "./types";

const MOCK_TOKEN = "mockToken123";

const isValidEmail = (email: string): boolean => email.includes("@");
const isValidPassword = (password: string): boolean => password.length >= 8;

export const validateCredentials = (input: AuthInput): AuthResponse => {
  if (isValidEmail(input.email) && isValidPassword(input.password)) {
    const success: AuthSuccess = { success: true, token: MOCK_TOKEN };
    return success;
  }
  const failure: AuthFailure = {
    success: false,
    error: "Invalid email or password",
  };
  return failure;
};

export const handler = async (event: AuthInput): Promise<AuthResponse> => {
  return validateCredentials(event);
};
