import { getCategoryById } from "@/lib/data/categories";
import { createOccurrenceRecord } from "@/lib/data/occurrences";
import { uploadOccurrencePhotos } from "@/lib/data/photos";
import { MAX_PHOTOS } from "@/lib/constants";
import { createOccurrenceCommand } from "@/lib/occurrences/commands";
import type { ResidentActor, StaffActor } from "@/lib/types";

jest.mock("@/lib/data/categories", () => ({
  getCategoryById: jest.fn(),
}));

jest.mock("@/lib/data/occurrences", () => ({
  createOccurrenceRecord: jest.fn(),
  deleteOccurrenceRecord: jest.fn(),
  getOccurrenceByCode: jest.fn(),
  getOccurrencePhotos: jest.fn(),
  getOccurrenceStatusById: jest.fn(),
  updateOccurrenceRecord: jest.fn(),
  updateOccurrenceStatus: jest.fn(),
}));

jest.mock("@/lib/data/photos", () => ({
  ...jest.requireActual("@/lib/data/photos"),
  uploadOccurrencePhotos: jest.fn(),
}));

jest.mock("@/lib/data/comments", () => ({
  createComment: jest.fn(),
  deleteComment: jest.fn(),
  getCommentById: jest.fn(),
  updateComment: jest.fn(),
}));

const resident: ResidentActor = {
  kind: "resident",
  id: 4,
  name: "Ana Silva",
  email: "ana@condo.com",
  unit: "A 1",
};

const staff: StaffActor = {
  kind: "staff",
  id: "staff-1",
  name: "Victor",
  email: "victor@victor.com",
  role: "sindico",
};

const valid = {
  title: "Lâmpada",
  description: "Queimada no hall",
  categoryId: 1,
  locationKind: "common" as const,
  locationValue: "Hall",
};

const forged = {
  ...valid,
  authorStaffId: "outro-staff",
  authorResidentId: 99,
  status: "resolved",
  code: "OC-0001",
  closed_at: "2024-01-01T00:00:00.000Z",
};

function imageFile(name: string) {
  return new File([Uint8Array.from([1, 2, 3])], name, { type: "image/png" });
}

describe("criar ocorrência", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(getCategoryById).mockResolvedValue({
      id: 1,
      name: "Manutenção",
      createdAt: new Date("2024-01-01T00:00:00.000Z"),
    });
    jest.mocked(createOccurrenceRecord).mockResolvedValue({
      id: 10,
      code: "OC-0007",
    });
  });

  it("grava o morador da sessão e ignora autor e status do cliente", async () => {
    const result = await createOccurrenceCommand(resident, forged, []);

    expect(result).toMatchObject({ success: true, code: "OC-0007" });
    expect(createOccurrenceRecord).toHaveBeenCalledWith({
      ...valid,
      authorStaffId: undefined,
      authorResidentId: resident.id,
    });
    expect(uploadOccurrencePhotos).not.toHaveBeenCalled();
  });

  it("grava o funcionário da sessão e ignora autor e status do cliente", async () => {
    const result = await createOccurrenceCommand(staff, forged, []);

    expect(result).toMatchObject({ success: true, code: "OC-0007" });
    expect(createOccurrenceRecord).toHaveBeenCalledWith({
      ...valid,
      authorStaffId: staff.id,
      authorResidentId: undefined,
    });
    expect(uploadOccurrencePhotos).not.toHaveBeenCalled();
  });

  it.each([
    ["título vazio", { title: "   " }],
    ["descrição vazia", { description: " " }],
    ["categoria zero", { categoryId: 0 }],
    ["categoria negativa", { categoryId: -1 }],
    ["área comum fora da lista", { locationValue: "apto 101" }],
    ["local livre vazio", { locationKind: "custom", locationValue: "  " }],
  ])("%s não grava", async (_label, override) => {
    const result = await createOccurrenceCommand(
      resident,
      { ...valid, ...override },
      []
    );

    expect(result.success).toBe(false);
    expect(createOccurrenceRecord).not.toHaveBeenCalled();
    expect(uploadOccurrencePhotos).not.toHaveBeenCalled();
  });

  it("categoria inexistente não grava", async () => {
    jest.mocked(getCategoryById).mockResolvedValue(null);

    const result = await createOccurrenceCommand(resident, valid, []);

    expect(result).toEqual({
      success: false,
      message: "Categoria inválida.",
    });
    expect(createOccurrenceRecord).not.toHaveBeenCalled();
    expect(uploadOccurrencePhotos).not.toHaveBeenCalled();
  });

  it("mais de 5 fotos não grava a ocorrência", async () => {
    const files = Array.from({ length: MAX_PHOTOS + 1 }, (_, index) =>
      imageFile(`foto-${index}.png`)
    );

    const result = await createOccurrenceCommand(resident, valid, files);

    expect(result).toEqual({
      success: false,
      message: `No máximo ${MAX_PHOTOS} fotos.`,
    });
    expect(createOccurrenceRecord).not.toHaveBeenCalled();
    expect(uploadOccurrencePhotos).not.toHaveBeenCalled();
  });

  it("arquivo que não é imagem não grava a ocorrência", async () => {
    const files = [
      imageFile("vazamento.png"),
      new File([Uint8Array.from([1])], "nota.pdf", {
        type: "application/pdf",
      }),
    ];

    const result = await createOccurrenceCommand(resident, valid, files);

    expect(result).toEqual({
      success: false,
      message: "Apenas arquivos de imagem são permitidos.",
    });
    expect(createOccurrenceRecord).not.toHaveBeenCalled();
    expect(uploadOccurrencePhotos).not.toHaveBeenCalled();
  });
});
