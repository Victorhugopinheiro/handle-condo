import { residentAccessAction } from "@/app/(morador)/acesso/_actions/access";
import { RESIDENT_COOKIE } from "@/lib/constants";
import { getResidentByEmail, getStaffByEmail } from "@/lib/data/residents";
import { verifyResidentToken } from "@/lib/resident-token";
import { readCookie } from "@/test/cookies";
import { expectRedirect } from "@/test/redirect";

jest.mock("@/lib/data/residents", () => ({
  getResidentByEmail: jest.fn(),
  getStaffByEmail: jest.fn(),
  createResident: jest.fn(),
}));

const NOT_FOUND = {
  success: false,
  message: "E-mail não encontrado no cadastro.",
};

const resident = {
  id: 4,
  name: "Ana Silva",
  email: "ana@condo.com",
  unit: "A 1",
  phone: "11999999999",
  createdAt: new Date("2024-01-01T00:00:00.000Z"),
};

describe("acesso do morador", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(getStaffByEmail).mockResolvedValue(null);
    jest.mocked(getResidentByEmail).mockResolvedValue(null);
  });

  it("grava o cookie e entra quando o e-mail está cadastrado", async () => {
    jest.mocked(getResidentByEmail).mockResolvedValue(resident);

    await expectRedirect(
      () => residentAccessAction({ email: resident.email }),
      "/ocorrencias"
    );

    const cookie = readCookie(RESIDENT_COOKIE);
    expect(cookie?.value).toEqual(expect.any(String));
    await expect(verifyResidentToken(cookie!.value)).resolves.toMatchObject({
      residentId: resident.id,
      email: resident.email,
    });
    const { createResident } = jest.requireMock("@/lib/data/residents") as {
      createResident: jest.Mock;
    };
    expect(createResident).not.toHaveBeenCalled();
  });

  it("não grava cookie quando o e-mail não existe", async () => {
    await expect(
      residentAccessAction({ email: "sumido@condo.com" })
    ).resolves.toEqual(NOT_FOUND);
    expect(readCookie(RESIDENT_COOKIE)).toBeUndefined();
  });

  it("recusa e-mail de funcionário com a mesma mensagem e sem cookie", async () => {
    jest.mocked(getStaffByEmail).mockResolvedValue({
      id: "staff-1",
      name: "Victor",
      email: "victor@victor.com",
      role: "sindico",
      createdAt: new Date("2024-01-01T00:00:00.000Z"),
    });

    await expect(
      residentAccessAction({ email: "victor@victor.com" })
    ).resolves.toEqual(NOT_FOUND);
    expect(getResidentByEmail).not.toHaveBeenCalled();
    expect(readCookie(RESIDENT_COOKIE)).toBeUndefined();
  });

  it("não grava cookie quando o segredo da sessão não existe", async () => {
    delete process.env.RESIDENT_SESSION_SECRET;
    jest.mocked(getResidentByEmail).mockResolvedValue(resident);

    await expect(
      residentAccessAction({ email: resident.email })
    ).rejects.toThrow("RESIDENT_SESSION_SECRET is not set");
    expect(readCookie(RESIDENT_COOKIE)).toBeUndefined();
  });
});
