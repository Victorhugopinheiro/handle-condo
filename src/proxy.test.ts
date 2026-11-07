import { NextRequest } from "next/server";
import { RESIDENT_COOKIE } from "@/lib/constants";
import { signResidentToken } from "@/lib/resident-token";
import { proxy } from "@/proxy";

const mockGetClaims = jest.fn();

jest.mock("@supabase/ssr", () => ({
  createServerClient: () => ({
    auth: {
      getClaims: () => mockGetClaims(),
    },
  }),
}));

function request(pathname: string, cookie?: { name: string; value: string }) {
  const req = new NextRequest(`https://condo.test${pathname}`);
  if (cookie) {
    req.cookies.set(cookie.name, cookie.value);
  }
  return req;
}

function redirectPath(response: Response) {
  const location = response.headers.get("location");
  return location ? new URL(location).pathname : null;
}

describe("proxy", () => {
  beforeEach(() => {
    mockGetClaims.mockReset();
    mockGetClaims.mockResolvedValue({ data: { claims: null } });
  });

  it("manda o dashboard sem funcionário para o login", async () => {
    const response = await proxy(request("/dashboard/ocorrencias"));

    expect(redirectPath(response)).toBe("/login");
  });

  it("não devolve o login ao dashboard só porque existe claim", async () => {
    mockGetClaims.mockResolvedValue({ data: { claims: { sub: "staff-1" } } });

    const response = await proxy(request("/login"));

    expect(redirectPath(response)).toBeNull();
  });

  it("não devolve o acesso às ocorrências só porque o token assina", async () => {
    const token = await signResidentToken({
      residentId: 9,
      email: "apagado@condo.com",
    });

    const response = await proxy(
      request("/acesso", { name: RESIDENT_COOKIE, value: token })
    );

    expect(redirectPath(response)).toBeNull();
  });

  it("cookie de morador não abre o dashboard", async () => {
    const token = await signResidentToken({
      residentId: 4,
      email: "ana@condo.com",
    });

    const response = await proxy(
      request("/dashboard/moradores", { name: RESIDENT_COOKIE, value: token })
    );

    expect(redirectPath(response)).toBe("/ocorrencias");
  });

  it("sessão de funcionário não abre as ocorrências do morador", async () => {
    mockGetClaims.mockResolvedValue({ data: { claims: { sub: "staff-1" } } });

    const response = await proxy(request("/ocorrencias"));

    expect(redirectPath(response)).toBe("/dashboard/ocorrencias");
  });
});
