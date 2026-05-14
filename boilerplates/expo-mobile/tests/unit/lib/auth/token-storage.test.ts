import { getToken, setToken, removeToken } from "@/lib/auth/token-storage";

describe("token-storage", () => {
  beforeEach(async () => {
    await removeToken();
  });

  it("returns null when no token stored", async () => {
    expect(await getToken()).toBeNull();
  });

  it("stores and retrieves token", async () => {
    await setToken("mytoken");
    expect(await getToken()).toBe("mytoken");
  });

  it("removes token", async () => {
    await setToken("mytoken");
    await removeToken();
    expect(await getToken()).toBeNull();
  });

  it("overwrites existing token", async () => {
    await setToken("first");
    await setToken("second");
    expect(await getToken()).toBe("second");
  });
});
