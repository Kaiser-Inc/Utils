import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

// Mock useUser hook
vi.mock("@/hooks/use-user", () => ({
  useUser: vi.fn(),
}));

// Mock @kaiserinc/react Avatar
vi.mock("@kaiserinc/react", () => ({
  Avatar: ({ fallback }: { fallback: string }) => <span data-testid="avatar" aria-label="avatar">{fallback}</span>,
}));

// Mock next/link
vi.mock("next/link", () => ({
  default: ({ href, children, onClick }: { href: string; children: React.ReactNode; onClick?: () => void }) => (
    <a href={href} onClick={onClick}>
      {children}
    </a>
  ),
}));

// Mock lucide-react icons
vi.mock("lucide-react", () => ({
  ChevronDown: () => <svg data-testid="chevron-down" />,
  LogOut: () => <svg data-testid="logout-icon" />,
  Settings: () => <svg data-testid="settings-icon" />,
}));

import { signOut } from "next-auth/react";
import { useUser } from "@/hooks/use-user";
import { UserMenu } from "@/components/layout/user-menu";

const mockSignOut = vi.mocked(signOut);

const mockUseUser = vi.mocked(useUser);

const mockUser = {
  id: "1",
  username: "testuser",
  email: "test@example.com",
  role: "user" as const,
  createdAt: "2024-01-01",
  accessToken: "mock-access-token",
};

describe("UserMenu", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders null when user is not logged in", () => {
    mockUseUser.mockReturnValue({
      user: null,
      accessToken: null,
      isLoading: false,
      isAuthenticated: false,
    });
    const { container } = render(<UserMenu />);
    expect(container.firstChild).toBeNull();
  });

  it("renders user display name when authenticated", () => {
    mockUseUser.mockReturnValue({
      user: mockUser,
      accessToken: "tok",
      isLoading: false,
      isAuthenticated: true,
    });
    render(<UserMenu />);
    // username appears in avatar fallback + display span
    const els = screen.getAllByText("testuser");
    expect(els.length).toBeGreaterThanOrEqual(1);
  });

  it("falls back to email when username is missing", () => {
    mockUseUser.mockReturnValue({
      user: { ...mockUser, username: undefined as unknown as string },
      accessToken: "tok",
      isLoading: false,
      isAuthenticated: true,
    });
    render(<UserMenu />);
    // email appears in both avatar fallback and display span — use getAllByText
    const els = screen.getAllByText("test@example.com");
    expect(els.length).toBeGreaterThanOrEqual(1);
  });

  it("dropdown is closed by default", () => {
    mockUseUser.mockReturnValue({
      user: mockUser,
      accessToken: "tok",
      isLoading: false,
      isAuthenticated: true,
    });
    render(<UserMenu />);
    expect(screen.queryByText("Configurações")).not.toBeInTheDocument();
  });

  it("opens dropdown when button is clicked", () => {
    mockUseUser.mockReturnValue({
      user: mockUser,
      accessToken: "tok",
      isLoading: false,
      isAuthenticated: true,
    });
    render(<UserMenu />);
    const button = screen.getByRole("button", { name: /testuser/i });
    fireEvent.click(button);
    expect(screen.getByText("Configurações")).toBeInTheDocument();
  });

  it("shows sign out button when dropdown is open", () => {
    mockUseUser.mockReturnValue({
      user: mockUser,
      accessToken: "tok",
      isLoading: false,
      isAuthenticated: true,
    });
    render(<UserMenu />);
    const button = screen.getByRole("button", { name: /testuser/i });
    fireEvent.click(button);
    expect(screen.getByText("Sair")).toBeInTheDocument();
  });

  it("shows settings link pointing to /settings", () => {
    mockUseUser.mockReturnValue({
      user: mockUser,
      accessToken: "tok",
      isLoading: false,
      isAuthenticated: true,
    });
    render(<UserMenu />);
    const toggleButton = screen.getByRole("button", { name: /testuser/i });
    fireEvent.click(toggleButton);
    const settingsLink = screen.getByText("Configurações").closest("a");
    expect(settingsLink).toHaveAttribute("href", "/settings");
  });

  it("closes dropdown when clicking settings link", () => {
    mockUseUser.mockReturnValue({
      user: mockUser,
      accessToken: "tok",
      isLoading: false,
      isAuthenticated: true,
    });
    render(<UserMenu />);
    const toggleButton = screen.getByRole("button", { name: /testuser/i });
    fireEvent.click(toggleButton);
    const settingsLink = screen.getByText("Configurações");
    fireEvent.click(settingsLink);
    expect(screen.queryByText("Configurações")).not.toBeInTheDocument();
  });

  it("calls signOut when logout button is clicked", () => {
    mockUseUser.mockReturnValue({
      user: mockUser,
      accessToken: "tok",
      isLoading: false,
      isAuthenticated: true,
    });
    render(<UserMenu />);
    const toggleButton = screen.getByRole("button", { name: /testuser/i });
    fireEvent.click(toggleButton);
    const logoutButton = screen.getByText("Sair").closest("button") as HTMLElement;
    fireEvent.click(logoutButton);
    expect(mockSignOut).toHaveBeenCalledWith({ callbackUrl: "/login" });
  });

  it("closes dropdown on outside click", () => {
    mockUseUser.mockReturnValue({
      user: mockUser,
      accessToken: "tok",
      isLoading: false,
      isAuthenticated: true,
    });
    render(<UserMenu />);
    const toggleButton = screen.getByRole("button", { name: /testuser/i });
    fireEvent.click(toggleButton);
    expect(screen.getByText("Configurações")).toBeInTheDocument();
    // click outside
    fireEvent.mouseDown(document.body);
    expect(screen.queryByText("Configurações")).not.toBeInTheDocument();
  });

  it("renders avatar with display name as fallback", () => {
    mockUseUser.mockReturnValue({
      user: mockUser,
      accessToken: "tok",
      isLoading: false,
      isAuthenticated: true,
    });
    render(<UserMenu />);
    expect(screen.getByTestId("avatar")).toBeInTheDocument();
  });
});
