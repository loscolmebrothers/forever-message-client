// Supabase Edge Function for syncing bottles from blockchain
// Runs as CRON job every 10 minutes
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { ethers } from 'https://esm.sh/ethers@6.15.0';

// Blockchain configuration - using environment variables
const CONTRACT_ADDRESS = Deno.env.get('CONTRACT_ADDRESS') || '0x0c925D3Ad30F7dee61A0D3E3bBdcd9069E97d4B1';
const RPC_URL = Deno.env.get('BASE_SEPOLIA_RPC_URL') || 'https://base-sepolia.g.alchemy.com/v2/lYBbh5uL_vSABsjh1e5Gk';
const IPFS_GATEWAY = Deno.env.get('IPFS_GATEWAY') || 'https://storacha.link/ipfs';

// Contract ABI (minimal, just what we need)
const CONTRACT_ABI = [
  'function nextBottleId() view returns (uint256)',
  'function getBottle(uint256 id) view returns (tuple(uint256 id, address creator, string ipfsHash, uint256 createdAt, uint256 expiresAt, bool isForever, bool exists))'
];

// Fetch bottle from blockchain
async function fetchBottleFromBlockchain(contract: ethers.Contract, id: number) {
  try {
    const rawBottle = await contract.getBottle(id);
    if (!rawBottle.exists) {
      return null;
    }
    return {
      id: Number(rawBottle.id),
      creator: rawBottle.creator,
      ipfsHash: rawBottle.ipfsHash,
      createdAt: new Date(Number(rawBottle.createdAt) * 1000),
      expiresAt: new Date(Number(rawBottle.expiresAt) * 1000),
      isForever: rawBottle.isForever
    };
  } catch (error) {
    console.error(`Error fetching bottle ${id}:`, error);
    return null;
  }
}

// Fetch IPFS content
async function fetchIPFSContent(cid: string) {
  try {
    const response = await fetch(`${IPFS_GATEWAY}/${cid}`);
    if (!response.ok) return null;
    const data = await response.json();
    return {
      message: data.message,
      userId: data.userId
    };
  } catch (error) {
    console.error(`Error fetching IPFS ${cid}:`, error);
    return null;
  }
}

// Sleep helper for rate limiting
function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

Deno.serve(async (req) => {
  try {
    console.log('🔄 Starting blockchain sync...');
    console.log(`Using contract: ${CONTRACT_ADDRESS}`);

    // Parse batch parameters from request (optional, for manual syncing)
    const url = new URL(req.url);
    const manualBatchSize = url.searchParams.get('batchSize');
    const manualStartId = url.searchParams.get('startId');

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Initialize blockchain provider and contract
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

    // Get total bottles from blockchain
    const nextBottleId = await contract.nextBottleId();
    const totalBottles = Number(nextBottleId) - 1;

    console.log(`Found ${totalBottles} bottles on blockchain`);

    if (totalBottles === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          synced: 0,
          message: 'No bottles to sync'
        }),
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }

    let startId: number;
    let batchSize: number;

    if (manualStartId && manualBatchSize) {
      // Manual mode: use provided parameters
      startId = parseInt(manualStartId, 10);
      batchSize = parseInt(manualBatchSize, 10);
      console.log(`Manual batch sync: startId=${startId}, batchSize=${batchSize}`);
    } else {
      // Auto mode: find missing bottles
      console.log('Auto mode: finding missing bottles...');

      // Get all existing bottle IDs from Supabase
      const { data: existingBottles } = await supabase
        .from('bottles')
        .select('id')
        .order('id', { ascending: true });

      const existingIds = new Set((existingBottles || []).map((b) => b.id));

      // Find first missing bottles
      const missingIds = [];
      for (let id = 1; id <= totalBottles && missingIds.length < 3; id++) {
        if (!existingIds.has(id)) {
          missingIds.push(id);
        }
      }

      if (missingIds.length === 0) {
        console.log('✅ All bottles already synced!');
        return new Response(
          JSON.stringify({
            success: true,
            synced: 0,
            message: 'All bottles already synced',
            total: totalBottles,
            inDatabase: existingIds.size
          }),
          {
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );
      }

      startId = missingIds[0];
      batchSize = missingIds.length;
      console.log(`Found ${missingIds.length} missing bottles, syncing: ${missingIds.join(', ')}`);
    }

    // Calculate end ID for this batch
    const endId = Math.min(startId + batchSize - 1, totalBottles);
    console.log(`Syncing bottles ${startId} to ${endId}`);

    // Fetch bottles in this batch
    const bottles = [];
    let successCount = 0;
    let failCount = 0;

    for (let id = startId; id <= endId; id++) {
      try {
        const bottle = await fetchBottleFromBlockchain(contract, id);
        if (bottle) {
          bottles.push(bottle);
          successCount++;
        }

        // Add delay every 10 bottles to avoid rate limits
        if (id % 10 === 0) {
          await sleep(100);
          console.log(`Progress: ${id}/${totalBottles} bottles fetched`);
        }
      } catch (error: any) {
        failCount++;
        console.error(`Failed to fetch bottle ${id}:`, error.message);

        // If rate limit, wait longer
        if (error.message?.includes('429') || error.message?.includes('rate')) {
          console.log('Rate limit hit, waiting 2s...');
          await sleep(2000);
        }
      }
    }

    console.log(`Fetched ${successCount} bottles, ${failCount} failed`);

    // Fetch IPFS content and prepare for upsert
    const bottlesToSync = [];
    for (let i = 0; i < bottles.length; i++) {
      const bottle = bottles[i];
      const ipfsContent = await fetchIPFSContent(bottle.ipfsHash);

      bottlesToSync.push({
        id: bottle.id,
        creator: bottle.creator,
        ipfs_hash: bottle.ipfsHash,
        created_at: bottle.createdAt.toISOString(),
        expires_at: bottle.expiresAt.toISOString(),
        is_forever: bottle.isForever,
        message: ipfsContent?.message || null,
        user_id: ipfsContent?.userId || null,
        blockchain_status: 'confirmed',
        last_synced_at: new Date().toISOString()
      });

      if ((i + 1) % 50 === 0) {
        console.log(`Processed ${i + 1}/${bottles.length} bottles`);
      }
    }

    // Upsert to Supabase in batches
    const BATCH_SIZE = 100;
    let syncedCount = 0;

    for (let i = 0; i < bottlesToSync.length; i += BATCH_SIZE) {
      const batch = bottlesToSync.slice(i, i + BATCH_SIZE);

      const { error } = await supabase.from('bottles').upsert(batch, { onConflict: 'id' });

      if (error) {
        console.error(`Error syncing batch:`, error);
      } else {
        syncedCount += batch.length;
        console.log(`Synced batch ${Math.floor(i / BATCH_SIZE) + 1}`);
      }
    }

    const hasMore = endId < totalBottles;
    const nextStartId = endId + 1;

    console.log(`✅ Sync complete: ${syncedCount} bottles synced`);

    return new Response(
      JSON.stringify({
        success: true,
        batch: {
          startId,
          endId,
          size: batchSize
        },
        total: totalBottles,
        fetched: successCount,
        failed: failCount,
        synced: syncedCount,
        hasMore,
        nextStartId: hasMore ? nextStartId : null,
        timestamp: new Date().toISOString()
      }),
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error: any) {
    console.error('❌ Sync failed:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
});
