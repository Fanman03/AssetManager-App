export type MobileInfoResponse = {
  isAppCompatible?: boolean;
};

export async function validateServer(url: string): Promise<boolean> {
  try {
    const normalized = url.replace(/\/+$/, ''); // strip trailing slash
    const r = await fetch(`${normalized}/api/mobile-app/info`, {
      headers: { Accept: 'application/json' },
    });
    if (!r.ok) return false;
    const json = (await r.json()) as MobileInfoResponse;
    return json?.isAppCompatible === true;
  } catch {
    return false;
  }
}