import type { ReactNode } from "react";

export const useRouter = () => ({
  push: jest.fn(),
  replace: jest.fn(),
  back: jest.fn(),
});

export const Redirect = (_props: { href: string }) => null;

export const Tabs = (_props: { children: ReactNode }) => null;
Tabs.Screen = () => null;

export const Stack = (_props: { children: ReactNode }) => null;
Stack.Screen = () => null;
