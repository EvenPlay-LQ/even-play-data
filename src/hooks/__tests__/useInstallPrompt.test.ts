import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useInstallPrompt } from "../useInstallPrompt";

describe("useInstallPrompt", () => {
  it("canInstall is false initially", () => {
    const { result } = renderHook(() => useInstallPrompt());
    expect(result.current.canInstall).toBe(false);
    expect(result.current.isInstalled).toBe(false);
  });

  it("detects standalone mode as installed", () => {
    // Override matchMedia to return true for standalone
    const original = window.matchMedia;
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: query === "(display-mode: standalone)",
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    const { result } = renderHook(() => useInstallPrompt());
    expect(result.current.isInstalled).toBe(true);
    expect(result.current.canInstall).toBe(false);

    window.matchMedia = original;
  });

  it("captures beforeinstallprompt and sets canInstall", () => {
    const { result } = renderHook(() => useInstallPrompt());

    const mockPromptEvent = new Event("beforeinstallprompt") as any;
    mockPromptEvent.preventDefault = vi.fn();
    mockPromptEvent.prompt = vi.fn();
    mockPromptEvent.userChoice = Promise.resolve({ outcome: "accepted" });

    act(() => {
      window.dispatchEvent(mockPromptEvent);
    });

    expect(result.current.canInstall).toBe(true);
  });

  it("promptInstall calls prompt and returns outcome", async () => {
    const { result } = renderHook(() => useInstallPrompt());

    const mockPromptEvent = new Event("beforeinstallprompt") as any;
    mockPromptEvent.preventDefault = vi.fn();
    mockPromptEvent.prompt = vi.fn();
    mockPromptEvent.userChoice = Promise.resolve({ outcome: "accepted" });

    act(() => {
      window.dispatchEvent(mockPromptEvent);
    });

    let accepted: boolean | undefined;
    await act(async () => {
      accepted = await result.current.promptInstall();
    });

    expect(mockPromptEvent.prompt).toHaveBeenCalled();
    expect(accepted).toBe(true);
    expect(result.current.canInstall).toBe(false);
  });

  it("promptInstall returns false when no prompt available", async () => {
    const { result } = renderHook(() => useInstallPrompt());

    let accepted: boolean | undefined;
    await act(async () => {
      accepted = await result.current.promptInstall();
    });

    expect(accepted).toBe(false);
  });

  it("sets isInstalled on appinstalled event", () => {
    const { result } = renderHook(() => useInstallPrompt());

    act(() => {
      window.dispatchEvent(new Event("appinstalled"));
    });

    expect(result.current.isInstalled).toBe(true);
    expect(result.current.canInstall).toBe(false);
  });
});
