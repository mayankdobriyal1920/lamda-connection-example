import { AuthorizerEvent, AuthorizerResponse } from "./types";

const EXPECTED_TOKEN = "validToken123";

export const authorizer = async (
  event: AuthorizerEvent,
): Promise<AuthorizerResponse> => {
    const authHeader = event.headers?.Authorization || event.headers?.authorization;
    const isAuthorized = authHeader === `Bearer ${EXPECTED_TOKEN}`;
    return { isAuthorized };
};
