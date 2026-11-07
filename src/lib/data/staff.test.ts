import { dataClient } from "@/lib/supabase/data";
import { ensureStaffProfile } from "@/lib/data/staff";

jest.mock("@/lib/supabase/data", () => ({
  dataClient: jest.fn(),
  raise(error: { message: string } | null) {
    if (error) {
      throw new Error(error.message);
    }
  },
}));

type StaffDbRow = {
  id: string;
  name: string;
  email: string;
  role: string;
  created_at: string;
};

function mockStaffClient(
  reads: Array<StaffDbRow | null>,
  insertResult?: {
    data: StaffDbRow | null;
    error: { code?: string; message: string } | null;
  }
) {
  const insert = jest.fn();
  let readIndex = 0;
  const client = {
    from: () => ({
      select: () => ({
        eq: () => ({
          maybeSingle: async () => {
            const data = reads[readIndex] ?? null;
            readIndex += 1;
            return { data, error: null };
          },
        }),
      }),
      insert: (payload: unknown) => {
        insert(payload);
        return {
          select: () => ({
            maybeSingle: async () =>
              insertResult ?? { data: null, error: null },
          }),
        };
      },
    }),
  };
  jest.mocked(dataClient).mockReturnValue(client as never);
  return insert;
}

describe("ensureStaffProfile", () => {
  const existing: StaffDbRow = {
    id: "staff-z",
    name: "Zeca Zelador",
    email: "zeca@condo.com",
    role: "zelador",
    created_at: "2024-01-01T00:00:00.000Z",
  };

  it("não altera cargo, nome nem e-mail de um perfil existente", async () => {
    const insert = mockStaffClient([existing]);

    const profile = await ensureStaffProfile({
      id: existing.id,
      email: "outro@condo.com",
      name: "Outro Nome",
    });

    expect(insert).not.toHaveBeenCalled();
    expect(profile).toMatchObject({
      id: existing.id,
      name: existing.name,
      email: existing.email,
      role: "zelador",
    });
  });

  it("cria o perfil como síndico no primeiro acesso", async () => {
    const created: StaffDbRow = {
      id: "staff-new",
      name: "Ana Costa",
      email: "ana@condo.com",
      role: "sindico",
      created_at: "2024-02-01T00:00:00.000Z",
    };
    const insert = mockStaffClient([null], { data: created, error: null });

    const profile = await ensureStaffProfile({
      id: created.id,
      email: " ana@condo.com ",
      name: "Ana Costa",
    });

    expect(insert).toHaveBeenCalledWith({
      id: created.id,
      email: "ana@condo.com",
      name: "Ana Costa",
      role: "sindico",
    });
    expect(profile).toMatchObject({
      id: created.id,
      role: "sindico",
      email: "ana@condo.com",
    });
  });

  it("reutiliza a linha quando o insert conflita", async () => {
    const insert = mockStaffClient([null, existing], {
      data: null,
      error: { code: "23505", message: "duplicate key" },
    });

    const profile = await ensureStaffProfile({
      id: existing.id,
      email: existing.email,
      name: "Nome Novo",
    });

    expect(insert).toHaveBeenCalledTimes(1);
    expect(profile).toMatchObject({
      id: existing.id,
      name: existing.name,
      email: existing.email,
      role: "zelador",
    });
  });
});
