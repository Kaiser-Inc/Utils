/** @type {import('jest').Config} */
const config = {
  preset: "jest-expo",
  testEnvironment: "node",
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": ["babel-jest", { presets: ["babel-preset-expo"] }],
  },
  transformIgnorePatterns: [
    "node_modules/(?!((jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(-google-fonts)?|react-navigation|@react-navigation|@unimodules|unimodules|sentry-expo|native-base|react-native-svg|.pnpm))",
  ],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "expo-secure-store": "<rootDir>/tests/__mocks__/expo-secure-store.ts",
    "expo-router": "<rootDir>/tests/__mocks__/expo-router.ts",
  },
  collectCoverageFrom: [
    "src/lib/**/*.{ts,tsx}",
    "src/hooks/**/*.{ts,tsx}",
    "src/stores/**/*.{ts,tsx}",
    "!src/lib/auth/auth-context.tsx",
    "!src/hooks/use-user.ts",
  ],
  coverageThreshold: {
    global: { lines: 80, functions: 80, branches: 70, statements: 80 },
  },
  testMatch: ["**/tests/unit/**/*.test.{ts,tsx}"],
};

module.exports = config;
