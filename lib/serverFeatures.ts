import { getServerUrl } from '@/lib/storage';

type ServerInfo = { version?: string };

/** Whether the server advertises a version strictly newer than 2.6. */
export async function supportsBatchEdit(): Promise<boolean> {
  try {
    const base = await getServerUrl();
    if (!base) return false;

    const response = await fetch(`${base.replace(/\/$/, '')}/api/mobile-app/info`, {
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) return false;

    const info = (await response.json()) as ServerInfo;
    return isVersionNewerThan(info.version, [2, 6]);
  } catch {
    return false;
  }
}

function isVersionNewerThan(version: string | undefined, minimum: number[]): boolean {
  if (!version) return false;
  const parts = version.match(/\d+/g)?.map(Number);
  if (!parts?.length) return false;

  for (let index = 0; index < Math.max(parts.length, minimum.length); index += 1) {
    const current = parts[index] ?? 0;
    const required = minimum[index] ?? 0;
    if (current !== required) return current > required;
  }
  return false;
}
