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
		// await sendTokenRefreshEmail(env, "✅ Instagram Token Refresh Worker ausgeführt")
		return new Response("✅ Instagram Token Refresh Worker ausgeführt");
	},

	async scheduled(event, env) {
		try {
			const token = env.INSTAGRAM_TOKEN;

			if (!token) {
				console.log("No token configured.");
				return;
			}

			const refreshUrl =
				"https://graph.instagram.com/refresh_access_token" +
				"?grant_type=ig_refresh_token" +
				"&access_token=" + token;

			const res = await fetch(refreshUrl);
			const data = await res.json();

			if (data?.access_token) {
				console.log("Token refreshed successfully");
				await sendTokenRefreshEmail(env, "Instagram Token erfolgreich erneuert");
			} else {
				console.log("Refresh failed", data);
			}

		} catch (err) {
			console.error("Worker error:", err);
			await sendTokenRefreshEmail(env, "Instagram Worker Error: " + err.message);
		}
	}
};

async function sendTokenRefreshEmail(env, message) {
	if (!env.POSTMARK_API_KEY) return;
	const email = env.POSTMARK_EMAIL;

	const res = await fetch("https://api.postmarkapp.com/email", {
		method: "POST",
		headers: {
			"X-Postmark-Server-Token": env.POSTMARK_API_KEY,
			"Content-Type": "application/json"
		},
		body: JSON.stringify({
			From: email,
			To: email,
			Subject: "Instagram Worker Notification",
			TextBody: message
		})
	});

	if (!res.ok) {
		console.error("Postmark Mail Fehler:", await res.text());
	}
}
