import * as cheerio from "cheerio/lib/slim";

export interface BookDetails {
  id: number;
  title: string;
  date: string;
  cover: string;
}

export async function getBooks(startId: number = 1) {
  const data: BookDetails[] = [];

  let trying = 0;

  while (trying < 5) {
    const response = await fetch(
      `https://thuvienkimdong.vn/kd-sach--${startId}.html`,
    );

    if (response.ok) {
      try {
        const htmlString = await response.text();
        const $ = cheerio.load(htmlString);

        let title = $(".anime__details__title>h3").first().text();
        let date = $(".anime__details__widget li:nth-child(2)")
          .first()
          .text()
          .split(":")[1]
          .trim();
        let cover = $(".anime__details__pic").first().attr("data-setbg") || "";

        if (cover.includes("amazonaws")) {
          cover = cover.replace("http://thuvienkimdong.vn/", "");
        }

        data.push({ id: startId, title, date, cover });
      } catch (e) {
        console.error(e);
      }

      trying = 0;

      startId++;
    } else {
      trying++;
    }
  }

  return { data, latestId: startId };
}
