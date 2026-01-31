import { authorizer } from "../src/authorizer";

describe("mock authorizer", () => {
  it("authorizes valid token", async () => {
    const result = await authorizer({
      headers: { Authorization: "Bearer validToken123" },
    });
    expect(result).toEqual({ isAuthorized: true });
  });

  it("rejects invalid token", async () => {
    const result = await authorizer({
      headers: { Authorization: "Bearer wrong" },
    });
    expect(result).toEqual({ isAuthorized: false });
  });

  it("rejects missing header", async () => {
    const result = await authorizer({ headers: {} });
    expect(result).toEqual({ isAuthorized: false });
  });
});
