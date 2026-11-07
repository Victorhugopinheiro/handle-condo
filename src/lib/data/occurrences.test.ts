import { createOccurrenceRecord } from "@/lib/data/occurrences";
import { dataClient } from "@/lib/supabase/data";

jest.mock("@/lib/supabase/data", () => {
  const actual = jest.requireActual(
    "@/lib/supabase/data"
  ) as typeof import("@/lib/supabase/data");
  return { ...actual, dataClient: jest.fn() };
});

const fields = {
  title: "Lâmpada",
  description: "Queimada no hall",
  categoryId: 1,
  locationKind: "common" as const,
  locationValue: "Hall",
};

function mockInsert() {
  const insert = jest.fn();
  const client = {
    from: () => ({
      insert: (payload: unknown) => {
        insert(payload);
        return {
          select: () => ({
            single: async () => ({
              data: { id: 10, code: "OC-0007" },
              error: null,
            }),
          }),
        };
      },
    }),
  };
  jest.mocked(dataClient).mockReturnValue(client as never);
  return insert;
}

describe("createOccurrenceRecord", () => {
  it.each([
    [
      "morador",
      { authorResidentId: 4 },
      { author_resident_id: 4, author_staff_id: null },
    ],
    [
      "funcionário",
      { authorStaffId: "staff-1" },
      { author_staff_id: "staff-1", author_resident_id: null },
    ],
  ] as const)(
    "ocorrência de %s nasce pendente com um autor",
    async (_label, author, storedAuthor) => {
      const insert = mockInsert();

      await expect(
        createOccurrenceRecord({ ...fields, ...author })
      ).resolves.toEqual({
        id: 10,
        code: "OC-0007",
      });

      expect(insert).toHaveBeenCalledWith({
        title: fields.title,
        description: fields.description,
        category_id: fields.categoryId,
        location_kind: fields.locationKind,
        location_value: fields.locationValue,
        status: "pending",
        ...storedAuthor,
      });
      expect(insert.mock.calls[0][0]).not.toHaveProperty("closed_at");
    }
  );
});
