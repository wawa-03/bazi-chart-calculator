import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

const dbMocks = vi.hoisted(() => ({
  createConsultationRequest: vi.fn(),
  createSavedArchive: vi.fn(),
  deleteConsultationRequest: vi.fn(),
  deleteSavedArchive: vi.fn(),
  deleteThemeNote: vi.fn(),
  listAllConsultationRequests: vi.fn(),
  listAllThemeNotes: vi.fn(),
  listConsultationRequests: vi.fn(),
  listSavedArchives: vi.fn(),
  listThemeNotes: vi.fn(),
  saveThemeNote: vi.fn(),
  setUserLanguagePreference: vi.fn(),
  updateConsultationRequestStatus: vi.fn(),
}));

vi.mock("./db", () => dbMocks);
vi.mock("./_core/notification", () => ({ notifyOwner: vi.fn().mockResolvedValue(true) }));

import { appRouter } from "./routers";

function contextFor(userId: number, headers: Record<string, string> = {}): TrpcContext {
  return {
    user: {
      id: userId,
      openId: `user-${userId}`,
      email: null,
      name: "测试用户",
      loginMethod: "manus",
      languagePreference: null,
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { headers } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

const payload = {
  input: { datetime: "1990-01-27T00:00", longitude: 116.4074, latitude: 39.9042, gender: "male" as const },
  profile: { name: "王二小", birthPlace: "北京市", residence: "测试地址", year: 2026 },
};

describe("archives router", () => {
  beforeEach(() => vi.clearAllMocks());

  it("always scopes list and save operations to the authenticated user", async () => {
    dbMocks.listSavedArchives.mockResolvedValue([]);
    dbMocks.createSavedArchive.mockResolvedValue({ id: 3 });
    const caller = appRouter.createCaller(contextFor(42));

    await caller.archives.list();
    await caller.archives.save(payload);

    expect(dbMocks.listSavedArchives).toHaveBeenCalledWith(42);
    expect(dbMocks.createSavedArchive).toHaveBeenCalledWith(42, payload);
  });

  it("passes the authenticated owner id when deleting an archive", async () => {
    dbMocks.deleteSavedArchive.mockResolvedValue({ deleted: true });
    const caller = appRouter.createCaller(contextFor(42));
    await caller.archives.remove({ id: 7 });
    expect(dbMocks.deleteSavedArchive).toHaveBeenCalledWith(42, 7);
  });

  it("scopes theme-note save, list, and removal to the authenticated archive owner", async () => {
    dbMocks.listAllThemeNotes.mockResolvedValue([]);
    dbMocks.listThemeNotes.mockResolvedValue([]);
    dbMocks.saveThemeNote.mockResolvedValue({ id: 1, content: "本周回顾" });
    dbMocks.deleteThemeNote.mockResolvedValue({ deleted: true });
    const caller = appRouter.createCaller(contextFor(42));

    await caller.themeNotes.listAll();
    await caller.themeNotes.list({ archiveId: 7 });
    await caller.themeNotes.save({ archiveId: 7, themeKey: "career", content: "本周回顾" });
    await caller.themeNotes.remove({ archiveId: 7, themeKey: "career" });

    expect(dbMocks.listAllThemeNotes).toHaveBeenCalledWith(42);
    expect(dbMocks.listThemeNotes).toHaveBeenCalledWith(42, 7);
    expect(dbMocks.saveThemeNote).toHaveBeenCalledWith(42, 7, "career", "本周回顾");
    expect(dbMocks.deleteThemeNote).toHaveBeenCalledWith(42, 7, "career");
  });

  it("keeps consultation applications scoped to the authenticated user", async () => {
    dbMocks.listConsultationRequests.mockResolvedValue([]);
    dbMocks.createConsultationRequest.mockResolvedValue({ id: 12, service: "collaboration" });
    dbMocks.deleteConsultationRequest.mockResolvedValue({ deleted: true });
    const caller = appRouter.createCaller(contextFor(42));
    const payload = {
      service: "collaboration" as const,
      contactMethod: "wechat" as const,
      contactDetail: "guanli-contact",
      request: "希望深入讨论年度阅读中的事业与关系主题。",
    };

    await caller.consultations.list();
    await caller.consultations.submit(payload);
    await caller.consultations.remove({ id: 12 });

    expect(dbMocks.listConsultationRequests).toHaveBeenCalledWith(42);
    expect(dbMocks.createConsultationRequest).toHaveBeenCalledWith(42, payload);
    expect(dbMocks.deleteConsultationRequest).toHaveBeenCalledWith(42, 12);
  });

  it("only allows an administrator to advance a consultation request status", async () => {
    dbMocks.updateConsultationRequestStatus.mockResolvedValue({ id: 12, status: "scheduled" });
    const userCaller = appRouter.createCaller(contextFor(42));
    await expect(userCaller.consultations.adminUpdateStatus({ id: 12, status: "scheduled" })).rejects.toThrow();

    const adminContext = contextFor(1);
    adminContext.user!.role = "admin";
    const adminCaller = appRouter.createCaller(adminContext);
    await adminCaller.consultations.adminUpdateStatus({ id: 12, status: "scheduled" });
    expect(dbMocks.updateConsultationRequestStatus).toHaveBeenCalledWith(12, "scheduled");
  });

  it("uses edge country for a display default and persists only an explicit language override", async () => {
    dbMocks.setUserLanguagePreference.mockResolvedValue({ locale: "en" });
    const caller = appRouter.createCaller(contextFor(42, { "cf-ipcountry": "TW", "x-forwarded-for": "203.0.113.9" }));

    expect(await caller.locale.current()).toEqual({ locale: "zh-TW", source: "edge-country" });
    await caller.locale.set({ locale: "en" });

    expect(dbMocks.setUserLanguagePreference).toHaveBeenCalledWith(42, "en");
  });
});
