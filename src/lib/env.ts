function required(name: string) {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`${name} is not set`);
  }
  return value;
}

function firstEnv(...names: string[]) {
  for (const name of names) {
    const value = process.env[name]?.trim();
    if (value) {
      return value;
    }
  }
  return undefined;
}

function looksLikeJwt(value: string) {
  return value.startsWith("eyJ") && value.length > 80;
}

function looksLikePublishableKey(value: string) {
  return value.startsWith("sb_publishable_") || looksLikeJwt(value);
}

function looksLikeSecretKey(value: string) {
  return value.startsWith("sb_secret_") || looksLikeJwt(value);
}

export function getSupabaseUrl() {
  return (
    firstEnv("NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_URL") ||
    required("NEXT_PUBLIC_SUPABASE_URL")
  );
}

/** Publishable (`sb_publishable_…`) or legacy anon JWT. */
export function getSupabaseAnonKey() {
  return (
    firstEnv(
      "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
      "NEXT_PUBLIC_SUPABASE_ANON_KEY"
    ) || required("NEXT_PUBLIC_SUPABASE_ANON_KEY")
  );
}

/** Secret (`sb_secret_…`) or legacy service_role JWT. */
export function getSupabaseServiceRoleKey() {
  return (
    firstEnv("SUPABASE_SECRET_KEY", "SUPABASE_SERVICE_ROLE_KEY") ||
    required("SUPABASE_SERVICE_ROLE_KEY")
  );
}

export function getSupabaseConfigError() {
  const url = firstEnv("NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_URL") || "";
  const publishable =
    firstEnv(
      "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
      "NEXT_PUBLIC_SUPABASE_ANON_KEY"
    ) || "";
  const secret =
    firstEnv("SUPABASE_SECRET_KEY", "SUPABASE_SERVICE_ROLE_KEY") || "";

  if (!url.startsWith("https://") || !url.includes("supabase")) {
    return "NEXT_PUBLIC_SUPABASE_URL deve ser a Project URL (https://xxxx.supabase.co) em Settings → General / Data API.";
  }

  if (!looksLikePublishableKey(publishable)) {
    return "Cole a Publishable key (sb_publishable_…) em NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ou NEXT_PUBLIC_SUPABASE_ANON_KEY. Settings → API Keys. Não use a Secret key no browser.";
  }

  if (!secret || !looksLikeSecretKey(secret)) {
    return "Cole a Secret key (sb_secret_…) em SUPABASE_SECRET_KEY ou SUPABASE_SERVICE_ROLE_KEY. Settings → API Keys.";
  }

  if (publishable.startsWith("sb_secret_")) {
    return "A chave pública não pode ser sb_secret_. Use a Publishable key (sb_publishable_…) em NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.";
  }

  return null;
}

/** Postgres URI of the same Supabase project (`postgresql://...`). */
export function getDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL?.trim();
  if (databaseUrl?.startsWith("postgres")) {
    return databaseUrl;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  if (supabaseUrl?.startsWith("postgres")) {
    return supabaseUrl;
  }

  throw new Error(
    "DATABASE_URL must be the Postgres connection string of your Supabase project (postgresql://...), not the https:// API URL."
  );
}
