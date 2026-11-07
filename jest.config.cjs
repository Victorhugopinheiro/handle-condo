/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: "node",
  testMatch: ["<rootDir>/src/**/*.test.ts"],
  setupFiles: ["<rootDir>/src/test/jest.setup.ts"],
  setupFilesAfterEnv: ["<rootDir>/src/test/jest.after-env.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        diagnostics: false,
        tsconfig: {
          target: "ES2022",
          module: "commonjs",
          moduleResolution: "node",
          esModuleInterop: true,
          strict: true,
          jsx: "react-jsx",
          isolatedModules: true,
          types: ["jest", "node"],
        },
      },
    ],
    "^.+\\.js$": [
      "ts-jest",
      {
        diagnostics: false,
        tsconfig: {
          allowJs: true,
          target: "ES2022",
          module: "commonjs",
          moduleResolution: "node",
          esModuleInterop: true,
          isolatedModules: true,
        },
      },
    ],
  },
  transformIgnorePatterns: ["/node_modules/(?!(jose)/)"],
};
