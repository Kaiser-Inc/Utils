import { cn, formatDate, formatDateTime, truncate } from "@/lib/utils";

describe("cn", () => {
  it("joins class names", () => expect(cn("a", "b")).toBe("a b"));
  it("filters falsy values", () => expect(cn("a", false, undefined, null, "b")).toBe("a b"));
  it("handles empty", () => expect(cn()).toBe(""));
  it("handles single class", () => expect(cn("only")).toBe("only"));
});

describe("formatDate", () => {
  it("formats date in pt-BR", () => {
    const result = formatDate("2024-01-15T12:00:00.000Z");
    expect(result).toContain("2024");
    expect(result).toContain("15");
  });

  it("returns a non-empty string", () => {
    expect(formatDate("2024-06-01T00:00:00.000Z").length).toBeGreaterThan(0);
  });
});

describe("formatDateTime", () => {
  it("returns non-empty string", () => {
    expect(formatDateTime("2024-01-15T10:30:00.000Z")).toBeTruthy();
  });

  it("contains year", () => {
    expect(formatDateTime("2024-01-15T10:30:00.000Z")).toContain("2024");
  });
});

describe("truncate", () => {
  it("truncates long strings", () => expect(truncate("hello world", 5)).toBe("hello…"));
  it("returns short strings unchanged", () => expect(truncate("hi", 10)).toBe("hi"));
  it("returns exact length unchanged", () => expect(truncate("hello", 5)).toBe("hello"));
  it("truncates at correct position", () => expect(truncate("abcdef", 3)).toBe("abc…"));
});
