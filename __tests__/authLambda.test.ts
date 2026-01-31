import { handler as authHandler } from "../src/authLambda";

describe("auth lambda", () => {
  it("returns success for valid credentials", async () => {
    const result = await authHandler({
      email: "user@example.com",
      password: "strongpass",
    });

    expect(result).toEqual({ success: true, token: "mockToken123" });
  });

  it("rejects invalid email", async () => {
    const result = await authHandler({
      email: "invalid-email",
      password: "strongpass",
    });

    expect(result).toEqual({
      success: false,
      error: "Invalid email or password",
    });
  });

  it("rejects short passwords", async () => {
    const result = await authHandler({
      email: "user@example.com",
      password: "short",
    });

    expect(result).toEqual({
      success: false,
      error: "Invalid email or password",
    });
  });
});
