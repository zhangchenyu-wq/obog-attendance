import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock context for public procedures
function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("Attendance System", () => {
  let caller: ReturnType<typeof appRouter.createCaller>;

  beforeAll(() => {
    const ctx = createPublicContext();
    caller = appRouter.createCaller(ctx);
  });

  describe("members.getByGeneration", () => {
    it("should return members for generation 27", async () => {
      const members = await caller.members.getByGeneration(27);
      expect(Array.isArray(members)).toBe(true);
      expect(members.length).toBeGreaterThan(0);
      expect(members[0]).toHaveProperty("name");
      expect(members[0]).toHaveProperty("generation", 27);
    });

    it("should return members for generation 35", async () => {
      const members = await caller.members.getByGeneration(35);
      expect(Array.isArray(members)).toBe(true);
      expect(members.length).toBeGreaterThan(0);
      expect(members.every((m) => m.generation === 35)).toBe(true);
    });

    it("should return empty array for non-existent generation", async () => {
      const members = await caller.members.getByGeneration(99);
      expect(Array.isArray(members)).toBe(true);
      expect(members.length).toBe(0);
    });
  });

  describe("seats.getByName", () => {
    it("should return seat for valid name and generation", async () => {
      const seat = await caller.seats.getByName({
        name: "荘茗",
        generation: 27,
      });
      expect(seat).toBeDefined();
      expect(seat?.name).toBe("荘茗");
      expect(seat?.generation).toBe(27);
      expect(seat?.tableNumber).toBe("1");
      expect(seat?.seatPosition).toBe(1);
    });

    it("should return undefined for non-existent name", async () => {
      const seat = await caller.seats.getByName({
        name: "存在しない名前",
        generation: 27,
      });
      expect(seat).toBeUndefined();
    });

    it("should return seat for different generation", async () => {
      const seat = await caller.seats.getByName({
        name: "東一成",
        generation: 28,
      });
      expect(seat).toBeDefined();
      expect(seat?.generation).toBe(28);
      expect(seat?.tableNumber).toBe("3");
    });
  });

  describe("attendance.register", () => {
    it("should register attendance successfully", async () => {
      const result = await caller.attendance.register({
        name: "吉積夏帆",
        generation: 27,
      });
      expect(result.success).toBe(true);
      expect(result.tableNumber).toBe("1");
      expect(result.seatPosition).toBe(2);
    });

    it("should fail for non-existent member", async () => {
      try {
        await caller.attendance.register({
          name: "存在しない人",
          generation: 27,
        });
        expect.fail("Should have thrown an error");
      } catch (error: any) {
        expect(error.message).toContain("Seat not found");
      }
    });

    it("should register multiple people from same generation", async () => {
      const result1 = await caller.attendance.register({
        name: "嶋森一司",
        generation: 27,
      });
      const result2 = await caller.attendance.register({
        name: "根岸佳希",
        generation: 27,
      });
      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
      expect(result1.tableNumber).toBe("1");
      expect(result2.tableNumber).toBe("1");
    });
  });

  describe("attendance.getLatest", () => {
    it("should return latest attendance records", async () => {
      const records = await caller.attendance.getLatest(5);
      expect(Array.isArray(records)).toBe(true);
      expect(records.length).toBeLessThanOrEqual(5);
      if (records.length > 0) {
        expect(records[0]).toHaveProperty("name");
        expect(records[0]).toHaveProperty("generation");
        expect(records[0]).toHaveProperty("tableNumber");
        expect(records[0]).toHaveProperty("seatPosition");
      }
    });

    it("should respect limit parameter", async () => {
      const records = await caller.attendance.getLatest(3);
      expect(records.length).toBeLessThanOrEqual(3);
    });

    it("should cap limit at 100", async () => {
      const records = await caller.attendance.getLatest(1000);
      expect(records.length).toBeLessThanOrEqual(100);
    });
  });
});
