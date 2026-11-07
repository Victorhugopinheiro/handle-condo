import { createStaffOccurrence } from "@/app/(painel)/dashboard/ocorrencias/_actions/occurrence-actions";
import { RESIDENT_COOKIE } from "@/lib/constants";
import { getResidentById } from "@/lib/data/residents";
import { createOccurrenceCommand } from "@/lib/occurrences/commands";
import type { OccurrenceFormValues } from "@/lib/occurrences/schema";
import { signResidentToken } from "@/lib/resident-token";
import { createServerSupabase } from "@/lib/supabase/server";
import { cookies } from "@/test/cookies";
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

jest.mock("@/lib/data/residents", () => ({
  getResidentById: jest.fn(),
}));

jest.mock("@/lib/occurrences/commands", () => ({
  addCommentCommand: jest.fn(),
  changeStatusCommand: jest.fn(),
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

function mockNoStaff() {
  jest.mocked(createServerSupabase).mockResolvedValue({
    auth: {
      getClaims: async () => ({ data: { claims: {} } }),
    },
  } as never);
}

describe("ocorrência do funcionário", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockNoStaff();
  });

  it("sem funcionário não grava ocorrência", async () => {
    await expectRedirect(
      () => createStaffOccurrence(input, new FormData()),
      "/login"
    );
    expect(createOccurrenceCommand).not.toHaveBeenCalled();
  });

  it("sessão de morador não grava ocorrência de funcionário", async () => {
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

    await expectRedirect(
      () => createStaffOccurrence(input, new FormData()),
      "/login"
    );
    expect(createOccurrenceCommand).not.toHaveBeenCalled();
  });
});
