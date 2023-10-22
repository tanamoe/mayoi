import * as cheerio from "cheerio/lib/slim";
import { Env } from "..";

const MAX_PAGE = 30;

export enum Publisher {
  Kim_Dong = "kim",
  Tre = "tre",
  IPM = "ipm",
  AMAK = "amak",
  AZ = "az",
  Ichi = "ichi",
  Skybooks = "skybooks",
}

export interface Registries extends Record<Publisher, RegistryDetails[]> {}

export interface RegistryDetails {
  name: string;
  author: string;
  translator: string;
}

export async function getPartnerRegistries(env: Env, results: Registries, publisher: number) {
  let match = await env.MAYOI_KV.get(`last_fetched_registry_${publisher}`);
  let latestRegistry;

  page_loop: for (let i = 1; i <= MAX_PAGE; i++) {
    const response = await fetch(
      `https://ppdvn.gov.vn/web/guest/ke-hoach-xuat-ban?p=${i}&id_nxb=${publisher}`
    );

    if (response.ok) {
      try {
        const htmlString = await response.text();
        const $ = cheerio.load(htmlString);

        for (let row of $("#list_data_return table tbody tr")) {
          // first check: if name matched, and assign latest to the first row
          const name = $(row).find("td:nth-child(3)").text().trim();
          if (!latestRegistry) latestRegistry = name;
          if (match && match != "" && name.includes(match)) break page_loop;

          // second check: if is a "foreign" book that has translator
          const translator = $(row).find("td:nth-child(5)").text().trim();
          if (translator == "") continue;

          // third check: from a known publisher/partner, therefore assign type
          let publisher: Publisher;
          const partner = $(row).find("td:nth-child(8)").text().trim();
          const author = $(row).find("td:nth-child(4)").text().trim();

          if (partner.includes("IPM")) {
            publisher = Publisher.IPM;
          } else if (partner.includes("X.Y.Z") || partner.includes("AMAK")) {
            publisher = Publisher.AMAK;
          } else if (partner.includes("AZ")) {
            publisher = Publisher.AZ;
          } else if (partner.includes("Phú Sĩ")) {
            publisher = Publisher.Ichi;
          } else if (partner.includes("Skybooks")) {
            publisher = Publisher.Skybooks;
          } else {
            continue;
          }

          results[publisher].push({ name, author, translator });
        }
      } catch (e) {
        console.error(e);
      }
    }
  }

  if (!latestRegistry) latestRegistry = match || "";

  await env.MAYOI_KV.put(`last_fetched_registry_${publisher}`, latestRegistry);
}

export async function getPublisherRegistries(env: Env, results: Registries, publisher: number) {
  let match = await env.MAYOI_KV.get(`last_fetched_registry_${publisher}`);
  let latestRegistry;

  page_loop: for (let i = 1; i <= MAX_PAGE; i++) {
    const response = await fetch(
      `https://ppdvn.gov.vn/web/guest/ke-hoach-xuat-ban?p=${i}&id_nxb=${publisher}`
    );

    if (response.ok) {
      try {
        const htmlString = await response.text();
        const $ = cheerio.load(htmlString);

        for (let row of $("#list_data_return table tbody tr")) {
          // first check: if name matched, and assign latest to the first row
          const name = $(row).find("td:nth-child(3)").text().trim();
          if (!latestRegistry) latestRegistry = name;
          if (match && match != "" && name.includes(match)) break page_loop;

          // second check: if is a "foreign" book that has translator
          const translator = $(row).find("td:nth-child(5)").text().trim();
          if (translator == "") continue;

          // third check: from a known publisher/partner, therefore assign type
          let publisher: Publisher;
          const id = $(row).find("td:nth-child(9)").text().trim();
          const author = $(row).find("td:nth-child(4)").text().trim();

          if (id.includes("KĐ")) {
            publisher = Publisher.Kim_Dong;
          } else if (id.includes("Tre")) {
            publisher = Publisher.Tre;
          } else {
            continue;
          }

          results[publisher].push({ name, author, translator });
        }
      } catch (e) {
        console.error(e);
      }
    }
  }

  if (!latestRegistry) latestRegistry = match || "";

  await env.MAYOI_KV.put(`last_fetched_registry_${publisher}`, latestRegistry);
}
