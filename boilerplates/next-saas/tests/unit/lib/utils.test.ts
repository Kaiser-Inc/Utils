import { describe, it, expect } from "vitest";
import { cn, formatDate, formatDateTime, truncate } from "@/lib/utils";

describe("cn", () => {
  it("merges classes", () => {
    expect(cn("px-4", "py-2")).toBe("px-4 py-2");
  });

  it("handles conditional classes", () => {
    expect(cn("base", false && "skip", "keep")).toBe("base keep");
  });

  it("deduplicates tailwind classes", () => {
    expect(cn("px-4", "px-6")).toBe("px-6");
  });
});

describe("formatDate", () => {
  it("formats ISO date to pt-BR", () => {
    // Use noon UTC to avoid timezone shift issues
    const result = formatDate("2024-01-15T12:00:00.000Z", "pt-BR");
    expect(result).toContain("2024");
    expect(result).toContain("15");
  });
});

describe("formatDateTime", () => {
  it("returns a non-empty string", () => {
    const result = formatDateTime("2024-01-15T10:30:00.000Z");
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
  });
});

describe("truncate", () => {
  it("truncates long strings", () => {
    expect(truncate("hello world", 5)).toBe("hello…");
  });

  it("returns original if within limit", () => {
    expect(truncate("hi", 10)).toBe("hi");
  });

  it("truncates exactly at limit", () => {
    expect(truncate("abcde", 5)).toBe("abcde");
  });
});
