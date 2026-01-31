import { AuthInput, AuthResponse } from "./types";

const MOCK_TOKEN = "mockToken123";

const isValidEmail = (email: string): boolean => email.includes("@");
const isValidPassword = (password: string): boolean => password.length >= 8;

export const validateCredentials = (input: AuthInput): AuthResponse => {
  if (isValidEmail(input.email) && isValidPassword(input.password)) {
    return { success: true, token: MOCK_TOKEN };
  }
  return {
    success: false,
    error: "Invalid email or password",
  };
};

export const handler = async (event: AuthInput): Promise<AuthResponse> => {
  return validateCredentials(event);
};
