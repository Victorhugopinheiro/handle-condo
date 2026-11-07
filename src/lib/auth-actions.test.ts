import { logoutStaffAction } from "@/lib/auth-actions";
import { createServerSupabase } from "@/lib/supabase/server";
import { expectRedirect } from "@/test/redirect";

jest.mock("@/lib/supabase/server", () => ({
  createServerSupabase: jest.fn(),
}));

describe("logout do funcionário", () => {
  it("encerra a sessão e volta ao login", async () => {
    const signOut = jest.fn().mockResolvedValue({ error: null });
    jest.mocked(createServerSupabase).mockResolvedValue({
      auth: { signOut },
    } as never);

    await expectRedirect(() => logoutStaffAction(), "/login");
    expect(signOut).toHaveBeenCalledTimes(1);
  });
});
