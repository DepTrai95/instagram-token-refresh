/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

export default {
	async fetch(request, env, ctx) {
		// just for testing/dev
		// await scheduled(env);
		return new Response("✅  Instagram Token Refresh Worker ausgeführt");
	},

	async scheduled(event, env, ctx) {

	  const url =
		"https://graph.instagram.com/refresh_access_token" +
		"?grant_type=ig_refresh_token" +
		`&access_token=${env.INSTAGRAM_TOKEN}`;

	  const res = await fetch(url);
	  const data = await res.json();

	  console.log("Instagram token refresh result:", data);
	}
};
