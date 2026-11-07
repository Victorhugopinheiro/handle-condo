import { createResidentOccurrence } from "@/app/(morador)/ocorrencias/_actions/occurrence-actions";
import { getStaffById } from "@/lib/data/staff";
import { createOccurrenceCommand } from "@/lib/occurrences/commands";
import type { OccurrenceFormValues } from "@/lib/occurrences/schema";
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

jest.mock("@/lib/occurrences/commands", () => ({
  addCommentCommand: jest.fn(),
  createOccurrenceCommand: jest.fn(),
  deleteCommentCommand: jest.fn(),
  deleteOccurrenceCommand: jest.fn(),
  editCommentCommand: jest.fn(),
  filesFromForm: jest.fn(() => []),
  updateOccurrenceCommand: jest.fn(),
}));

const input = {
  title: "Lâmpada",
  description: "Queimada no hall",
  categoryId: 1,
  locationKind: "common",
  locationValue: "Hall",
} satisfies OccurrenceFormValues;

describe("ocorrência do morador", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("sem morador não grava ocorrência", async () => {
    await expectRedirect(
      () => createResidentOccurrence(input, new FormData()),
      "/acesso"
    );
    expect(createOccurrenceCommand).not.toHaveBeenCalled();
  });

  it("sessão de funcionário não grava ocorrência de morador", async () => {
    jest.mocked(createServerSupabase).mockResolvedValue({
      auth: {
        getClaims: async () => ({
          data: { claims: { sub: "staff-1" } },
        }),
      },
    } as never);
    jest.mocked(getStaffById).mockResolvedValue({
      id: "staff-1",
      name: "Victor",
      email: "victor@victor.com",
      role: "sindico",
      createdAt: new Date("2024-01-01T00:00:00.000Z"),
    });

    await expectRedirect(
      () => createResidentOccurrence(input, new FormData()),
      "/acesso"
    );
    expect(createOccurrenceCommand).not.toHaveBeenCalled();
  });
});
