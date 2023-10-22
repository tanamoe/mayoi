import type { RegistryDetails } from "./ppdvn";

export async function sendWebhook(url: string, content: any) {
  return await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(content),
  });
}

export async function sendRegistriesWebhook(url: string, data: RegistryDetails[]) {
  for (
            let i = 0;
            i < data.length;
            i += 10
          ) {
            const chunk = data.slice(i, i + 10);

            await sendWebhook(url, {
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
