/**
 * Older servers encoded full web URLs in Data Matrix codes. The mobile client
 * navigates using the asset path, so retain only that path for HTTP(S) URLs.
 */
export function normalizeBarcodeData(data: string): string {
  try {
    const hasProtocol = /^[a-z][a-z\d+.-]*:/i.test(data);
    const protocolRelative = data.startsWith('//');
    // Treat host/path values as URLs too (for example, assets.example.com/ABC123),
    // but do not mistake ordinary slash-delimited barcode data for a hostname.
    const hostWithoutProtocol = /^(?:[a-z\d-]+\.)+[a-z]{2,}(?::\d+)?(?:[/?#]|$)/i.test(data);
    const url = new URL(
      protocolRelative ? `https:${data}` : hasProtocol ? data : hostWithoutProtocol ? `https://${data}` : data,
    );
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return data;

    const path = url.pathname.replace(/^\/+/, '');
    return path || data;
  } catch {
    return data;
  }
}
