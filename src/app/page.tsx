import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { APP_NAME, CONDO_NAME } from "@/lib/constants";

export default function Page() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-background p-4">
      <div className="mb-8 text-center">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          {APP_NAME}
        </h1>
        <p className="mt-2 text-muted-foreground">{CONDO_NAME}</p>
      </div>
      <div className="grid w-full max-w-3xl gap-5 md:grid-cols-2">
        <Card className="shadow-[0px_2px_4px_rgba(0,0,0,0.05)]">
          <CardHeader>
            <CardTitle>Área do funcionário</CardTitle>
            <CardDescription>
              Síndico e zelador entram com e-mail e senha.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild size="lg">
              <Link href="/login">Entrar como funcionário</Link>
            </Button>
          </CardContent>
        </Card>
        <Card className="shadow-[0px_2px_4px_rgba(0,0,0,0.05)]">
          <CardHeader>
            <CardTitle>Área do morador</CardTitle>
            <CardDescription>
              Acesso somente com o e-mail já cadastrado.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild size="lg" variant="outline">
              <Link href="/acesso">Entrar como morador</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
