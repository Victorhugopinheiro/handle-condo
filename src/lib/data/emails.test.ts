import { isEmailTaken } from "@/lib/data/emails";
import { getResidentByEmail, getStaffByEmail } from "@/lib/data/residents";

jest.mock("@/lib/data/residents", () => ({
  getResidentByEmail: jest.fn(),
  getStaffByEmail: jest.fn(),
}));

describe("e-mail único", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("considera ocupado o e-mail que já é de funcionário", async () => {
    jest.mocked(getStaffByEmail).mockResolvedValue({
      id: "staff-1",
      name: "Victor",
      email: "victor@victor.com",
      role: "sindico",
      createdAt: new Date("2024-01-01T00:00:00.000Z"),
    });

    await expect(isEmailTaken("victor@victor.com")).resolves.toBe(true);
    expect(getResidentByEmail).not.toHaveBeenCalled();
  });
});
