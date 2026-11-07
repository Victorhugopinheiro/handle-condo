import { resetCookies } from "@/test/cookies";

const RESIDENT_SECRET = "test-resident-session-secret-value";

beforeEach(() => {
  resetCookies();
  process.env.RESIDENT_SESSION_SECRET = RESIDENT_SECRET;
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "sb_publishable_test";
});
