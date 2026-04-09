import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useNetworkStatus } from "../useNetworkStatus";

describe("useNetworkStatus", () => {
  beforeEach(() => {
    Object.defineProperty(navigator, "onLine", {
      writable: true,
      value: true,
    });
  });

  it("returns online when navigator.onLine is true", () => {
    const { result } = renderHook(() => useNetworkStatus());
    expect(result.current.isOnline).toBe(true);
    expect(result.current.wasOffline).toBe(false);
  });

  it("returns offline when navigator.onLine is false", () => {
    Object.defineProperty(navigator, "onLine", { value: false });
    const { result } = renderHook(() => useNetworkStatus());
    expect(result.current.isOnline).toBe(false);
  });

  it("updates when offline event fires", () => {
    const { result } = renderHook(() => useNetworkStatus());
    expect(result.current.isOnline).toBe(true);

    act(() => {
      Object.defineProperty(navigator, "onLine", { value: false });
      window.dispatchEvent(new Event("offline"));
    });

    expect(result.current.isOnline).toBe(false);
    expect(result.current.wasOffline).toBe(true);
  });

  it("updates when online event fires", () => {
    Object.defineProperty(navigator, "onLine", { value: false });
    const { result } = renderHook(() => useNetworkStatus());

    act(() => {
      Object.defineProperty(navigator, "onLine", { value: true });
      window.dispatchEvent(new Event("online"));
    });

    expect(result.current.isOnline).toBe(true);
  });

  it("preserves wasOffline after coming back online", () => {
    const { result } = renderHook(() => useNetworkStatus());

    act(() => {
      Object.defineProperty(navigator, "onLine", { value: false });
      window.dispatchEvent(new Event("offline"));
    });
    expect(result.current.wasOffline).toBe(true);

    act(() => {
      Object.defineProperty(navigator, "onLine", { value: true });
      window.dispatchEvent(new Event("online"));
    });
    expect(result.current.wasOffline).toBe(true);
  });

  it("clearWasOffline resets the flag", () => {
    const { result } = renderHook(() => useNetworkStatus());

    act(() => {
      Object.defineProperty(navigator, "onLine", { value: false });
      window.dispatchEvent(new Event("offline"));
    });
    expect(result.current.wasOffline).toBe(true);

    act(() => {
      result.current.clearWasOffline();
    });
    expect(result.current.wasOffline).toBe(false);
  });

  it("reads effectiveType from navigator.connection", () => {
    const connection = {
      effectiveType: "4g",
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };
    Object.defineProperty(navigator, "connection", {
      value: connection,
      configurable: true,
    });

    const { result } = renderHook(() => useNetworkStatus());
    expect(result.current.effectiveType).toBe("4g");

    // Cleanup
    Object.defineProperty(navigator, "connection", {
      value: undefined,
      configurable: true,
    });
  });
});
