import { Suspense } from "react";
import { connection } from "next/server";
import { LoginForm } from "./_components/login-form";
import { requireStaffOrRedirectHome } from "@/lib/session";

export default function Page() {
  return (
    <Suspense fallback={<p className="p-6">Carregando...</p>}>
      <LoginContent />
    </Suspense>
  );
}

async function LoginContent() {
  await connection();
  await requireStaffOrRedirectHome();

  return (
    <div className="flex min-h-svh items-center justify-center bg-background p-4">
      <LoginForm />
    </div>
  );
}
