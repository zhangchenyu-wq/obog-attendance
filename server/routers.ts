import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import {
  getMembersByGeneration,
  getSeatByName,
  registerAttendance,
  getLatestAttendance,
  getAllAttendance,
} from "./db";
import { syncAttendanceToSheet } from "./googleSheets";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  members: router({
    getByGeneration: publicProcedure
      .input((val: unknown) => {
        if (typeof val === "number") return val;
        throw new Error("Expected a number");
      })
      .query(async ({ input }) => {
        return getMembersByGeneration(input);
      }),
  }),

  seats: router({
    getByName: publicProcedure
      .input((val: unknown) => {
        if (typeof val === "object" && val !== null && "name" in val && "generation" in val) {
          return { name: String((val as any).name), generation: Number((val as any).generation) };
        }
        throw new Error("Expected { name: string, generation: number }");
      })
      .query(async ({ input }) => {
        return getSeatByName(input.name, input.generation);
      }),
  }),

  attendance: router({
    register: publicProcedure
      .input((val: unknown) => {
        if (typeof val === "object" && val !== null && "name" in val && "generation" in val) {
          return {
            name: String((val as any).name),
            generation: Number((val as any).generation),
          };
        }
        throw new Error("Expected { name: string, generation: number }");
      })
      .mutation(async ({ input }) => {
        const seat = await getSeatByName(input.name, input.generation);
        if (!seat) {
          throw new Error("Seat not found");
        }
        const result = await registerAttendance(
          input.name,
          input.generation,
          seat.tableNumber,
          seat.seatPosition
        );

        // Sync to Google Sheets asynchronously (fire and forget)
        syncAttendanceToSheet(input.name, input.generation).catch((err) => {
          console.error("[Attendance] Failed to sync to Google Sheets:", err);
        });

        return {
          success: true,
          tableNumber: seat.tableNumber,
          seatPosition: seat.seatPosition,
        };
      }),

    getLatest: publicProcedure
      .input((val: unknown) => {
        const limit = typeof val === "number" ? val : 10;
        return Math.min(limit, 100);
      })
      .query(async ({ input }) => {
        return getLatestAttendance(input);
      }),

    getAll: protectedProcedure.query(async () => {
      return getAllAttendance();
    }),
  }),
});

export type AppRouter = typeof appRouter;
