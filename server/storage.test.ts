
import { describe, it, expect, beforeEach } from "vitest";
import { MemStorage } from "./storage";

describe("MemStorage", () => {
  let storage: MemStorage;

  beforeEach(() => {
    storage = new MemStorage();
  });

  it("should create a user", async () => {
    const user = { username: "testuser", password: "password123" };
    const createdUser = await storage.createUser(user);
    expect(createdUser).toHaveProperty("id");
    expect(createdUser.username).toBe(user.username);
  });

  it("should not allow duplicate usernames", async () => {
    const user1 = { username: "duplicate", password: "password123" };
    const user2 = { username: "duplicate", password: "password456" };

    await storage.createUser(user1);

    await expect(storage.createUser(user2)).rejects.toThrow("username already exists");
  });
});
