import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

const dbMocks = vi.hoisted(() => ({
  createConsultationRequest: vi.fn(),
  createSavedArchive: vi.fn(),
  deleteConsultationRequest: vi.fn(),
  deleteSavedArchive: vi.fn(),
  deleteThemeNote: vi.fn(),
  getFateReviewForOwner: vi.fn(),
  listAllConsultationRequests: vi.fn(),
  listAllThemeNotes: vi.fn(),
  listConsultationRequests: vi.fn(),
  listFateReviewRevisions: vi.fn(),
  listFateRuleVersions: vi.fn(),
  listPublishedFateRules: vi.fn(),
  listSavedArchives: vi.fn(),
  listSubmittedFateReviews: vi.fn(),
  listThemeNotes: vi.fn(),
  saveThemeNote: vi.fn(),
  setUserLanguagePreference: vi.fn(),
  updateConsultationRequestStatus: vi.fn(),
  updateFateReview: vi.fn(),
  requestFateReview: vi.fn(),
  createFateRuleDraft: vi.fn(),
  publishFateRuleVersion: vi.fn(),
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

  it("scopes a human fate-review request and result to the archive owner", async () => {
    dbMocks.getFateReviewForOwner.mockResolvedValue(null);
    dbMocks.requestFateReview.mockResolvedValue({ id: 9, reviewStatus: "pending" });
    const caller = appRouter.createCaller(contextFor(42));

    await caller.fateReviews.mine({ archiveId: 7 });
    await caller.fateReviews.request({ archiveId: 7 });

    expect(dbMocks.getFateReviewForOwner).toHaveBeenCalledWith(42, 7);
    expect(dbMocks.requestFateReview).toHaveBeenCalledWith(42, 7);
  });

  it("allows astrologers and administrators, but not ordinary users, to edit submitted reviews and rules", async () => {
    dbMocks.listSubmittedFateReviews.mockResolvedValue([]);
    dbMocks.listFateReviewRevisions.mockResolvedValue([]);
    dbMocks.listFateRuleVersions.mockResolvedValue([]);
    dbMocks.updateFateReview.mockResolvedValue({ id: 9, reviewStatus: "in_review" });
    dbMocks.createFateRuleDraft.mockResolvedValue({ id: 3, ruleKey: "special-combination" });
    const ordinary = appRouter.createCaller(contextFor(42));
    await expect(ordinary.fateReviews.reviewerList()).rejects.toThrow();
    await expect(ordinary.fateReviews.reviewerHistory({ reviewId: 9 })).rejects.toThrow();
    await expect(ordinary.fateRules.reviewerList()).rejects.toThrow();

    const astrologerContext = contextFor(8);
    astrologerContext.user!.role = "astrologer";
    const astrologer = appRouter.createCaller(astrologerContext);
    await astrologer.fateReviews.reviewerList();
    await astrologer.fateReviews.reviewerHistory({ reviewId: 9 });
    await astrologer.fateRules.reviewerList();
    await astrologer.fateReviews.reviewerSave({ id: 9, reviewStatus: "in_review", congGeVerdict: "undetermined" });
    await astrologer.fateRules.reviewerCreateDraft({ ruleKey: "special-combination", title: "特殊合化", body: "仅在月令、根气与全局条件具备时讨论化气。" });

    expect(dbMocks.listSubmittedFateReviews).toHaveBeenCalledOnce();
    expect(dbMocks.listFateReviewRevisions).toHaveBeenCalledWith(9);
    expect(dbMocks.listFateRuleVersions).toHaveBeenCalledOnce();
    expect(dbMocks.updateFateReview).toHaveBeenCalledWith(8, expect.objectContaining({ id: 9, reviewStatus: "in_review" }));
    expect(dbMocks.createFateRuleDraft).toHaveBeenCalledWith(8, expect.objectContaining({ ruleKey: "special-combination" }));
  });

  it("exposes only published rule copy to the public reading surface", async () => {
    dbMocks.listPublishedFateRules.mockResolvedValue([{ id: 4, ruleKey: "special-combination", version: 2, status: "published" }]);
    const caller = appRouter.createCaller({ user: null, req: { headers: {} } as TrpcContext["req"], res: {} as TrpcContext["res"] });

    await expect(caller.fateRules.published()).resolves.toEqual([{ id: 4, ruleKey: "special-combination", version: 2, status: "published" }]);
    expect(dbMocks.listPublishedFateRules).toHaveBeenCalledOnce();
  });

  it("uses edge country for a display default and persists only an explicit language override", async () => {
    dbMocks.setUserLanguagePreference.mockResolvedValue({ locale: "en" });
    const caller = appRouter.createCaller(contextFor(42, { "cf-ipcountry": "TW", "x-forwarded-for": "203.0.113.9" }));

    expect(await caller.locale.current()).toEqual({ locale: "zh-TW", source: "edge-country" });
    await caller.locale.set({ locale: "en" });

    expect(dbMocks.setUserLanguagePreference).toHaveBeenCalledWith(42, "en");
  });
});
