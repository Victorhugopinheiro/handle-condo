import { loginAction } from "@/app/(painel)/login/_actions/login";
import { ensureStaffProfile } from "@/lib/data/staff";
import { createServerSupabase } from "@/lib/supabase/server";
import { expectRedirect } from "@/test/redirect";

jest.mock("@/lib/env", () => ({
  getSupabaseConfigError: jest.fn(() => null),
}));

jest.mock("@/lib/supabase/server", () => ({
  createServerSupabase: jest.fn(),
}));

jest.mock("@/lib/data/staff", () => ({
  ensureStaffProfile: jest.fn(),
}));

const INVALID_MESSAGE =
  "E-mail ou senha incorretos. Use exatamente o e-mail do Auth (ex.: victor@victor.com).";

function mockAuth() {
  const signInWithPassword = jest.fn();
  const signOut = jest.fn().mockResolvedValue({ error: null });
  jest.mocked(createServerSupabase).mockResolvedValue({
    auth: { signInWithPassword, signOut },
  } as never);
  return { signInWithPassword, signOut };
}

const credentials = {
  email: "victor@victor.com",
  password: "senha-valida",
};

describe("login do funcionário", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("entra na área administrativa com credenciais válidas", async () => {
    const { signInWithPassword, signOut } = mockAuth();
    signInWithPassword.mockResolvedValue({
      data: {
        user: {
          id: "staff-1",
          email: credentials.email,
          user_metadata: { name: "Victor" },
        },
      },
      error: null,
    });
    jest.mocked(ensureStaffProfile).mockResolvedValue({
      id: "staff-1",
      name: "Victor",
      email: credentials.email,
      role: "sindico",
      createdAt: new Date("2024-01-01T00:00:00.000Z"),
    });

    await expectRedirect(
      () => loginAction(credentials),
      "/dashboard/ocorrencias"
    );
    expect(signOut).not.toHaveBeenCalled();
    expect(ensureStaffProfile).toHaveBeenCalledWith({
      id: "staff-1",
      email: credentials.email,
      name: "Victor",
    });
  });

  it.each(["Invalid login credentials", "Invalid credentials"])(
    "recusa %s sem revelar se o e-mail existe e sem criar perfil",
    async (message) => {
      const { signInWithPassword, signOut } = mockAuth();
      signInWithPassword.mockResolvedValue({
        data: { user: null },
        error: { message },
      });

      await expect(
        loginAction({ email: "sumido@condo.com", password: "errada" })
      ).resolves.toEqual({ success: false, message: INVALID_MESSAGE });
      expect(ensureStaffProfile).not.toHaveBeenCalled();
      expect(signOut).not.toHaveBeenCalled();
    }
  );

  it("não autentica e-mail de morador e não cria staff_profiles", async () => {
    const { signInWithPassword } = mockAuth();
    signInWithPassword.mockResolvedValue({
      data: { user: null },
      error: { message: "Invalid login credentials" },
    });

    const result = await loginAction({
      email: "morador@condo.com",
      password: "qualquer",
    });

    expect(result.success).toBe(false);
    expect(ensureStaffProfile).not.toHaveBeenCalled();
  });

  it("encerra a sessão quando o perfil não é encontrado", async () => {
    const { signInWithPassword, signOut } = mockAuth();
    signInWithPassword.mockResolvedValue({
      data: {
        user: { id: "staff-1", email: credentials.email, user_metadata: {} },
      },
      error: null,
    });
    jest.mocked(ensureStaffProfile).mockResolvedValue(null);

    const result = await loginAction(credentials);

    expect(result.success).toBe(false);
    expect(signOut).toHaveBeenCalledTimes(1);
  });

  it("encerra a sessão quando a leitura do perfil falha", async () => {
    const { signInWithPassword, signOut } = mockAuth();
    signInWithPassword.mockResolvedValue({
      data: {
        user: { id: "staff-1", email: credentials.email, user_metadata: {} },
      },
      error: null,
    });
    jest.mocked(ensureStaffProfile).mockRejectedValue(new Error("db down"));

    const result = await loginAction(credentials);

    expect(result.success).toBe(false);
    expect(result.message).toContain("staff_profiles");
    expect(signOut).toHaveBeenCalledTimes(1);
  });
});
