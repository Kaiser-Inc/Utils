import { useUIStore } from "@/stores/ui-store";

describe("useUIStore", () => {
  beforeEach(() => {
    useUIStore.setState({ theme: "light" });
  });

  it("initial theme is light", () => {
    const { theme } = useUIStore.getState();
    expect(theme).toBe("light");
  });

  it("setTheme changes theme", () => {
    useUIStore.getState().setTheme("dark");
    expect(useUIStore.getState().theme).toBe("dark");
  });

  it("toggleTheme switches from light to dark", () => {
    useUIStore.getState().toggleTheme();
    expect(useUIStore.getState().theme).toBe("dark");
  });

  it("toggleTheme switches from dark to light", () => {
    useUIStore.setState({ theme: "dark" });
    useUIStore.getState().toggleTheme();
    expect(useUIStore.getState().theme).toBe("light");
  });

  it("setTheme to light", () => {
    useUIStore.setState({ theme: "dark" });
    useUIStore.getState().setTheme("light");
    expect(useUIStore.getState().theme).toBe("light");
  });
});
