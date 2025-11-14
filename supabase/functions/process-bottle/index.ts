// Supabase Edge Function for processing bottle creation
// Triggered by database webhook on bottles_queue table inserts
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

interface QueueRecord {
  id: string;
  message: string;
  user_id: string;
  status: string;
}

Deno.serve(async (req) => {
  try {
    console.log("🔄 Bottle processing triggered");

    // Parse webhook payload from Supabase
    const payload = await req.json();
    const record = payload.record as QueueRecord;

    // Only process if status is 'queued'
    if (record.status !== "queued") {
      console.log(`Skipping ${record.id} - status is ${record.status}`);
      return new Response(JSON.stringify({ skipped: true }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    console.log(`Processing bottle: ${record.id}`);

    // Get Netlify function URL from environment
    const netlifyUrl = Deno.env.get("NETLIFY_FUNCTION_URL");
    if (!netlifyUrl) {
      throw new Error("NETLIFY_FUNCTION_URL not set");
    }

    // Call the Netlify API endpoint that has the full processing logic
    const response = await fetch(`${netlifyUrl}/api/bottles/process`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        queueId: record.id,
        message: record.message,
        userId: record.user_id,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Processing failed: ${errorText}`);
    }

    const result = await response.json();
    console.log(`✅ Bottle ${record.id} processed successfully`);

    return new Response(JSON.stringify(result), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("❌ Processing failed:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
});
