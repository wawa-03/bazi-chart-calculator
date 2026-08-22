import { COOKIE_NAME } from "@shared/const";
import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { createSavedArchive, deleteSavedArchive, listSavedArchives, setUserLanguagePreference } from "./db";
import { annualMethod } from "./annualMethod";
import { getAnnualWindow } from "./annualWindow";
import { resolveRequestLocale, supportedLocales } from "./locale";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";

const archivePayloadSchema = z.object({
  input: z.object({
    datetime: z.string().min(16).max(32),
    longitude: z.number().min(73).max(136),
    latitude: z.number().min(3).max(54),
    gender: z.enum(["male", "female"]),
  }),
  profile: z.object({
    name: z.string().trim().max(24),
    birthPlace: z.string().trim().max(60),
    residence: z.string().trim().max(140),
    year: z.number().int().min(1900).max(2200),
  }),
});

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
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
  archives: router({
    list: protectedProcedure.query(({ ctx }) => listSavedArchives(ctx.user.id)),
    save: protectedProcedure.input(archivePayloadSchema).mutation(({ ctx, input }) =>
      createSavedArchive(ctx.user.id, input),
    ),
    remove: protectedProcedure.input(z.object({ id: z.number().int().positive() })).mutation(({ ctx, input }) =>
      deleteSavedArchive(ctx.user.id, input.id),
    ),
  }),
  annual: router({
    window: publicProcedure.input(z.object({ targetYear: z.number().int().min(1900).max(2200) })).query(({ input }) =>
      getAnnualWindow(input.targetYear),
    ),
    method: publicProcedure.query(() => annualMethod),
  }),
  locale: router({
    current: publicProcedure.query(({ ctx }) => resolveRequestLocale(ctx.req.headers, ctx.user?.languagePreference)),
    set: protectedProcedure.input(z.object({ locale: z.enum(supportedLocales) })).mutation(({ ctx, input }) =>
      setUserLanguagePreference(ctx.user.id, input.locale),
    ),
  }),
});

export type AppRouter = typeof appRouter;
