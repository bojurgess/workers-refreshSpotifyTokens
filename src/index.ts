export interface Env {
  SPOTTY_KV: KVNamespace;
  CLIENT_ID: string;
  CLIENT_SECRET: string;
  REFRESH_TOKEN: string;
  UID: number;
}

function strings2base64(x, y) {
  const bytes = new TextEncoder().encode(`${x}:${y}`)

  let binary = ''
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
}

async function refreshAccessTokens({ client_id, client_secret, refresh_token }) {
  const host = 'https://accounts.spotify.com/api/token'

  const response = await fetch(host, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${strings2base64(client_id, client_secret)}`,
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token,
    }),
  }).then((data) => {
    return data.json()
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
      SPOTTY_KV: spottyKv,
      UID: uid,
    } = env

		ctx.waitUntil(refreshAccessTokens({ client_id, client_secret, refresh_token }).then((data) => {
      if (uid === 0) {
        kvNamespace.put('access_token_beno', data.access_token)
      } else if (uid === 1) {
        kvNamespace.put('access_token_aidan', data.access_token)
      }
    }))
	},
};
