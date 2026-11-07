jest.mock("next/navigation", () => {
  const { redirect } =
    require("@/test/redirect") as typeof import("@/test/redirect");
  return { redirect };
});

jest.mock("next/headers", () => {
  const { cookies } =
    require("@/test/cookies") as typeof import("@/test/cookies");
  return { cookies };
});
