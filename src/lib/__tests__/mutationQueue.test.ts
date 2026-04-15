import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock supabase before importing the module under test
const mockFrom = vi.fn();
const mockGetSession = vi.fn().mockResolvedValue({
  data: { session: { access_token: "test" } },
});
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: (...args: any[]) => mockFrom(...args),
    auth: { getSession: () => mockGetSession() },
  },
}));

import {
  enqueueMutation,
  getPendingCount,
  flushMutationQueue,
} from "../mutationQueue";

const STORAGE_KEY = "ep_mutation_queue";

// Provide a working localStorage mock for this test file
const store: Record<string, string> = {};
const localStorageMock = {
  getItem: (key: string) => store[key] ?? null,
  setItem: (key: string, value: string) => { store[key] = value; },
  removeItem: (key: string) => { delete store[key]; },
  clear: () => { for (const k of Object.keys(store)) delete store[k]; },
  get length() { return Object.keys(store).length; },
  key: (i: number) => Object.keys(store)[i] ?? null,
};
Object.defineProperty(globalThis, "localStorage", { value: localStorageMock, writable: true });

describe("mutationQueue", () => {
  beforeEach(() => {
    localStorageMock.clear();
    mockFrom.mockReset();
    vi.stubGlobal("crypto", {
      randomUUID: () => "test-uuid-" + Math.random().toString(36).slice(2),
    });
  });

  it("enqueueMutation adds to localStorage", () => {
    enqueueMutation({
      table: "posts",
      operation: "insert",
      payload: { title: "Test" },
    });

    const queue = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    expect(queue).toHaveLength(1);
    expect(queue[0].table).toBe("posts");
    expect(queue[0].operation).toBe("insert");
    expect(queue[0].payload).toEqual({ title: "Test" });
    expect(queue[0].id).toBeDefined();
    expect(queue[0].timestamp).toBeDefined();
  });

  it("getPendingCount returns correct count", () => {
    expect(getPendingCount()).toBe(0);

    enqueueMutation({ table: "posts", operation: "insert", payload: {} });
    enqueueMutation({ table: "matches", operation: "update", payload: {} });

    expect(getPendingCount()).toBe(2);
  });

  it("dispatches mutation-queue-changed event on enqueue", () => {
    const handler = vi.fn();
    window.addEventListener("mutation-queue-changed", handler);

    enqueueMutation({ table: "posts", operation: "insert", payload: {} });

    expect(handler).toHaveBeenCalledTimes(1);
    window.removeEventListener("mutation-queue-changed", handler);
  });

  it("flushMutationQueue replays and removes successful mutations", async () => {
    const mockInsert = vi.fn().mockResolvedValue({ error: null });
    mockFrom.mockReturnValue({ insert: () => mockInsert() });

    enqueueMutation({ table: "posts", operation: "insert", payload: { title: "A" } });

    const result = await flushMutationQueue();
    expect(result.succeeded).toBe(1);
    expect(result.failed).toBe(0);
    expect(getPendingCount()).toBe(0);
  });

  it("flushMutationQueue keeps failed mutations in queue", async () => {
    const mockInsert = vi.fn().mockResolvedValue({ error: { message: "fail" } });
    mockFrom.mockReturnValue({ insert: () => mockInsert() });

    enqueueMutation({ table: "posts", operation: "insert", payload: { title: "A" } });

    const result = await flushMutationQueue();
    expect(result.succeeded).toBe(0);
    expect(result.failed).toBe(1);
    expect(getPendingCount()).toBe(1);
  });

  it("flushMutationQueue returns zeros on empty queue", async () => {
    const result = await flushMutationQueue();
    expect(result).toEqual({ succeeded: 0, failed: 0 });
  });

  it("handles update operation with filters", async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: null });
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq });
    mockFrom.mockReturnValue({ update: mockUpdate });

    enqueueMutation({
      table: "profiles",
      operation: "update",
      payload: { name: "New Name" },
      filter: { id: "123" },
    });

    await flushMutationQueue();
    expect(mockFrom).toHaveBeenCalledWith("profiles");
  });

  it("handles delete operation", async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: null });
    const mockDelete = vi.fn().mockReturnValue({ eq: mockEq });
    mockFrom.mockReturnValue({ delete: mockDelete });

    enqueueMutation({
      table: "posts",
      operation: "delete",
      payload: {},
      filter: { id: "456" },
    });

    await flushMutationQueue();
    expect(mockFrom).toHaveBeenCalledWith("posts");
  });
});
