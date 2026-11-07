import { createResidentOccurrence } from "@/app/(morador)/ocorrencias/_actions/occurrence-actions";
import { createOccurrenceCommand } from "@/lib/occurrences/commands";
import type { OccurrenceFormValues } from "@/lib/occurrences/schema";
import { expectRedirect } from "@/test/redirect";

jest.mock("next/server", () => ({
  connection: async () => {},
}));

jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
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

describe("ocorrência do morador", () => {
  it("sem morador não grava ocorrência", async () => {
    const input = {
      title: "Lâmpada",
      description: "Queimada no hall",
      categoryId: 1,
      locationKind: "common",
      locationValue: "Hall",
    } satisfies OccurrenceFormValues;

    await expectRedirect(
      () => createResidentOccurrence(input, new FormData()),
      "/acesso"
    );
    expect(createOccurrenceCommand).not.toHaveBeenCalled();
  });
});
