export async function sendWebhook(url: string, content: any) {
	return await fetch(url, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(content),
	});
}
