const GATEWAYS = [
  "https://ipfs.io/ipfs/",
  "https://dweb.link/ipfs/",
  "https://cloudflare-ipfs.com/ipfs/",
];

export function ipfsToHttp(uri: string, gatewayIndex = 0) {
  if (!uri) return uri;

  if (uri.startsWith("ipfs://")) {
    const path = uri.replace("ipfs://", "");
    const base = GATEWAYS[gatewayIndex] ?? GATEWAYS[0];
    return `${base}${path}`;
  }

  return uri;
}

