import { afterEach, describe, expect, it, vi } from "vitest";
import { calculateBazi } from "./bazi";
import { downloadBaziPng } from "./baziExport";

const originalDocument = globalThis.document;
const originalUrl = globalThis.URL;
const originalWindow = globalThis.window;

afterEach(() => {
  Object.defineProperty(globalThis, "document", { configurable: true, value: originalDocument });
  Object.defineProperty(globalThis, "URL", { configurable: true, value: originalUrl });
  Object.defineProperty(globalThis, "window", { configurable: true, value: originalWindow });
});

describe("PNG chart export", () => {
  it("writes high-precision coordinates to the PNG canvas", async () => {
    const longitude = 116.407396123456;
    const latitude = 39.904201987654;
    const result = calculateBazi({ datetime: "1990-01-27T00:00", longitude, latitude, gender: "male" });
    const fillText = vi.fn();
    const context = {
      fillText,
      fillRect: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      stroke: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      translate: vi.fn(),
      rotate: vi.fn(),
      strokeRect: vi.fn(),
      measureText: () => ({ width: 1 }),
      fillStyle: "",
      strokeStyle: "",
      lineWidth: 0,
      globalAlpha: 1,
      font: "",
      textAlign: "left",
    } as unknown as CanvasRenderingContext2D;
    const canvas = {
      width: 0,
      height: 0,
      getContext: () => context,
      toBlob: (callback: BlobCallback) => callback(new Blob(["png"])),
    } as unknown as HTMLCanvasElement;
    const anchor = { href: "", download: "", click: vi.fn(), remove: vi.fn() };

    Object.defineProperty(globalThis, "document", { configurable: true, value: { createElement: (tag: string) => tag === "canvas" ? canvas : anchor, body: { appendChild: vi.fn() } } });
    Object.defineProperty(globalThis, "URL", { configurable: true, value: { createObjectURL: () => "blob:test", revokeObjectURL: vi.fn() } });
    Object.defineProperty(globalThis, "window", { configurable: true, value: { setTimeout: (callback: () => void) => { callback(); return 1; } } });

    await downloadBaziPng(result);

    expect(fillText).toHaveBeenCalledWith(`${longitude}° · ${latitude}°`, 1055, 329);
    expect(anchor.click).toHaveBeenCalledOnce();
  });
});
