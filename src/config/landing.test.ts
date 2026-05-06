import { describe, it, expect } from "vitest";
import { FOOTER_LINKS } from "./landing";

describe("FOOTER_LINKS", () => {
  it("exposes explore, company, and support columns", () => {
    expect(FOOTER_LINKS.explore).toBeDefined();
    expect(FOOTER_LINKS.company).toBeDefined();
    expect(FOOTER_LINKS.support).toBeDefined();
  });

  it("every entry is a {label, href} object pointing at a real route", () => {
    const all = [
      ...FOOTER_LINKS.explore,
      ...FOOTER_LINKS.company,
      ...FOOTER_LINKS.support,
    ];
    expect(all.length).toBeGreaterThan(0);
    for (const entry of all) {
      expect(typeof entry.label).toBe("string");
      expect(entry.label.length).toBeGreaterThan(0);
      expect(typeof entry.href).toBe("string");
      expect(entry.href).not.toBe("");
      expect(entry.href).not.toBe("#");
      expect(entry.href.startsWith("/")).toBe(true);
    }
  });
});
