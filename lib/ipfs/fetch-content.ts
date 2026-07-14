import type { IPFSBottle } from "@loscolmebrothers/forever-message-types";
import { supabaseAdmin } from "@/lib/supabase/server";

/**
 * Fetch bottle content from Supabase Storage by storage path
 * Server-side only (uses service role key)
 */
export async function fetchBottleContent(
  contentPath: string
): Promise<IPFSBottle | null> {
  try {
    const { data, error } = await supabaseAdmin.storage
      .from("forever-message-bottles")
      .download(contentPath);

    if (error || !data) {
      console.error(`Storage fetch failed for ${contentPath}:`, error?.message);
      return null;
    }

    const text = await data.text();
    const parsed = JSON.parse(text);

    if (parsed.type !== "bottle") {
      console.error(`Invalid content type for ${contentPath}: ${parsed.type}`);
      return null;
    }

    return parsed as IPFSBottle;
  } catch (error) {
    console.error(`Error fetching content ${contentPath}:`, error);
    return null;
  }
}

/**
 * Fetch multiple bottle contents in parallel
 */
export async function fetchMultipleBottleContents(
  contentPaths: string[]
): Promise<(IPFSBottle | null)[]> {
  const promises = contentPaths.map((path) => fetchBottleContent(path));
  return Promise.all(promises);
}
