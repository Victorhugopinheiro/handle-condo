import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { getDatabaseUrl } from "@/lib/env";
import * as schema from "./schema";

const globalForDb = globalThis as unknown as {
  sql: ReturnType<typeof postgres> | undefined;
};

function getSql() {
  const url = getDatabaseUrl();

  if (!globalForDb.sql) {
    const withSsl = url.includes("sslmode=")
      ? url
      : `${url}${url.includes("?") ? "&" : "?"}sslmode=require`;
    globalForDb.sql = postgres(withSsl, {
      max: 1,
      prepare: false,
      ssl: "require",
    });
  }

  return globalForDb.sql;
}

export function getDb() {
  return drizzle({ client: getSql(), schema });
}

export const db = new Proxy({} as ReturnType<typeof getDb>, {
  get(_target, prop, receiver) {
    const instance = getDb();
    const value = Reflect.get(instance, prop, receiver);
    return typeof value === "function" ? value.bind(instance) : value;
  },
});
