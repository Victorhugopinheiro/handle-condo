type StoredCookie = {
  name: string;
  value: string;
  options?: Record<string, unknown>;
};

const jar = new Map<string, StoredCookie>();

export function resetCookies() {
  jar.clear();
}

export async function cookies() {
  return {
    get(name: string) {
      const cookie = jar.get(name);
      return cookie ? { name: cookie.name, value: cookie.value } : undefined;
    },
    getAll() {
      return [...jar.values()].map(({ name, value }) => ({ name, value }));
    },
    set(name: string, value: string, options?: Record<string, unknown>) {
      jar.set(name, { name, value, options });
    },
    delete(name: string) {
      jar.delete(name);
    },
  };
}

export function readCookie(name: string) {
  return jar.get(name);
}
