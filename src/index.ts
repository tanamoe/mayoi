import { sendWebhook } from "./utils/discord";
import { getBooks } from "./utils/kimdong";
import { Publisher, getRegistries } from "./utils/ppdvn";

export interface Env {
	MAYOI_KV: KVNamespace;
	DEBUG_WEBHOOK_URL: string;
	KDC_WEBHOOK_URL: string;
	KIM_WEBHOOK_URL: string;
	TRE_WEBHOOK_URL: string;
	IPM_WEBHOOK_URL: string;
	AMAK_WEBHOOK_URL: string;
	AZ_WEBHOOK_URL: string;
	ICHI_WEBHOOK_URL: string;
	SKY_WEBHOOK_URL: string;
}

export default {
	async scheduled(
		event: ScheduledEvent,
		env: Env,
		ctx: ExecutionContext
	): Promise<void> {
		switch (event.cron) {
			case "0 */6 * * *":
				const lastId = await env.MAYOI_KV.get("last_fetched_id");

				const books = await getBooks(lastId ? parseInt(lastId) : undefined);

				await env.MAYOI_KV.put("last_fetched_id", books.latestId.toString());

				if (books.data.length > 0) {
					for (let i = 0; i < books.data.length; i += 10) {
						const chunk = books.data.slice(i, i + 10);

						await sendWebhook(env.KDC_WEBHOOK_URL, {
							embeds: chunk.map((book) => ({
								author: {
									name: "Kim Dong Comics",
									icon_url: "https://thuvienkimdong.vn/Contents/img/logo.png",
									url: "https://thuvienkimdong.vn/",
								},
								title: book.title,
								description: `Ngày phát hành: ${book.date}`,
								url: `https://thuvienkimdong.vn/kd-sach--${book.id}.html`,
								color: 15021623,
								image: {
									url: book.cover,
								},
								footer: {
									icon_url: "https://tana.moe/avatar.jpg",
									text: "Kim Dong Comics | Tana.moe",
								},
							})),
						});
					}
				}

				console.log("Schduled task: Kim Dong Comics ran");

				break;
			case "0 5-17/12 * * *":
				const lastRegistry = await env.MAYOI_KV.get("last_fetched_registry");

				const registries = await getRegistries(lastRegistry || undefined);

				await env.MAYOI_KV.put(
					"last_fetched_registry",
					registries.latestRegistry
				);

				for (const pub in registries.data) {
					if (registries.data[pub as Publisher].length == 0) break;

					let webhookUrl = env.DEBUG_WEBHOOK_URL;

					// match the webhook url
					switch (pub) {
						case Publisher.Kim_Dong:
							webhookUrl = env.KIM_WEBHOOK_URL;
							break;
						case Publisher.Tre:
							webhookUrl = env.TRE_WEBHOOK_URL;
							break;
						case Publisher.IPM:
							webhookUrl = env.IPM_WEBHOOK_URL;
							break;
						case Publisher.AMAK:
							webhookUrl = env.AMAK_WEBHOOK_URL;
							break;
						case Publisher.AZ:
							webhookUrl = env.AZ_WEBHOOK_URL;
							break;
						case Publisher.Skybooks:
							webhookUrl = env.SKY_WEBHOOK_URL;
							break;
						case Publisher.Ichi:
							webhookUrl = env.ICHI_WEBHOOK_URL;
							break;
					}

					// split to chunk of 10 per webhook
					for (
						let i = 0;
						i < registries.data[pub as Publisher].length;
						i += 10
					) {
						const chunk = registries.data[pub as Publisher].slice(i, i + 10);

						await sendWebhook(webhookUrl, {
							embeds: chunk.map((registry) => ({
								author: {
									name: "Cục Xuất bản",
									url: "https://ppdvn.gov.vn/web/guest/ke-hoach-xuat-ban",
								},
								title: registry.name,
								color: 357020,
								fields: [
									{
										name: "Tác giả",
										value: registry.author,
										inline: true,
									},
									{
										name: "Dịch giả",
										value: registry.translator,
										inline: true,
									},
								],
								footer: {
									icon_url: "https://tana.moe/avatar.jpg",
									text: "Đăng ký xuất bản | Tana.moe",
								},
							})),
						});
					}
				}

				console.log("Scheduled task: Check registries ran");

				break;
		}
	},
};
