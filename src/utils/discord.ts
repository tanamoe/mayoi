import type { RegistryDetails } from "./ppdvn";
import { BookDetails } from "./kimdong";
import { EmbedBuilder } from "@discordjs/builders";

export async function sendWebhook(url: string, content: any) {
	return await fetch(url, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(content),
	});
}

export async function sendKDCWebhook(url: string, data: BookDetails[]) {
	if (data.length === 0) return;

	for (let i = 0; i < data.length; i += 10) {
		const chunk = data.slice(i, i + 10);

		await sendWebhook(url, {
			embeds: chunk.map((book) => ({
				author: {
					name: "Kim Dong Comics",
					icon_url: "https://thuvienkimdong.vn/Contents/img/logo.png",
					url: "https://via.tana.moe/kimdongcomics",
				},
				title: book.title,
				url: `https://thuvienkimdong.vn/kd-sach--${book.id}.html`,
				description: `Ngày phát hành: ${book.date}`,
				color: 15021623,
				image: {
					url: book.cover,
				},
				footer: {
					icon_url: "https://tana.moe/avatar.jpg",
					text: "Đăng ký xuất bản | Tana.moe",
				},
			})),
		});
	}
}

export async function sendRegistriesWebhook(
	url: string,
	data: RegistryDetails[],
) {
	if (data.length === 0) return;

	for (let i = 0; i < data.length; i += 10) {
		const chunk = data.slice(i, i + 10);

		await sendWebhook(url, {
			embeds: chunk.map((registry) => ({
				author: {
					name: "Cục xuất bản",
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
