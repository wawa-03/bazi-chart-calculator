import { COOKIE_NAME } from "@shared/const";
import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { createConsultationRequest, createSavedArchive, deleteConsultationRequest, deleteSavedArchive, deleteThemeNote, listAllConsultationRequests, listAllThemeNotes, listConsultationRequests, listSavedArchives, listThemeNotes, saveThemeNote, setUserLanguagePreference, updateConsultationRequestStatus } from "./db";
import { annualMethod } from "./annualMethod";
import { getAnnualWindow } from "./annualWindow";
import { resolveRequestLocale, supportedLocales } from "./locale";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { notifyOwner } from "./_core/notification";
import { makeRequest } from "./_core/map";

const archivePayloadSchema = z.object({
  input: z.object({
    datetime: z.string().min(16).max(32),
    longitude: z.number().min(-180).max(180),
    latitude: z.number().min(-90).max(90),
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
  themeNotes: router({
    listAll: protectedProcedure.query(({ ctx }) => listAllThemeNotes(ctx.user.id)),
    list: protectedProcedure.input(z.object({ archiveId: z.number().int().positive() })).query(({ ctx, input }) =>
      listThemeNotes(ctx.user.id, input.archiveId),
    ),
    save: protectedProcedure.input(z.object({
      archiveId: z.number().int().positive(),
      themeKey: z.enum(["relationship", "career", "finance", "rhythm"]),
      content: z.string().trim().min(1).max(2000),
    })).mutation(({ ctx, input }) => saveThemeNote(ctx.user.id, input.archiveId, input.themeKey, input.content)),
    remove: protectedProcedure.input(z.object({
      archiveId: z.number().int().positive(),
      themeKey: z.enum(["relationship", "career", "finance", "rhythm"]),
    })).mutation(({ ctx, input }) => deleteThemeNote(ctx.user.id, input.archiveId, input.themeKey)),
  }),
  consultations: router({
    list: protectedProcedure.query(({ ctx }) => listConsultationRequests(ctx.user.id)),
    submit: protectedProcedure.input(z.object({
      service: z.enum(["theme_report", "annual_manual", "deep_reading", "collaboration"]),
      archiveId: z.number().int().positive().optional(),
      contactMethod: z.enum(["account_email", "wechat", "other"]),
      contactDetail: z.string().trim().min(2).max(180),
      request: z.string().trim().min(10).max(1000),
    })).mutation(async ({ ctx, input }) => {
      const request = await createConsultationRequest(ctx.user.id, input);
      void notifyOwner({
        title: "观历：新的人工深度解读申请",
        content: `申请编号 ${request?.id ?? "待确认"}；服务类型 ${input.service}。请在账户中心的咨询申请中查看详情。`,
      }).catch(() => undefined);
      return request;
    }),
    remove: protectedProcedure.input(z.object({ id: z.number().int().positive() })).mutation(({ ctx, input }) =>
      deleteConsultationRequest(ctx.user.id, input.id),
    ),
    adminList: adminProcedure.query(() => listAllConsultationRequests()),
    adminUpdateStatus: adminProcedure.input(z.object({
      id: z.number().int().positive(),
      status: z.enum(["pending", "reviewing", "contacted", "scheduled", "closed"]),
    })).mutation(({ input }) => updateConsultationRequestStatus(input.id, input.status)),
  }),
  annual: router({
    window: publicProcedure.input(z.object({ targetYear: z.number().int().min(1900).max(2200) })).query(({ input }) =>
      getAnnualWindow(input.targetYear),
    ),
    method: publicProcedure.query(() => annualMethod),
  }),
  places: router({
    autocomplete: publicProcedure.input(z.object({ query: z.string().trim().min(2).max(100) })).query(async ({ input }) => {
      const response = await makeRequest<{ predictions?: Array<{ place_id: string; structured_formatting?: { main_text?: string; secondary_text?: string }; description: string }> }>(
        "/maps/api/place/autocomplete/json",
        { input: input.query, types: "(cities)" },
      );
      return (response.predictions || []).slice(0, 5).map((prediction) => ({
        placeId: prediction.place_id,
        primaryText: prediction.structured_formatting?.main_text || prediction.description,
        secondaryText: prediction.structured_formatting?.secondary_text || "Location",
      }));
    }),
    details: publicProcedure.input(z.object({ placeId: z.string().trim().min(1).max(300), fallbackName: z.string().trim().min(1).max(160), fallbackAddress: z.string().trim().max(300) })).mutation(async ({ input }) => {
      const response = await makeRequest<{ result?: { name?: string; formatted_address?: string; address_components?: Array<{ long_name: string; types: string[] }>; geometry?: { location?: { lat: number; lng: number } } } }>(
        "/maps/api/place/details/json",
        { place_id: input.placeId, fields: "name,formatted_address,address_component,geometry" },
      );
      const result = response.result;
      const point = result?.geometry?.location;
      if (!point || !Number.isFinite(point.lat) || !Number.isFinite(point.lng)) return null;
      return {
        name: result.name || input.fallbackName,
        address: result.formatted_address || input.fallbackAddress,
        country: result.address_components?.find((component) => component.types.includes("country"))?.long_name || input.fallbackAddress,
        latitude: point.lat,
        longitude: point.lng,
      };
    }),
  }),
  locale: router({
    current: publicProcedure.query(({ ctx }) => resolveRequestLocale(ctx.req.headers, ctx.user?.languagePreference)),
    set: protectedProcedure.input(z.object({ locale: z.enum(supportedLocales) })).mutation(({ ctx, input }) =>
      setUserLanguagePreference(ctx.user.id, input.locale),
    ),
  }),
});

export type AppRouter = typeof appRouter;
