import { COOKIE_NAME } from "../shared/const.js";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { getMockCustomerProfile, getNextBestAction, createCustomerEvent } from "../lib/customer-intelligence";
import { z } from "zod";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  customerIntelligence: router({
    profile: publicProcedure.input(z.object({ scenario: z.string().optional() })).query(({ input }) => getMockCustomerProfile(input.scenario)),
    nextBestAction: publicProcedure.input(z.object({ scenario: z.string().optional() })).query(({ input }) => getNextBestAction(getMockCustomerProfile(input.scenario))),
    recordEvent: publicProcedure.input(z.object({ customerId: z.string(), eventType: z.string(), metadata: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).optional() })).mutation(({ input }) => createCustomerEvent(input.customerId, input.eventType as Parameters<typeof createCustomerEvent>[1], input.metadata ?? {})),
  }),
});

export type AppRouter = typeof appRouter;
