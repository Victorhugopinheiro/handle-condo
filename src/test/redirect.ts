export function redirect(url: string): never {
  const error = new Error(`Redirect to ${url}`);
  Object.assign(error, { url });
  throw error;
}

export async function expectRedirect(run: () => Promise<unknown>, url: string) {
  await expect(run()).rejects.toMatchObject({ url });
}
