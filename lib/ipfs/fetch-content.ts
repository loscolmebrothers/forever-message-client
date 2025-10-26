import type { IPFSBottle } from '@loscolmebrothers/forever-message-types';

/**
 * Fetch content from IPFS gateway
 * Uses simple HTTP fetch - works both client and server side
 */

const IPFS_GATEWAY = process.env.NEXT_PUBLIC_IPFS_GATEWAY || 'https://storacha.link/ipfs';

/**
 * Fetch bottle content from IPFS by CID
 */
export async function fetchBottleContent(cid: string): Promise<IPFSBottle | null> {
  try {
    const url = `${IPFS_GATEWAY}/${cid}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      // Add timeout for server-side fetches
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    if (!response.ok) {
      console.error(`IPFS fetch failed for ${cid}: ${response.status} ${response.statusText}`);
      return null;
    }

    const data = await response.json();

    // Validate that it's a bottle
    if (data.type !== 'bottle') {
      console.error(`Invalid IPFS content type for ${cid}: ${data.type}`);
      return null;
    }

    return data as IPFSBottle;
  } catch (error) {
    console.error(`Error fetching IPFS content ${cid}:`, error);
    return null;
  }
}

/**
 * Fetch multiple bottle contents in parallel
 */
export async function fetchMultipleBottleContents(cids: string[]): Promise<(IPFSBottle | null)[]> {
  const promises = cids.map(cid => fetchBottleContent(cid));
  return Promise.all(promises);
}
