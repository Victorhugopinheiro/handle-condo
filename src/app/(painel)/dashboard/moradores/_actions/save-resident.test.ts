import { createResidentAction } from "@/app/(painel)/dashboard/moradores/_actions/save-resident";
import {
  createResident,
  getResidentByEmail,
  getStaffByEmail,
} from "@/lib/data/residents";
import { getStaffById } from "@/lib/data/staff";
import { createServerSupabase } from "@/lib/supabase/server";
import { expectRedirect } from "@/test/redirect";

jest.mock("next/server", () => ({
  connection: async () => {},
}));

jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

jest.mock("@/lib/supabase/server", () => ({
  createServerSupabase: jest.fn(),
}));

jest.mock("@/lib/data/staff", () => ({
  getStaffById: jest.fn(),
}));

jest.mock("@/lib/data/residents", () => ({
  getResidentByEmail: jest.fn(),
  getStaffByEmail: jest.fn(),
  getResidentById: jest.fn(),
  createResident: jest.fn(),
  updateResident: jest.fn(),
}));

const input = {
  name: "Ana Silva",
  email: "ana@condo.com",
  unit: "A 12",
  phone: "11999999999",
};

function mockStaff(role: "sindico" | "zelador") {
  jest.mocked(createServerSupabase).mockResolvedValue({
    auth: {
      getClaims: async () => ({
        data: { claims: { sub: "staff-1" } },
      }),
    },
  } as never);
  jest.mocked(getStaffById).mockResolvedValue({
    id: "staff-1",
    name: role === "sindico" ? "Victor" : "Zeca",
    email: "victor@victor.com",
    role,
    createdAt: new Date("2024-01-01T00:00:00.000Z"),
  });
}

describe("cadastro de morador", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(getStaffByEmail).mockResolvedValue(null);
    jest.mocked(getResidentByEmail).mockResolvedValue(null);
    jest.mocked(createResident).mockResolvedValue({
      id: 1,
      ...input,
      createdAt: new Date("2024-01-01T00:00:00.000Z"),
    });
  });

  it("sem funcionário não grava morador", async () => {
    jest.mocked(createServerSupabase).mockResolvedValue({
      auth: {
        getClaims: async () => ({ data: { claims: {} } }),
      },
    } as never);

    await expectRedirect(() => createResidentAction(input), "/login");
    expect(createResident).not.toHaveBeenCalled();
  });

  it("não cria morador com e-mail de funcionário", async () => {
    mockStaff("sindico");
    jest.mocked(getStaffByEmail).mockResolvedValue({
      id: "staff-1",
      name: "Victor",
      email: input.email,
      role: "sindico",
      createdAt: new Date("2024-01-01T00:00:00.000Z"),
    });

    await expect(createResidentAction(input)).resolves.toEqual({
      success: false,
      message: "Este e-mail já está em uso.",
    });
    expect(createResident).not.toHaveBeenCalled();
  });

  it.each(["sindico", "zelador"] as const)(
    "%s cadastra morador pelo mesmo portão",
    async (role) => {
      mockStaff(role);

      await expect(createResidentAction(input)).resolves.toEqual({
        success: true,
        message: "Morador cadastrado.",
      });
      expect(createResident).toHaveBeenCalledWith(input);
    }
  );
});
