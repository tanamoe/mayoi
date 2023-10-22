import { runRegistriesCheck } from "./jobs/ppdvn";
import { sendWebhook } from "./utils/discord";
import { getBooks } from "./utils/kimdong";

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
        await runRegistriesCheck(env);
        break;
    }
  },
};
