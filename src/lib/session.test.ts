import { RESIDENT_COOKIE } from "@/lib/constants";
import { getResidentById } from "@/lib/data/residents";
import { getStaffById } from "@/lib/data/staff";
import { signResidentToken } from "@/lib/resident-token";
import {
  getStaffSession,
  requireResident,
  requireResidentOrRedirectHome,
  requireStaff,
  requireStaffOrRedirectHome,
} from "@/lib/session";
import { createServerSupabase } from "@/lib/supabase/server";
import { cookies } from "@/test/cookies";
import { expectRedirect } from "@/test/redirect";

jest.mock("next/server", () => ({
  connection: async () => {},
}));

jest.mock("@/lib/supabase/server", () => ({
  createServerSupabase: jest.fn(),
}));

jest.mock("@/lib/data/staff", () => ({
  getStaffById: jest.fn(),
}));

jest.mock("@/lib/data/residents", () => ({
  getResidentById: jest.fn(),
}));

const staffRow = {
  id: "staff-1",
  name: "Victor",
  email: "victor@victor.com",
  role: "sindico" as const,
  createdAt: new Date("2024-01-01T00:00:00.000Z"),
};

function mockClaims(sub?: string) {
  jest.mocked(createServerSupabase).mockResolvedValue({
    auth: {
      getClaims: async () => ({
        data: { claims: sub ? { sub } : {} },
      }),
    },
  } as never);
}

describe("sessão", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("sem claim exige login de novo", async () => {
    mockClaims();

    await expectRedirect(() => requireStaff(), "/login");
  });

  it("dashboard sem perfil não abre e volta ao login", async () => {
    mockClaims("staff-1");
    jest.mocked(getStaffById).mockResolvedValue(null);

    await expect(getStaffSession()).resolves.toBeNull();
    await expectRedirect(() => requireStaff(), "/login");
  });

  it("funcionário com perfil que abre o login vai para ocorrências", async () => {
    mockClaims(staffRow.id);
    jest.mocked(getStaffById).mockResolvedValue(staffRow);

    await expectRedirect(
      () => requireStaffOrRedirectHome(),
      "/dashboard/ocorrencias"
    );
  });

  it("morador removido não autoriza ocorrências", async () => {
    const token = await signResidentToken({
      residentId: 9,
      email: "apagado@condo.com",
    });
    const store = await cookies();
    store.set(RESIDENT_COOKIE, token);
    jest.mocked(getResidentById).mockResolvedValue(null);

    await expectRedirect(() => requireResident(), "/acesso");
  });

  it.each(["sindico", "zelador"] as const)(
    "cargo %s passa pelo mesmo portão",
    async (role) => {
      mockClaims(staffRow.id);
      jest.mocked(getStaffById).mockResolvedValue({ ...staffRow, role });

      await expect(requireStaff()).resolves.toMatchObject({
        kind: "staff",
        id: staffRow.id,
        role,
      });
    }
  );

  it("morador que ainda existe e abre o acesso vai para ocorrências", async () => {
    const token = await signResidentToken({
      residentId: 4,
      email: "ana@condo.com",
    });
    const store = await cookies();
    store.set(RESIDENT_COOKIE, token);
    jest.mocked(getResidentById).mockResolvedValue({
      id: 4,
      name: "Ana Silva",
      email: "ana@condo.com",
      unit: "A 1",
      phone: "11999999999",
      createdAt: new Date("2024-01-01T00:00:00.000Z"),
    });

    await expectRedirect(() => requireResidentOrRedirectHome(), "/ocorrencias");
  });
});
