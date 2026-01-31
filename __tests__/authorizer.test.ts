import { authorizer } from "../src/authorizer";

describe("authorizer", () => {
  it("authorizes requests with the expected bearer token", async () => {
    const result = await authorizer({
      headers: { Authorization: "Bearer validToken123" },
    });

    expect(result).toEqual({ isAuthorized: true });
  });

  it("rejects requests with an invalid token", async () => {
    const result = await authorizer({
      headers: { Authorization: "Bearer wrongToken" },
    });

    expect(result).toEqual({ isAuthorized: false });
  });

  it("rejects requests without an authorization header", async () => {
    const result = await authorizer({});

    expect(result).toEqual({ isAuthorized: false });
  });
});
