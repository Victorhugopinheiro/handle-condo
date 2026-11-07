import { SignJWT } from "jose";
import { signResidentToken, verifyResidentToken } from "@/lib/resident-token";

describe("token do morador", () => {
  const payload = { residentId: 4, email: "ana@condo.com" };

  it("rejeita token adulterado, expirado ou de outro segredo", async () => {
    const token = await signResidentToken(payload);
    const tampered = `${token.slice(0, -2)}${token.endsWith("a") ? "b" : "a"}`;
    expect(await verifyResidentToken(tampered)).toBeNull();

    const expired = await new SignJWT(payload)
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt(Math.floor(Date.now() / 1000) - 60)
      .setExpirationTime(Math.floor(Date.now() / 1000) - 10)
      .sign(new TextEncoder().encode(process.env.RESIDENT_SESSION_SECRET));
    expect(await verifyResidentToken(expired)).toBeNull();

    process.env.RESIDENT_SESSION_SECRET = "another-resident-session-secret";
    expect(await verifyResidentToken(token)).toBeNull();
  });

  it("sem segredo a verificação falha fechada", async () => {
    delete process.env.RESIDENT_SESSION_SECRET;

    await expect(verifyResidentToken("qualquer-token")).resolves.toBeNull();
  });
});
