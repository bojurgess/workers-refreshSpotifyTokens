/**
 * Welcome to Cloudflare Workers! This is your first scheduled worker.
 *
 * - Run `wrangler dev --local` in your terminal to start a development server
 * - Run `curl "http://localhost:8787/cdn-cgi/mf/scheduled"` to trigger the scheduled event
 * - Go back to the console to see what your worker has logged
 * - Update the Cron trigger in wrangler.toml (see https://developers.cloudflare.com/workers/wrangler/configuration/#triggers)
 * - Run `wrangler publish --name my-worker` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/runtime-apis/scheduled-event/
 */

export interface Env {
	// Example binding to KV. Learn more at https://developers.cloudflare.com/workers/runtime-apis/kv/
	// MY_KV_NAMESPACE: KVNamespace;
	//
	// Example binding to Durable Object. Learn more at https://developers.cloudflare.com/workers/runtime-apis/durable-objects/
	// MY_DURABLE_OBJECT: DurableObjectNamespace;
	//
	// Example binding to R2. Learn more at https://developers.cloudflare.com/workers/runtime-apis/r2/
	// MY_BUCKET: R2Bucket;
}

function strings2base64(x, y) {
  const textEncoder = new TextEncoder();
  const z = x + y
  const zUint = textEncoder.encode(z);
  return new Uint8Array(zUint).toString('base64');
}

async function refreshAccessTokens({ client_id, client_secret, refresh_token }) {
  const host = 'https://accounts.spotify.com'
  const headers = {
    'Authrorization': `Basic ${strings2base64(client_id, client_secret)}`,
    'Content-Type': 'application/x-www-form-urlencoded',
  }
  const body = {
    'grant_type': 'refresh_token',
    refresh_token
  }

  const response = await fetch(`${host}/api/token`, headers, body).then((data) => {
    console.log(response.json())
    return response.json();
  })

  return response;
}

export default {
	async scheduled(
		controller: ScheduledController,
		env: Env,
		ctx: ExecutionContext
	): Promise<void> {

    let {
      CLIENT_ID: client_id,
      CLIENT_SECRET: client_secret,
      REFRESH_TOKEN: refresh_token,
      SPOTTY_KV: kvNamespace,
    } = env

		ctx.waitUntil(refreshAccessTokens({ client_id, client_secret, refresh_token }))
	},
};
